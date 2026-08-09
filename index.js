const {
  Client,
  GatewayIntentBits,
  Events
} = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Groq AI
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const blockedWords = [
  'porn', 'nude', 'sex', 'hentai', 'onlyfans', 'rape',
  'boobs', 'breasts', 'sexy', 'underwear', 'lingerie',
  'bikini', 'topless', 'naked', 'nsfw', 'fetish'
];

const cooldowns = new Map();

// 2-hour memory
const userMemory = new Map();
const MEMORY_TIME = 2 * 60 * 60 * 1000;

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// =========================
// SLASH COMMANDS
// =========================

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'info') {
    await interaction.reply({
      content:
        '🤖 **AI Bot**\\n👤 Creator: **@ayush.rajj**\\n🧠 Memory: **2 hours per user**\\n💬 AI Chat: **Enabled**\\n🖼️ Image Generation: **Enabled**',
      ephemeral: false
    });
  }
});

// =========================
// MESSAGE COMMANDS
// =========================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isImageCommand = message.content.startsWith('!image ');
  const isMention = message.mentions.has(client.user);

  if (!isImageCommand && !isMention) return;

  // Cooldown
  const now = Date.now();
  const last = cooldowns.get(message.author.id) || 0;

  if (now - last < 5000) {
    return message.reply('⏳ Please wait 5 seconds before using the bot again.');
  }

  cooldowns.set(message.author.id, now);

  // =========================
  // IMAGE
  // =========================
  if (isImageCommand) {
    const promptText = message.content.slice(7).trim();

    if (!promptText) {
      return message.reply('Please provide a prompt.');
    }

    const lower = promptText.toLowerCase();

    if (blockedWords.some(w => lower.includes(w))) {
      return message.reply('❌ NSFW or inappropriate image prompts are not allowed.');
    }

    const prompt = encodeURIComponent(promptText);

    const imageUrl =
      `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&model=flux`;

    return message.reply({
      embeds: [
        {
          title: '🎨 AI Generated Image',
          description: promptText,
          image: { url: imageUrl },
          color: 0x00FFFF
        }
      ]
    });
  }

  // =========================
  // TEXT AI
  // =========================
  const question = message.content
    .replace(/<@!?\\\\d+>/, '')
    .trim();

  if (!question) {
    return message.reply('Ask me something!');
  }

  const lower = question.toLowerCase();

  if (blockedWords.some(w => lower.includes(w))) {
    return message.reply('❌ NSFW or inappropriate questions are not allowed.');
  }

  const wantsDetailed = /(detailed|detail|explain fully|full explanation|long answer|elaborate|in depth)/i.test(question);

  const systemPrompt = wantsDetailed
    ? 'You are a helpful, family-friendly Discord assistant. Give a clear and detailed explanation with examples when useful.'
    : 'You are a helpful, family-friendly Discord assistant. Keep answers short and useful (2-4 lines unless the user asks for detail).';

  try {
    await message.channel.sendTyping();

    let history = userMemory.get(message.author.id);

    if (!history || (Date.now() - history.lastUsed) > MEMORY_TIME) {
      history = {
        messages: [],
        lastUsed: Date.now()
      };
    }

    history.messages.push({
      role: 'user',
      content: question
    });

    history.messages = history.messages.slice(-10);

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.messages
    ];

    const response = await ai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages,
      max_tokens: wantsDetailed ? 500 : 120
    });

    const answer = response.choices[0].message.content;

    history.messages.push({
      role: 'assistant',
      content: answer
    });

    history.lastUsed = Date.now();
    userMemory.set(message.author.id, history);

    await message.reply(answer);

  } catch (error) {
    console.error(error);
    await message.reply('⚠️ Sorry, I could not answer that.');
  }
});

client.login(process.env.DISCORD_TOKEN);

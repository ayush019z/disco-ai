const { Client, GatewayIntentBits } = require('discord.js');
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

// Block inappropriate text and image prompts
const blockedWords = [
  'porn', 'nude', 'sex', 'hentai', 'onlyfans', 'rape',
  'boobs', 'breasts', 'sexy', 'underwear', 'lingerie',
  'bikini', 'topless', 'naked', 'nsfw', 'fetish'
];

// Simple cooldown (5 seconds)
const cooldowns = new Map();

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check if this message is actually for the bot
  const isImageCommand = message.content.startsWith('!image ');
  const isMention = message.mentions.has(client.user);

  // Ignore all other messages
  if (!isImageCommand && !isMention) return;

  // =========================
  // COOLDOWN (only for bot usage)
  // =========================
  const now = Date.now();
  const last = cooldowns.get(message.author.id) || 0;

  if (now - last < 5000) {
    return message.reply('⏳ Please wait 5 seconds before using the bot again.');
  }

  cooldowns.set(message.author.id, now);

  // =========================
  // IMAGE GENERATION
  // =========================
  if (isImageCommand) {
    const promptText = message.content.slice(7).trim();

    if (!promptText) {
      return message.reply('Please provide a prompt.');
    }

    const lower = promptText.toLowerCase();

    // Block NSFW prompts
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

  // Block NSFW text
  if (blockedWords.some(w => lower.includes(w))) {
    return message.reply('❌ NSFW or inappropriate questions are not allowed.');
  }

  // Detect if the user wants a detailed answer
  const wantsDetailed = /(detailed|detail|explain fully|full explanation|long answer|elaborate|in depth)/i.test(question);

  const systemPrompt = wantsDetailed
    ? 'You are a helpful, family-friendly Discord assistant. Give a clear and detailed explanation with examples when useful.'
    : 'You are a helpful, family-friendly Discord assistant. Keep answers short and useful (2-4 lines unless the user asks for detail).';

  try {
    await message.channel.sendTyping();

    const response = await ai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: wantsDetailed ? 500 : 120
    });

    const answer = response.choices[0].message.content;

    await message.reply(answer);

  } catch (error) {
    console.error(error);
    await message.reply('⚠️ Sorry, I could not answer that.');
  }
});

client.login(process.env.DISCORD_TOKEN);

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

// =========================
// GROQ AI
// =========================
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// =========================
// BLOCKED WORDS
// =========================
const blockedWords = [
  'porn', 'nude', 'sex', 'hentai', 'onlyfans', 'rape',
  'boobs', 'breasts', 'sexy', 'underwear', 'lingerie',
  'bikini', 'topless', 'naked', 'nsfw', 'fetish'
];

// =========================
// STATS
// =========================
let messagesAnswered = 0;
let imagesGenerated = 0;
const uniqueUsers = new Set();
const startTime = Date.now();

// =========================
// COOLDOWN
// =========================
const cooldowns = new Map();

// =========================
// MEMORY (2 HOURS)
// =========================
const userMemory = new Map();
const MEMORY_TIME = 2 * 60 * 60 * 1000;

// =========================
// READY
// =========================
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// =========================
// SLASH COMMANDS
// =========================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // /info
  if (interaction.commandName === 'info') {
    await interaction.reply({
      embeds: [
        {
          title: '🤖 AI Bot',
          description:
            'A smart Discord assistant with temporary memory, AI chat, and image generation.',
          color: 0x00FFFF,
          thumbnail: {
            url: client.user.displayAvatarURL()
          },
          fields: [
            {
              name: '👤 Creator',
              value: '<@773574818121383958>',
              inline: true
            },
            {
              name: '🧠 Memory',
              value: '2 hours per user',
              inline: true
            },
            {
              name: '💬 AI Chat',
              value: 'Enabled',
              inline: true
            },
            {
              name: '🖼️ Image Generation',
              value: 'Enabled',
              inline: true
            },
            {
              name: '⚡ Reply Style',
              value: 'Short by default, detailed when asked.',
              inline: false
            }
          ],
          footer: {
            text: 'Made with Discord.js + Groq'
          },
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  // /help
  if (interaction.commandName === 'help') {
    await interaction.reply({
      embeds: [
        {
          title: '📚 AI Bot Help',
          description: 'Here are all available commands and how to use them.',
          color: 0x00FFFF,
          fields: [
            {
              name: '💬 Ask the AI',
              value: '`@Ai-bot what is gravity?`',
              inline: false
            },
            {
              name: '📖 Detailed answer',
              value: '`@Ai-bot explain gravity in detail`',
              inline: false
            },
            {
              name: '🖼️ Generate an image',
              value: '`!image futuristic cricket stadium`',
              inline: false
            },
            {
              name: '📄 Summarize a message',
              value: 'Reply to a message with `@Ai-bot summarize`',
              inline: false
            },
            {
              name: '🧠 Forget memory',
              value: '`@Ai-bot forget everything I said`',
              inline: false
            },
            {
              name: 'ℹ️ Bot information',
              value: '`/info`',
              inline: false
            },
            {
              name: '📊 Bot statistics',
              value: '`/stats`',
              inline: false
            }
          ],
          footer: {
            text: 'Created by @ayush.rajj'
          },
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  // /stats
  if (interaction.commandName === 'stats') {
    const ping = client.ws.ping;
    const uptimeMs = Date.now() - startTime;
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);

    let status = '🟢 Excellent';
    if (ping > 80) status = '🟡 Good';
    if (ping > 150) status = '🔴 Slow';

    await interaction.reply({
      embeds: [
        {
          title: '📊 AI Bot Stats',
          color: 0x00FFFF,
          fields: [
            { name: '💬 Messages', value: String(messagesAnswered), inline: true },
            { name: '🖼️ Images', value: String(imagesGenerated), inline: true },
            { name: '👥 Users', value: String(uniqueUsers.size), inline: true },
            { name: '📶 Ping', value: `${ping} ms`, inline: true },
            { name: '⚡ Status', value: status, inline: true },
            { name: '⏱️ Uptime', value: `${hours}h ${minutes}m`, inline: true }
          ],
          footer: {
            text: 'Made by @ayush.rajj'
          },
          timestamp: new Date().toISOString()
        }
      ]
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

  // Ignore all other messages
  if (!isImageCommand && !isMention) return;

  uniqueUsers.add(message.author.id);

  // =========================
  // COOLDOWN
  // =========================
  const now = Date.now();
  const last = cooldowns.get(message.author.id) || 0;

  if (now - last < 5000) {
    return message.reply('⏳ Please wait 5 seconds before using the bot again.');
  }

  cooldowns.set(message.author.id, now);

  // Remove mention from text
  const question = message.content
    .replace(/<@!?\\\\d+>/, '')
    .trim();

  const lower = question.toLowerCase();

  // =========================
  // SUMMARIZE REPLIED MESSAGE
  // =========================
  const isSummaryRequest =
  (lower === 'summarize' || lower === 'summarise') &&
  message.reference &&
  message.reference.messageId;

if (isSummaryRequest) {
  try {
    // Fetch the message being replied to
    const repliedMessage = await message.channel.messages.fetch(
      message.reference.messageId
    );

    if (!repliedMessage || !repliedMessage.content) {
      return message.reply('⚠️ That message has no text to summarize.');
    }

    await message.channel.sendTyping();

    const response = await ai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Summarize the following message in 3-5 concise bullet points.'
        },
        {
          role: 'user',
          content: repliedMessage.content
        }
      ],
      max_tokens: 120
    });

    return message.reply(response.choices[0].message.content);

  } catch (error) {
    console.error(error);
    return message.reply('⚠️ Could not summarize that message.');
  }
}

  // =========================
  // FORGET MEMORY
  // =========================
  if (lower === 'forget everything i said') {
    userMemory.delete(message.author.id);
    return message.reply('🧠 I have forgotten our previous conversation.');
  }

  // =========================
  // PING WHEN ONLY MENTIONED
  // =========================
  if (!question) {
    const ping = client.ws.ping;

    let status = '🟢 Excellent';
    if (ping > 80) status = '🟡 Good';
    if (ping > 150) status = '🔴 Slow';

    return message.reply({
      embeds: [
        {
          title: '🤖 AI Bot Status',
          color: ping > 150 ? 0xFF0000 : ping > 80 ? 0xFFFF00 : 0x00FFAA,
          thumbnail: {
            url: client.user.displayAvatarURL()
          },
          fields: [
            {
              name: '📶 Ping',
              value: `**${ping} ms**`,
              inline: true
            },
            {
              name: '⚡ Status',
              value: `**${status}**`,
              inline: true
            },
            {
              name: '🧠 Memory',
              value: '**2h active**',
              inline: true
            }
          ],
          footer: {
            text: 'Mention me with a question to start chatting'
          },
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  // =========================
  // IMAGE GENERATION
  // =========================
  if (isImageCommand) {
    if (blockedWords.some(w => lower.includes(w))) {
      return message.reply('❌ NSFW or inappropriate image prompts are not allowed.');
    }

    const prompt = encodeURIComponent(question);

    const imageUrl =
      `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&model=flux`;

    imagesGenerated++;

    return message.reply({
      embeds: [
        {
          title: '🎨 AI Generated Image',
          description: question,
          image: { url: imageUrl },
          color: 0x00FFFF
        }
      ]
    });
  }

  // =========================
  // BLOCK NSFW TEXT
  // =========================
  if (blockedWords.some(w => lower.includes(w))) {
    return message.reply('❌ NSFW or inappropriate questions are not allowed.');
  }

  // Detailed mode
  const wantsDetailed =
    /(detailed|detail|explain fully|full explanation|long answer|elaborate|in depth)/i
      .test(question);

  const systemPrompt = wantsDetailed
    ? 'You are a helpful, family-friendly Discord assistant. Give a clear and detailed explanation with examples when useful.'
    : 'You are a helpful, family-friendly Discord assistant. Keep answers short and useful (2-4 lines unless the user asks for detail).';

  try {
    await message.channel.sendTyping();

    // MEMORY
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
      {
        role: 'system',
        content: systemPrompt
      },
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

    messagesAnswered++;

    await message.reply({
      content: answer
    });

  } catch (error) {
    console.error(error);
    await message.reply('⚠️ Sorry, I could not answer that.');
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.DISCORD_TOKEN);

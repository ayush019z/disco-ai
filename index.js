const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Groq AI (free tier)
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// Simple NSFW filter
const blockedWords = [
  'porn', 'nude', 'sex', 'hentai', 'onlyfans', 'rape'
];

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // =========================
// IMAGE GENERATION COMMAND
// =========================
if (message.content.startsWith('!image ')) {
  const promptText = message.content.slice(7).trim();

  if (!promptText) {
    return message.reply('Please provide a prompt.');
  }

  const lower = promptText.toLowerCase();

  if (blockedWords.some(word => lower.includes(word))) {
    return message.reply('❌ NSFW prompts are not allowed.');
  }

  const prompt = encodeURIComponent(promptText);

  const imageUrl =
    `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&model=flux`;

  return message.reply({
    embeds: [
      {
        image: { url: imageUrl }
      }
    ]
  });
}

  // =========================
  // TEXT AI (MENTION BOT)
  // =========================
  if (!message.mentions.has(client.user)) return;

  const question = message.content
    .replace(/<@!?\\\\d+>/, '')
    .trim();

  if (!question) {
    return message.reply('Ask me something!');
  }

  const lower = question.toLowerCase();

  if (blockedWords.some(word => lower.includes(word))) {
    return message.reply('❌ NSFW or inappropriate questions are not allowed.');
  }

  try {
    await message.channel.sendTyping();

    const response = await ai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Discord assistant.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 300
    });

    const answer = response.choices[0].message.content;

    await message.reply(answer);

  } catch (error) {
    console.error(error);
    await message.reply('Sorry, I could not answer that.');
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);

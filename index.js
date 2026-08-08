const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Groq works with the OpenAI SDK
const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Respond only when the bot is mentioned
  if (!message.mentions.has(client.user)) return;

  // Remove the mention from the message
  const question = message.content
    .replace(/<@!?\\d+>/, '')
    .trim();

  if (!question) {
    return message.reply('Ask me something!');
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


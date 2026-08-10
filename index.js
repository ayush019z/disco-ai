require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes
} = require('discord.js');

const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const userMemory = new Map();
const cooldowns = new Map();

let messagesAnswered = 0;
let imagesGenerated = 0;

const commands = [
  { name: 'help', description: 'Show bot commands' },
  { name: 'stats', description: 'Show bot statistics' },
  { name: 'info', description: 'Show bot information' }
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log('Slash commands registered');
  } catch (err) {
    console.error(err);
  }
});
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
    const embed = {
      title: '🤖 AI Bot Help',
      description:
        '💬 **AI Chat**\nMention the bot with a question\n\n' +
        '🖼️ **Image**\n`!image prompt`\n\n' +
        '📄 **Summarize**\nReply with `!sum`\n\n' +
        '🏏 **Super Over**\n`!superover`\n\n' +
        '🧠 **Forget memory**\n`@Ai-bot forget everything I said`',
      color: 0x00FFFF
    };

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'stats') {
    const embed = {
      title: '📊 Bot Stats',
      fields: [
        { name: '💬 Messages answered', value: String(messagesAnswered), inline: true },
        { name: '🖼️ Images generated', value: String(imagesGenerated), inline: true },
        { name: '🧠 Users with memory', value: String(userMemory.size), inline: true }
      ],
      color: 0x00FFFF
    };

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'info') {
    const embed = {
      title: 'ℹ️ Bot Information',
      fields: [
        { name: '🤖 Name', value: client.user.username, inline: true },
        { name: '🆔 ID', value: client.user.id, inline: true },
        { name: '🏓 Ping', value: `${client.ws.ping} ms`, inline: true },
        { name: '⚙️ Node.js', value: process.version, inline: true },
        { name: '💾 Memory users', value: String(userMemory.size), inline: true },
        { name: '📨 Messages answered', value: String(messagesAnswered), inline: true }
      ],
      color: 0x00FFFF,
      footer: { text: 'Railway • Discord.js v14' },
      timestamp: new Date().toISOString()
    };

    return interaction.reply({ embeds: [embed] });
  }
});
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content === '!superover') {
    const outcomes = ['0', '1', '2', '3', '4', '6', 'W'];

    const balls = [];
    let score = 0;
    let wickets = 0;

    for (let i = 1; i <= 6; i++) {
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      balls.push({ ball: i, result });

      if (result === 'W') wickets++;
      else score += parseInt(result);
    }

    const embed = {
      title: '🏏 Super Over',
      fields: balls.map(b => ({
        name: `Ball ${b.ball}`,
        value: b.result === 'W' ? '💥 WICKET' : `${b.result}️⃣`,
        inline: true
      })),
      color: 0x00FFFF
    };

    embed.fields.push({
      name: 'Final',
      value: `**${score}/${wickets}**`,
      inline: false
    });

    return message.reply({ embeds: [embed] });
  }

  if (content === '!sum') {
    if (!message.reference) {
      return message.reply('Reply to a message with `!sum`.');
    }

    const ref = await message.channel.messages.fetch(message.reference.messageId);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Summarize this text briefly.' },
        { role: 'user', content: ref.content }
      ]
    });

    return message.reply(completion.choices[0].message.content);
  }

  const isImageCommand = content.toLowerCase().startsWith('!image ');
  const question = isImageCommand ? content.slice(7).trim() : content;

  if (isImageCommand) {
    const now = Date.now();
    const last = cooldowns.get(message.author.id) || 0;

    if (now - last < 5000) {
      return message.reply('🖼️ Wait 5 seconds before another image.');
    }

    cooldowns.set(message.author.id, now);

    const wait = await message.reply('🎨 Generating image...');

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(question)}?width=1024&height=1024&nologo=true&model=flux`;

    imagesGenerated++;

    return wait.edit({
      content: null,
      embeds: [{
        title: '🎨 AI Image',
        description: question,
        image: { url: imageUrl },
        color: 0x00FFFF
      }]
    });
  }
   const mentioned = message.mentions.has(client.user);

  if (!mentioned) return;

  const cleanQuestion = content.replace(/<@!?\d+>/g, '').trim();

  if (!cleanQuestion) return;

  if (cleanQuestion.toLowerCase().includes('forget everything')) {
    userMemory.delete(message.author.id);
    return message.reply('🧠 I forgot our conversation history.');
  }

  try {
    const history = userMemory.get(message.author.id) || {
      messages: [],
      lastUsed: Date.now()
    };

    / ===== AI (Groq) ===== const { Groq } = require('groq-sdk'); const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); async function askAI(prompt, userId) { try { const completion = await groq.chat.completions.create({ model: 'llama-3.1-8b-instant', messages: [ { role: 'system', content: 'You are Crix AI, a helpful cricket assistant for Discord.' }, { role: 'user', content: prompt } ], temperature: 0.7, max_tokens: 400 }); return completion.choices[0]?.message?.content || 'No response.'; } catch (err) { console.error('Groq AI Error:', err); return '⚠️ AI is temporarily unavailable.'; } }

client.login(process.env.DISCORD_TOKEN);


const {
Client,
GatewayIntentBits,
Events,
SlashCommandBuilder,
REST,
Routes
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
'topless', 'naked', 'nsfw', 'fetish'
];

// =========================
// GLOBAL STORAGE
// =========================
const cooldowns = new Map();
const userMemory = new Map();
const greetedUsers = new Set();
const activeSuperOvers = new Map();

let activeBatBattle = null;

const MEMORY_TIME = 2 * 60 * 60 * 1000;

// =========================
// STATS
// =========================
let messagesAnswered = 0;
let imagesGenerated = 0;
const uniqueUsers = new Set();
const startTime = Date.now();

// =========================
// READY
// =========================
client.once(Events.ClientReady, () => {
console.log(`Logged in as ${client.user.tag}`);
});
const commands = [
new SlashCommandBuilder()
.setName('info')
.setDescription('Show bot information'),

new SlashCommandBuilder()
.setName('help')
.setDescription('Show all commands'),

new SlashCommandBuilder()
.setName('stats')
.setDescription('Show bot statistics')
].map(c => c.toJSON());

const rest = new REST({ version: '10' })
.setToken(process.env.DISCORD_TOKEN);

(async () => {
try {
await rest.put(
Routes.applicationCommands(process.env.CLIENT_ID),
{ body: commands }
);
console.log('Slash commands registered.');
} catch (err) {
console.error(err);
}
})();

client.on(Events.InteractionCreate, async interaction => {
if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'info') {
return interaction.reply({
embeds: [{
title: '🤖 AI Bot',
color: 0x00FFFF,
thumbnail: {
url: client.user.displayAvatarURL()
},
fields: [
{ name: '👤 Creator', value: '<@773574818121383958>', inline: true },
{ name: '🧠 Memory', value: '2 hours', inline: true },
{ name: '🖼️ Images', value: 'Enabled', inline: true },
{ name: '🏏 Games', value: '!so, !batbattle', inline: true }
 ],
footer: { text: 'Made by Ayush' }
}]
});
}

if (interaction.commandName === 'help') {
return interaction.reply({
embeds: [{
title: '📚 AI Bot Help',
color: 0x00FFFF,
description:
'AI Chat\nMention the bot with a question\n\n' +
'Image\n!image prompt\n\n' +
'Summarize\nReply with !sum\n\n' +
'Super Over\n!so\n\n' +
'Bat Battle\n!batbattle\n\n' +
'Forget memory\n@Ai-bot forget everything I said'
}]
});
}

if (interaction.commandName === 'stats') {
const ping = client.ws.ping;
const uptimeMs = Date.now() - startTime;
const hours = Math.floor(uptimeMs / 3600000);
const minutes = Math.floor((uptimeMs % 3600000) / 60000);

return interaction.reply({
embeds: [{
title: '📊 Bot Stats',
color: 0x00FFFF,
fields: [
  { name: '💬 Messages', value: String(messagesAnswered), inline: true },
  { name: '🖼️ Images', value: String(imagesGenerated), inline: true },
  { name: '👥 Users', value: String(uniqueUsers.size), inline: true },
  { name: '📶 Ping', value: `${ping} ms`, inline: true },
  { name: '⏱️ Uptime', value: `${hours}h ${minutes}m`, inline: true }
]
}]
});
}
});
client.on('messageCreate', async (message) => {
if (message.author.bot) return;

// Greeting
if (
(message.mentions.has(client.user) || message.content.startsWith('!image ')) &&
!greetedUsers.has(message.author.id)
) {
greetedUsers.add(message.author.id);

await message.reply(
'👋 Hi! I’m AI Bot.\n\n' +
'💬 Mention me to ask anything\n' +
'🖼️ Use !image prompt\n' +
'📄 Reply with !sum\n' +
'🏏 Play !so or !batbattle\n' +
'ℹ️ Use /help for all features'
);
}

// =========================
// SUMMARY
// =========================
if (
message.reference?.messageId &&
(message.content.toLowerCase() === '!sum' ||
message.content.toLowerCase() === '!summary')
) {
try {
const replied = await message.channel.messages.fetch(
message.reference.messageId
);

if (!replied.content) {
return message.reply('⚠️ No text to summarize.');
}

const response = await ai.chat.completions.create({
model: 'llama-3.3-70b-versatile',
messages: [
{
role: 'system',
content: 'Summarize in 3-5 short bullet points.'
},
{
role: 'user',
content: replied.content
}
 ],
max_tokens: 150
});

return message.reply(response.choices[0].message.content);
} catch (e) {
console.error(e);
return message.reply('⚠️ Could not summarize that message.');
}
}

// =========================
// SUPER OVER
// =========================
if (message.content.toLowerCase() === '!so') {
const outcomes = [0, 1, 2, 3, 4, 6];
let score = 0;
let wickets = 0;
const balls = [];

for (let i = 0; i < 5; i++) {
if (Math.random() < 0.12) {
wickets++;
balls.push('W');
if (wickets === 2) break;
} else {
const run = outcomes[Math.floor(Math.random() * outcomes.length)];
score += run;
balls.push(run);
}
}

const target = score + Math.floor(Math.random() * 6) + 1;
const needed = target - score;

activeSuperOvers.set(message.author.id, {
target,
score,
wickets,
expires: Date.now() + 15000
});

return message.reply({
  embeds: [{
    title: '🏏 Super Over',
    description: `**Target:** ${target}`,
    color: 0x00FFFF,
    fields: [
      {
        name: 'First 5 Balls',
        value: balls.join(' • ')
      },
      {
        name: 'Score',
        value: `**${score}/${wickets}**`,
        inline: true
      },
      {
        name: 'Need',
        value: `**${needed} off 1**`,
        inline: true
      },
      {
        name: 'Type your shot',
        value: '`defensive`\\n`drive`\\n`loft`\\n`scoop`'
      }
    ],
    footer: {
      text: 'Reply within 15 seconds'
    }
  }]
});
}

if (['defensive', 'drive', 'loft', 'scoop'].includes(message.content.toLowerCase())) {
const game = activeSuperOvers.get(message.author.id);

if (game && Date.now() <= game.expires) {
activeSuperOvers.delete(message.author.id);

const shot = message.content.toLowerCase();
// =========================
// SUPER OVER GAME (Replace your old one with this)
// =========================
const activeSuperOvers = new Map();

// Start game
if (message.content.toLowerCase() === '!superover') {
  const outcomes = [0, 1, 2, 3, 4, 6];
  let score = 0;
  let wickets = 0;
  const balls = [];

  // First 5 balls
  for (let i = 0; i < 5; i++) {
    const outChance = Math.random();

    if (outChance < 0.12) {
      wickets++;
      balls.push('W');
      if (wickets === 2) break;
    } else {
      const run = outcomes[Math.floor(Math.random() * outcomes.length)];
      score += run;
      balls.push(run);
    }
  }

  // Always need at least 1 run on last ball
  const target = score + Math.floor(Math.random() * 6) + 1;
  const needed = target - score;

  // Save game for this user
  activeSuperOvers.set(message.author.id, {
    target,
    score,
    wickets,
    balls,
    expires: Date.now() + 15000 // 15 sec
  });

  return message.reply({
    embeds: [{
      title: '🏏 Super Over',
      description: `**Target:** ${target}`,
      color: 0x00FFFF,
      fields: [
        {
          name: 'First 5 Balls',
          value: balls.join(' • '),
          inline: false
        },
        {
          name: 'Score',
          value: `**${score}/${wickets}**`,
          inline: true
        },
        {
          name: 'Need',
          value: `**${needed} off 1 ball**`,
          inline: true
        },
        {
          name: 'Type your shot',
          value:
            '`defensive` 🛡️\n' +
            '`drive` 🏏\n' +
            '`loft` 🚀\n' +
            '`scoop` 🪄',
          inline: false
        }
      ],
      footer: {
        text: 'Reply with defensive, drive, loft, or scoop within 15 seconds'
      }
    }]
  });
}

// Handle final shot
if (['defensive', 'drive', 'loft', 'scoop'].includes(message.content.toLowerCase())) {
  const game = activeSuperOvers.get(message.author.id);

  if (!game || Date.now() > game.expires) {
    return;
  }

  activeSuperOvers.delete(message.author.id);

  const shot = message.content.toLowerCase();

  let finalBall;

  // Risk / reward
  if (shot === 'defensive') {
    finalBall = [0, 1, 1, 2, 2, 'W'][Math.floor(Math.random() * 6)];
  } else if (shot === 'drive') {
    finalBall = [0, 1, 2, 3, 4, 'W'][Math.floor(Math.random() * 6)];
  } else if (shot === 'loft') {
    finalBall = [0, 0, 2, 4, 6, 'W'][Math.floor(Math.random() * 6)];
  } else {
    // scoop
    finalBall = [0, 0, 4, 6, 6, 'W'][Math.floor(Math.random() * 6)];
  }

  let finalScore = game.score;
  let finalWickets = game.wickets;

  if (finalBall === 'W') {
    finalWickets++;
  } else {
    finalScore += finalBall;
  }

  const won = finalScore >= game.target;

  return message.reply({
    embeds: [{
      title: '🏏 Final Ball',
      color: won ? 0x00FF88 : 0xFF4444,
      fields: [
        {
          name: 'Shot',
          value:
            shot === 'defensive' ? '🛡️ Defensive' :
            shot === 'drive' ? '🏏 Straight Drive' :
            shot === 'loft' ? '🚀 Lofted Shot' :
            '🪄 Scoop',
          inline: true
        },
        {
          name: 'Ball 6',
          value: finalBall === 'W' ? '💥 WICKET' : `**${finalBall}**`,
          inline: true
        },
        {
          name: 'Final Score',
          value: `**${finalScore}/${finalWickets}**`,
          inline: true
        },
        {
          name: 'Result',
          value: won
            ? '🔥 **YOU WIN THE SUPER OVER!**'
            : '😬 **YOU LOSE THE SUPER OVER!**',
          inline: false
        }
      ]
    }]
  });
}
// =========================
// BAT BATTLE
// =========================
if (message.content.toLowerCase() === '!batbattle') {
if (activeBatBattle) {
return message.reply('🏏 A Bat Battle is already running!');
}

activeBatBattle = {
channelId: message.channel.id,
shots: {}
};

await message.reply({
embeds: [{
title: '🏏 Bat Battle Started!',
description:
'Everyone type one shot:\n\n' +
'defensive 🛡️\ndrive 🏏\nloft 🚀\nscoop 🪄\n\n' +
'⏳ You have 20 seconds.',
color: 0x00FFFF
}]
});

setTimeout(async () => {
const battle = activeBatBattle;
activeBatBattle = null;

if (!battle || Object.keys(battle.shots).length === 0) {
return message.channel.send('😅 No one played.');
}

const results = [];
let highest = -1;

for (const id in battle.shots) {
const p = battle.shots[id];
let r;

if (p.shot === 'defensive') r = [0,1,1,2,2,'W'][Math.floor(Math.random()*6)];
else if (p.shot === 'drive') r = [0,1,2,3,4,'W'][Math.floor(Math.random()*6)];
else if (p.shot === 'loft') r = [0,0,2,4,6,'W'][Math.floor(Math.random()*6)];
else r = [0,0,4,6,6,'W'][Math.floor(Math.random()*6)];

p.result = r;
if (r !== 'W' && r > highest) highest = r;
results.push(p);
}

const lines = results.map(p => `**${p.name}** - ${p.result === 'W' ? '💥 W' : p.result + '️⃣'}`);
 const winners = results.filter(p => p.result === highest);

const commentary = highest === 6
? '🎙️ Huge sixes flying into the crowd!'
: highest >= 4
? '🎙️ Some clean boundary hitting there!'
: '🎙️ Tight bowling and clever batting.';

const winnerText =
highest === -1
? '😬 Everyone got out!'
: winners.length === 1
? `🏆 **Winner: ${winners[0].name} (${highest})**`
: `🤝 **Tie: ${winners.map(w => w.name).join(', ')} (${highest})**`;

await message.channel.send({
embeds: [{
title: '📊 Bat Battle Results',
description: lines.join('\n'),
color: 0x00FFFF,
fields: [
{ name: '🎙️ Commentary', value: commentary },
{ name: 'Result', value: winnerText }
 ]
}]
});
}, 20000);

return;
}

if (
activeBatBattle &&
message.channel.id === activeBatBattle.channelId &&
['defensive', 'drive', 'loft', 'scoop'].includes(message.content.toLowerCase())
) {
if (!activeBatBattle.shots[message.author.id]) {
activeBatBattle.shots[message.author.id] = {
name: message.member?.displayName || message.author.username,
shot: message.content.toLowerCase()
};
}
return;
}

// =========================
// NORMAL BOT LOGIC
// =========================
const isImageCommand = message.content.startsWith('!image ');
const isMention = message.mentions.has(client.user);

if (
  !isImageCommand &&
  !isMention &&
  !['defensive', 'drive', 'loft', 'scoop'].includes(message.content.toLowerCase())
) return;

uniqueUsers.add(message.author.id);

const question = message.content.replace(/<@!?\d+>/g, '').trim();
const lower = question.toLowerCase();

if (lower === 'forget everything i said') {
userMemory.delete(message.author.id);
return message.reply('🧠 Memory cleared.');
}

if (!question) {
return message.reply(`🤖 Pong! **${client.ws.ping}ms**`);
}

if (blockedWords.some(w => lower.includes(w))) {
return message.reply('❌ NSFW content is not allowed.');
}

// Image generation
if (isImageCommand) {
const now = Date.now();
const last = cooldowns.get(message.author.id) || 0;

if (now - last < 5000) {
return message.reply('🖼️ Wait 5 seconds before another image.');
}

cooldowns.set(message.author.id, now);

const wait = await message.reply('🎨 Generating image...');

const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(question)}?width=1024&height=1024&nologo=true&model=flux`; const embed = { title: 'AI Image', description: question, image: { url: imageUrl }, color: 0x00FFFF };
imagesGenerated++;

return wait.edit({
content: null,
embeds: [{
title: '🎨 AI Image',
description: question,
image: { url },
color: 0x00FFFF
}]
});
}

// AI chat
try {
await message.channel.sendTyping();

let history = userMemory.get(message.author.id);

if (!history || Date.now() - history.lastUsed > MEMORY_TIME) {
history = { messages: [], lastUsed: Date.now() };
}

history.messages.push({ role: 'user', content: question });
history.messages = history.messages.slice(-10);

const response = await ai.chat.completions.create({
model: 'llama-3.3-70b-versatile',
messages: [
{
role: 'system',
content: 'You are a helpful, family-friendly Discord assistant. Keep replies short unless detail is requested.'
},
...history.messages
 ],
max_tokens: 140
});

const answer = response.choices[0].message.content;

history.messages.push({ role: 'assistant', content: answer });
history.lastUsed = Date.now();

userMemory.set(message.author.id, history);

messagesAnswered++;

await message.reply(answer);

} catch (err) {
console.error(err);
await message.reply('⚠️ Something went wrong.');
}
});

client.login(process.env.DISCORD_TOKEN);



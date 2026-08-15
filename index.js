const {
  Client,
  GatewayIntentBits,
  Events,
  AttachmentBuilder,
  MessageFlags,
  ActionRowBuilder, // <--- ADD THIS
  ButtonBuilder,    // <--- ADD THIS
  ButtonStyle,       // <--- ADD THIS
EmbedBuilder,
ModalBuilder,      // <--- ADD THIS
  TextInputBuilder,  // <--- ADD THIS
  TextInputStyle,     // <--- ADD THIS
  StringSelectMenuBuilder
} = require('discord.js');


const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');


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


// Prevent process crashes on Discord API timeouts (like Unknown interaction 10062)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
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
// RPG ADVENTURE SESSIONS
// =========================
const activeAdventures = new Map();

// =========================
// DAILY IMAGE LIMITS
// =========================
const dailyImageLimits = new Map();
const OWNER_ID = '773574818121383958';
const bonusImageCredits = new Map();



// =========================
// STATS
// =========================
let messagesAnswered = 0;
let imagesGenerated = 0;
const uniqueUsers = new Set();
const greetedUsers = new Set();
const startTime = Date.now();
const cooldowns = new Map();
const userMemory = new Map();
const activeSuperOvers = new Map(); // ADD THIS HERE
const activeBatBattles = new Set(); // Tracks channels with an active batt
const activeScrambles = new Set();


// =========================
// TRIVIA MEMORY
// =========================
const askedQuestions = [];

// =========================
// IMAGE COOLDOWN
// =========================

// =========================
// MEMORY (2 HOURS)
// =========================
const MEMORY_TIME = 2 * 60 * 60 * 1000;
const askHistory = new Map();

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

  if (interaction.commandName === 'info') {
    await interaction.reply({
      embeds: [{
        title: '🤖 Dora Bot 🩵',
        description: 'A smart Discord assistant with memory, AI chat, images, summaries, and games.',
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
            value: '2 hours',
            inline: true
          },
          {
            name: '🖼️ Images',
            value: 'Enabled',
            inline: true
          },
          {
            name: '🏏 Mini Games',
            value: '`!superover`\n`!batbattle`',
            inline: true
          }
        ],
        footer: {
          text: 'Made by Ayush'
        },
        timestamp: new Date().toISOString()
      }]
    });
  }

  
       if (interaction.commandName === 'help') {
    await interaction.reply({
      embeds: [
        {
          title: '🤖 DoraBot Help Center',
          description:
            'Welcome to **DoraBot** 🩵\nYour Doraemon-inspired AI companion for chatting, images, quizzes, games, and magical adventures.',
          color: 0x00BFFF,
          thumbnail: {
            url: client.user.displayAvatarURL()
          },
          fields: [
            {
              name: '🧠 AI & Memory',
              value:
                '`/ask question:<text>` — Chat with DoraBot\n' +
                '`@DoraBot <message>` — Quick AI reply\n' +
                '`@DoraBot forget everything i said` — Clear memory',
              inline: false
            },
            {
              name: '🎨 Image Generation',
              value:
                '`/image prompt:<text>` — Generate an AI image\n' +
                '`!image <text>` — Quick image command',
              inline: false
            },
            {
              name: '📄 Utilities',
              value:
                '`!sum` — Summarize a replied message\n' +
                '`/stats` — Bot statistics\n' +
                '`/info` — Bot information',
              inline: false
            },
            {
              name: '🎮 Games',
              value:
                '`!superover` — Solo cricket challenge\n' +
                '`!batbattle` — Multiplayer batting battle\n' +
                '`!scramble` — Word scramble race\n' +
                '`/quiz` — Interactive Quiz with Topic\n' +
                '`/battle` — Challenge a friend to an epic fiction battle!',
              inline: false
            },
            {
              name: '🚪 Doraemon Adventures',
              value:
                '`/adventure` — Play a Doraemon-style interactive adventure\n' +
                'Use gadgets, travel through time, and explore magical stories with Doraemon!',
              inline: false
            },
            {
              name: '😂 Fun & Pranks',
              value:
                '`/wanted` — Create a funny wanted poster (Slash Command)\n' +
                '`!wanted @user` — Quick wanted poster\n' +
                '`!wanted gs @user` — Grayscale wanted poster',
              inline: false
            }
          ],
          footer: {
            text: 'Made with 🩵 by Ayush • DoraBot'
          },
          timestamp: new Date().toISOString()
        }
      ]
    });
  }





  if (interaction.commandName === 'stats') {
    const ping = client.ws.ping;
    const uptimeMs = Date.now() - startTime;
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);

    let status = '🟢 Excellent';
    if (ping > 80) status = '🟡 Good';
    if (ping > 150) status = '🔴 Slow';

    await interaction.reply({
      flags: MessageFlags.Ephemeral, //
      embeds: [{
        title: '📊 DoraBot 🩵 Stats',
        color: 0x00FFFF,
        fields: [
          {
              name: '🌍 Servers',
              value: String(client.guilds.cache.size),
              inline: true
            },
          {
            name: '💬 Messages',
            value: String(messagesAnswered),
            inline: true
          },
          {
            name: '🖼️ Images',
            value: String(imagesGenerated),
            inline: true
          },
          {
            name: '👥 Users',
            value: String(uniqueUsers.size),
            inline: true
          },
          {
            name: '📶 Ping',
            value: `${ping} ms`,
            inline: true
          },
          {
            name: '⚡ Status',
            value: status,
            inline: true
          },
          {
            name: '⏱️ Uptime',
            value: `${hours}h ${minutes}m`,
            inline: true
          }
        ],
        footer: {
          text: 'Made by Ayush'
        }
      }]
    });
  }

// --- /IMAGE ---
// --- /IMAGE ---
if (interaction.commandName === 'image') {
  const prompt = interaction.options.getString('prompt');
const userId = interaction.user.id;
const isOwner = userId === OWNER_ID;

// NSFW / blocked words filter (non-owners only)
const blockedWords = [
  'porn', 'nude', 'sex', 'hentai', 'onlyfans', 'rape',
  'boobs', 'breasts', 'sexy', 'underwear', 'lingerie',
  'bikini', 'topless', 'naked', 'nsfw', 'fetish'
];

const lowerPrompt = prompt.toLowerCase();

if (!isOwner && blockedWords.some(word => lowerPrompt.includes(word))) {
  return interaction.reply({
    content: '🚫 NSFW or inappropriate image prompts are not allowed.',
    flags: MessageFlags.Ephemeral
  });
}


  const today = new Date().toDateString();
 

  // Get today's usage
  let userLimit = dailyImageLimits.get(userId) || {
    date: today,
    count: 0
  };

  // Reset on a new day
  if (userLimit.date !== today) {
    userLimit = {
      date: today,
      count: 0
    };
  }

  // Bonus credits
  const bonus = bonusImageCredits.get(userId) || 0;
  const maxImages = 5 + bonus;

  // Check limit (owner is unlimited)
  if (!isOwner && userLimit.count >= maxImages) {
    return interaction.reply({
      content: `🚫 You have reached your daily limit of **${maxImages} images**. Please try again tomorrow.`,
      flags: MessageFlags.Ephemeral
    });
  }

  // Increase count for normal users
  if (!isOwner) {
    userLimit.count += 1;
    dailyImageLimits.set(userId, userLimit);
  }

  await interaction.deferReply();

  try {
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux`;

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('🎨 DoraBot Image')
      .setDescription(`**Prompt:** ${prompt}`)
      .setImage(imageUrl)
      .setFooter({
        text: isOwner
          ? '🩵 Developer • Unlimited images'
          : `Remaining today: ${maxImages - userLimit.count}`
      });

    await interaction.editReply({
      embeds: [embed]
    });

  } catch (err) {
    console.error(err);

    // Refund usage on failure
    if (!isOwner) {
      userLimit.count -= 1;
      dailyImageLimits.set(userId, userLimit);
    }

    await interaction.editReply('⚠️ Failed to generate image.');
  }
}


// --- /ADMIN ---
if (interaction.commandName === 'admin') {

  // Owner only
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({
      content: '🚫 This command is restricted to the bot owner.',
      flags: MessageFlags.Ephemeral
    });
  }

  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser('user');

  // Give extra images
  if (sub === 'give') {
    const amount = interaction.options.getInteger('amount');

    const current = bonusImageCredits.get(user.id) || 0;
    bonusImageCredits.set(user.id, current + amount);

    return interaction.reply({
  content: `✅ Gave **${amount}** extra image generations to **${user.username}**.`,
  flags: MessageFlags.Ephemeral
});

  }

  // Reset limits
  if (sub === 'reset') {
    dailyImageLimits.delete(user.id);
    bonusImageCredits.delete(user.id);

    return interaction.reply({
  content: `♻️ Reset all image limits for **${user.username}**.`,
  flags: MessageFlags.Ephemeral
});

  }

  // Check stats
  if (sub === 'stats') {
    const today = new Date().toDateString();

    let data = dailyImageLimits.get(user.id) || {
      date: today,
      count: 0
    };

    if (data.date !== today) {
      data = { date: today, count: 0 };
    }

    const bonus = bonusImageCredits.get(user.id) || 0;
    const max = 5 + bonus;

    return interaction.reply({
  content: `📊 **${user.username}**\nUsed: **${data.count}/${max}**\nBonus: **${bonus}**`,
  flags: MessageFlags.Ephemeral
});

  }
}

          // --- /ASK (POWERED BY GEMINI INTERACTIONS API) ---
  if (interaction.commandName === 'ask') {
    const question = interaction.options.getString('question');
    const userId = interaction.user.id;

    if (!process.env.GEMINI_API_KEY) {
      return interaction.reply({
        content: '⚠️ `GEMINI_API_KEY` is missing in Railway environment variables.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply();

    try {
      let previousId = askHistory.get(userId);

      const payload = {
        model: 'gemini-3.6-flash',
        input: question,
        system_instruction: 'You are DoraBot, a helpful Discord assistant inspired by Doraemon. Continue the conversation naturally, be witty, and remember previous messages.'
      };

      // Connect to existing server-side conversation history if available
      if (previousId) {
        payload.previous_interaction_id = previousId;
      }

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      // Extract output text from model_output step
      let answer = '';
      if (data.steps && Array.isArray(data.steps)) {
        for (const step of data.steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            for (const item of step.content) {
              if (item.type === 'text') answer += item.text;
            }
          }
        }
      }

      if (!answer) {
        answer = '⚠️ I could not generate a response.';
      }

      // Save interaction ID for stateful multi-turn chat
      if (data.id) {
        askHistory.set(userId, data.id);
      }

      await interaction.editReply(answer.slice(0, 2000));

    } catch (err) {
      console.error('Gemini Ask Error:', err);
      // Reset interaction session on failure
      askHistory.delete(userId);
      await interaction.editReply('⚠️ Failed to contact the Gemini AI service.');
    }
  }







      

  // =========================
  // /WANTED (SLASH COMMAND)
  // =========================
  if (interaction.commandName === 'wanted') {
    // 1. Defer the reply to give the bot time to draw the image!
    await interaction.deferReply();

    // 2. Grab the options the user clicked on, or default to themselves / false
    const target = interaction.options.getUser('target') || interaction.user;
    const wantsGrayscale = interaction.options.getBoolean('grayscale') || false;

    try {
      // 3. Set up the exact 1254x1254 Canvas
      const canvas = createCanvas(1254, 1254);
      const ctx = canvas.getContext('2d');

      // 4. Load the 'Rye' font
      if (!global.bountyFontLoaded) {
        try {
          const fontRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/rye/Rye-Regular.ttf');
          const fontBuf = await fontRes.arrayBuffer();
          
          GlobalFonts.register(Buffer.from(fontBuf), 'RyeFont');
          global.bountyFontLoaded = true;
        } catch (fontErr) {
          console.error('Font load failed:', fontErr);
        }
      }

      // 5. Load Your New Custom Template 
      const template = await loadImage('https://i.ibb.co/C3PqrMwK/file-00000000db2882088038edff95f39572.png'); 
      
      // 6. Draw the Template FIRST
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // 7. Fetch and Draw the User's Avatar SECOND
      const avatarUrl = target.displayAvatarURL({ extension: 'png', size: 1024 });
      const avatar = await loadImage(avatarUrl);
      
      // --- THE GRAYSCALE UPGRADE ---
      if (wantsGrayscale) {
        ctx.filter = 'grayscale(100%)';
      }
      
      ctx.drawImage(avatar, 362, 305, 530, 530);
      ctx.filter = 'none';

      // 8. Draw Username
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3a2b20'; 
      ctx.font = '70px "RyeFont"';
      
      const name = (target.globalName || target.username).toUpperCase();
      ctx.fillText(name, 627, 1110); 

      // 9. Send Attachment using editReply (since we deferred earlier)
      const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'wanted.png' });
      return interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Canvas Error:', error);
      return interaction.editReply('⚠️ Could not generate the poster.');
    }
  }


// Adventure mode //

if (interaction.commandName === 'adventure') {
  // 1. Tell Discord we are thinking
  await interaction.deferReply();

  // 2. The Core Setup (Doraemon Adventure)
  const systemPrompt = `You are an AI Story Master running a Doraemon-style interactive adventure.

The player is the hero of the story.
Doraemon is always present as a helpful companion.
The world includes futuristic gadgets, time travel, secret locations, magical mishaps, and funny surprises.
You may include Nobita, Shizuka, Gian, and Suneo when useful.

Generate a short, highly engaging, and easy-to-read story segment (max 3 sentences) and exactly 3 distinct choices for the player.

CRITICAL RULES:
1. The choices MUST be short actions (under 50 characters) so they fit on Discord buttons.
2. Keep the tone fun, adventurous, and family-friendly.
3. Include Doraemon gadgets such as Anywhere Door, Bamboo Copter, Time Machine, Small Light, Big Light, Translation Jelly, Momotaro Dumpling (to control animals) (lights used to decrease or increase size as per name) etc.
4. Return ONLY a raw JSON object with no markdown formatting.
5. Journeys should be set in Japan and Globally or Outer Space or Future/Paste rarely, should not be about nobita's ancestors or something too much.

Structure: {"story":"...","choices":["Choice A","Choice B","Choice C"]}`;

  try {
    // 3. Fetch the starting story
    const response = await ai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.9
    });

    // 4. Parse JSON safely
    let jsonString = response.choices[0].message.content.trim();

    if (jsonString.startsWith('```json')) {
      jsonString = jsonString
        .replace(/```json\\n?/, '')
        .replace(/```/, '');
    }

    let gameData = JSON.parse(jsonString);

    // 5. Save memory and set Turn 1
    activeAdventures.set(interaction.user.id, {
      history: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: response.choices[0].message.content }
      ],
      turn: 1
    });

    // 6. Build buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('adv_0')
        .setLabel(gameData.choices[0])
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('adv_1')
        .setLabel(gameData.choices[1])
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('adv_2')
        .setLabel(gameData.choices[2])
        .setStyle(ButtonStyle.Primary)
    );

    // 7. Send the game embed
    const gameMessage = await interaction.editReply({
      embeds: [{
        title: '🚪 Doraemon Time Adventure',
        description: gameData.story,
        color: 0x00BFFF,
        footer: { text: 'Turn 1/5 • Choose your next action below' }
      }],
      components: [row]
    });

    // 8. Listen for button clicks
    const collector = gameMessage.createMessageComponentCollector({
      time: 300000
    });

    collector.on('collect', async (i) => {
      // Prevent others from using the buttons
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: '⚠️ This is not your adventure! Use `/adventure` to start your own.',
          flags: MessageFlags.Ephemeral
        });
      }

      await i.deferUpdate();

      // Which choice was selected?
      const choiceIndex = parseInt(i.customId.split('_')[1]);
      const userChoice = gameData.choices[choiceIndex];

      // Load session
      const session = activeAdventures.get(i
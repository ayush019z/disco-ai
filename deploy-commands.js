const { REST, Routes, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

// Helper configurations for DM support across all commands
const enableDMs = command => command
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ]);

// Define all your slash commands here
const commands = [
  enableDMs(new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot statistics')),

  enableDMs(new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Start an interactive trivia game')
    .addStringOption(option =>
      option
        .setName('topic')
        .setDescription('The topic for the quiz')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('difficulty')
        .setDescription('Difficulty level')
        .setRequired(false)
        .addChoices(
          { name: 'Easy', value: 'easy' },
          { name: 'Medium', value: 'medium' },
          { name: 'Hard', value: 'hard' }
        )
    )),

  enableDMs(new SlashCommandBuilder()
    .setName('adventure')
    .setDescription('Play a Doraemon-style interactive adventure')),

  enableDMs(new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Create a wanted poster for a user')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('The user to put on the wanted poster')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('grayscale')
        .setDescription('Apply a greyscale filter to the poster')
        .setRequired(false)
    )),

  enableDMs(new SlashCommandBuilder()
    .setName('image')
    .setDescription('Generate a high-quality AI image (Limit: 5 per day)')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('What do you want to generate?')
        .setRequired(true)
    )),

  // --- BATTLE (REQUIRED OPTIONS FIRST) ---
  enableDMs(new SlashCommandBuilder()
    .setName('battle')
    .setDescription('Challenge another user or open a public lobby for an epic fiction battle!')
    .addStringOption(option => 
      option.setName('character')
        .setDescription('The fictional character you will fight as')
        .setRequired(true))
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user you want to challenge (Leave blank for an open lobby!)')
        .setRequired(false))),
  
// --- NEW: QUESTS COMMAND ---
  enableDMs(new SlashCommandBuilder()
    .setName('quests')
    .setDescription('Check and claim your randomized daily tasks to earn Dorayaki!')),
  
  enableDMs(new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Owner admin commands')
    .addSubcommand(sub =>
      sub.setName('give')
        .setDescription('Give extra image generations')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset a user’s image limits')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('Check a user’s image usage')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    )),

  // --- PROFILE COMMAND ---
  enableDMs(new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your or another user\'s mini-game stats')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose profile you want to view')
        .setRequired(false)
    )),

  // --- ASK COMMAND ---
  enableDMs(new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask DoraBot anything')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('What do you want to ask❓')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('ephemeral')
        .setDescription('Make the answer visible only to you (default: false)')
        .setRequired(false)
    )),
  
  enableDMs(new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your free daily Dorayaki!')),

  enableDMs(new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Open the gadget shop to gamble boxes or buy VIP roles!')),
  
  // --- GIVEAWAY COMMAND (WITH DURATION TIMER) ---
  enableDMs(new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a Dorayaki giveaway (Bot Owner Only)')
    .addIntegerOption(option =>
      option
        .setName('prize')
        .setDescription('Amount of Dorayaki to give away')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to post the giveaway in')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Custom description or rules for the giveaway')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('Giveaway length (e.g., 30m, 2h, 1d). Defaults to 24h.')
        .setRequired(false)
    )),

  // --- PAY / TRANSFER COMMAND ---
  enableDMs(new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer Dorayaki to another user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user you want to pay')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount of Dorayaki to send')
        .setRequired(true)
        .setMinValue(1)
    )),

  // --- LEADERBOARD COMMAND (TOP 5) ---
  enableDMs(new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 5 richest Dorayaki hoarders across the server!')),

  enableDMs(new SlashCommandBuilder()
    .setName('info')
    .setDescription('View bot information')),

  enableDMs(new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all available commands'))
].map(command => command.toJSON());

// Prepare the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Register the commands with Discord
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Global registration
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

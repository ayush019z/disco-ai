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
        .setRequired(true)) // <--- Required option first!
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user you want to challenge (Leave blank for an open lobby!)')
        .setRequired(false))), // <--- Optional option after!


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

  enableDMs(new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask DoraBot anything')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('What do you want to ask❓')
        .setRequired(true)
    )),

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

    // Global registration (Registers commands across servers and DMs where the bot is present)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

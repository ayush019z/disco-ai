const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Define all your slash commands here
const commands = [
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot statistics'),

  new SlashCommandBuilder()
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
    ),

  new SlashCommandBuilder()
    .setName('adventure')
    .setDescription('Start an interactive AI text RPG adventure'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('View bot information'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('View all available commands')
].map(command => command.toJSON());

// Prepare the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Register the commands with Discord
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Global registration (Registers commands across all servers where the bot is present)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();

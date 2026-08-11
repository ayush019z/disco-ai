const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Show information about the bot'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all bot commands and how to use them'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show bot statistics and ping'),

  // =========================
  // NEW WANTED COMMAND
  // =========================
  new SlashCommandBuilder()
    .setName('wanted')
    .setDescription('Generate a vintage wanted poster')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('The user to put on the poster')
        .setRequired(false)
    )
    .addBooleanOption(option => 
      option
        .setName('grayscale')
        .setDescription('Apply a vintage grayscale filter to the avatar')
        .setRequired(false)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
})();

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
    .setDescription('Show bot statistics and ping')
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

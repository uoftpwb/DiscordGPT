const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('askgpt')
		.setDescription('Send a prompt to the bot!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
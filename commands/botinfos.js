const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Gibt die Infos für den Bot.'),
  async execute(interaction, client) {
    const embed = new client.discord.MessageEmbed()
      .setColor('6d6ee8')
      .setDescription('Entwickelt mit das ♥ von ExothDE#0888\n\n[<:github:901207749675851816>](https://github.com/ExothDE)  [<:twitter:901207826729418752>](https://twitter.com/ExothDE  [<:twitch:901207801643303012>](https://www.twitch.tv/ExothDE)  [<:discord:901207777765130300>](https://https://discord.gg/DPM6h9juyT)')
      .setFooter(client.config.footerText, client.user.avatarURL())
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  },
};
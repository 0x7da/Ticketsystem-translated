let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Du hast bereits ein Ticket erstellt!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket wurde erstellt! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
          .setDescription('Wähle die Kategorie von dein Ticket aus')
          .setFooter('Nordseite', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Wähle die Kategorie von dein Ticket aus')
            .addOptions([{
                label: 'Transaction',
                value: 'transaction',
                emoji: '🔓',
              },
              {
                label: 'Support',
                value: 'support',
                emoji: '🚀',
              },
              {
                label: 'Beschwerde',
                value: 'beschwerde',
                emoji: '❗',
              },

              {
                label: 'Allgemeines',
                value: 'allgemeines',
                emoji: '❓',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
                  .setDescription(`<@!${interaction.user.id}> Hat ein **Ticket** erstellt mit dem **Grund:** ${i.values[0]}`)
                  .setFooter('Nordseite', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Ticket schließen')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'transaction') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'support') {
              c.edit({
                parent: client.config.parentsupport
              });
            };
            if (i.values[0] == 'beschwerde') {
              c.edit({
                parent: client.config.parentbeschwerde
              });
            };

            if (i.values[0] == 'allgemeines') {
              c.edit({
                parent: client.config.parentallgemeines
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Keine Kategorie wurde ausgewählt. das Ticket schließt automatisch...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Ticket schließen')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Schließung aufheben')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Bist du sicher, dass du das Ticket schließen möchtest?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Das Ticket wurde geschlossen von <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
                .setDescription('```Ticket Speicherung```')
                .setFooter('Nordseite', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Ticket löschen')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Ticket schließen abgebrochen!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Ticket schließung abgebrochen-',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Nachrichten speichern...☁'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
              .setDescription(`📰 Ticket-Logs \`${chan.id}\` erstellt von <@!${chan.topic}> und gelöscht durch <@!${interaction.user.id}>\n\nLogs: [**Klick hier, um die Logs zu sehen**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/826231574177644585/934365593140879380/unknown.png')
              .setDescription(`📰 Logs von deinem Ticket \`${chan.id}\`: [**Klick hier, um die Logs zu sehen**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('I can\'t dm him :(')});
            chan.send('Channel löschen...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};

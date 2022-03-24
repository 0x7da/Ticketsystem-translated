module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('Bot Online!')
    console.log('Bot Entwickler ExothDE');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('ff9600')
        .setAuthor('Ticket Erstellen', client.user.avatarURL())
      
        .setDescription('Willkommen im Ticket Support von Nordseite\n\nEs gibt vier verschiedene Arten von Tickets. Um ein Ticket zu eröffnen, klicke\n einfach auf den richtigen Button.\n\nSupport-Ticket\nFür alles rund um den Server\n• Bewerben\n• Support\n• Allgemeines\n• Beschwerde\n\n• Beschwerden über Teammitglieder\n• Bewerben auf Nordseite\n• Support & Fragen über Nordseite\n• Allgemeine Fragen und Themen\n\nMissbrauch wird mit einem Mute / Bann bestraft.')
        .setFooter(client.config.footerText, client.user.avatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Ticket Erstellen')
          .setEmoji('🎫')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Kanal erhalten ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};

module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('Bot Online!')
    console.log('Bot Entwickler ExothDE');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Ticket Erstellen', client.user.avatarURL())
        .setDescription('Wenn du Hilfe benötigst, ein Teammitglied melden möchtest oder eine allgemeine Frage hast,\n kannst du ein Ticket öffnen und das Northside Team wird dir weiter helfen!')
        .setFooter(client.config.footerText, client.user.avatarURL())
        .setThumbnail('https://cdn.discordapp.com/attachments/924097472891080795/934554766770577509/ticket.png')
        .setImage('https://cdn.discordapp.com/attachments/924097472891080795/934552731203563540/Ticketlogo.png')
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Ticket Erstellen')
          .setEmoji('✉️')
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
        throw new Error(`Erwarteten Kanal, erhalten ${typeof channel}.`);
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

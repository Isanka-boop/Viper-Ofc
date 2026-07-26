const config = require('../../config/config');

module.exports = {
  name: 'owner',
  aliases: ['creator', 'dev'],
  category: 'general',
  description: 'Show bot owner information',
  async execute({ sock, remoteJid, msg }) {
    const text = [
      `Bot Owner: ${config.bot.ownerName}`,
      `Bot Name: ${config.bot.name}`,
      '',
      `Support channel: ${config.branding.supportChannel}`,
      '',
      config.branding.footer
    ].join('\n');

    if (config.bot.ownerNumber) {
      await sock.sendMessage(
        remoteJid,
        {
          contacts: {
            displayName: config.bot.ownerName,
            contacts: [{ vcard:
              `BEGIN:VCARD\nVERSION:3.0\nFN:${config.bot.ownerName}\nTEL;type=CELL;waid=${config.bot.ownerNumber}:+${config.bot.ownerNumber}\nEND:VCARD`
            }]
          }
        },
        { quoted: msg }
      ).catch(async () => {
        await sock.sendMessage(remoteJid, { text }, { quoted: msg });
      });
    } else {
      await sock.sendMessage(remoteJid, { text }, { quoted: msg });
    }
  }
};

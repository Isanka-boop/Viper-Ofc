const config = require('../../config/config');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'report',
  aliases: ['bug'],
  category: 'general',
  description: 'Report a bug or issue to the bot owner',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!args.length) {
      return reply(sock, remoteJid, `Usage: ${config.bot.prefix}report <your issue>`, msg);
    }
    const issue = args.join(' ');
    if (config.bot.ownerNumber) {
      const ownerJid = `${config.bot.ownerNumber}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, {
        text: `New report from ${sender}:\n\n${issue}`
      }).catch(() => {});
    }
    await reply(sock, remoteJid, 'Your report has been sent to the owner. Thank you.', msg);
  }
};

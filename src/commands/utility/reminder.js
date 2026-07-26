const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'reminder',
  aliases: ['remind'],
  category: 'utility',
  description: 'Set a reminder. Usage: reminder <minutes> <message>',
  async execute({ sock, remoteJid, args, msg }) {
    if (args.length < 2) return reply(sock, remoteJid, 'Usage: reminder <minutes> <message>', msg);
    const minutes = parseFloat(args[0]);
    if (isNaN(minutes) || minutes <= 0 || minutes > 1440) {
      return reply(sock, remoteJid, 'Provide a valid number of minutes (1 to 1440).', msg);
    }
    const text = args.slice(1).join(' ');
    await reply(sock, remoteJid, `Reminder set for ${minutes} minute(s) from now.`, msg);

    setTimeout(() => {
      sock.sendMessage(remoteJid, { text: `Reminder: ${text}` }, { quoted: msg }).catch(() => {});
    }, minutes * 60 * 1000);
  }
};

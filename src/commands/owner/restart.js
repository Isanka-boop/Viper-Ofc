const { reply, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'restart',
  aliases: [],
  category: 'owner',
  description: 'Restart the bot process (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    await reply(sock, remoteJid, 'Restarting bot now.', msg);
    setTimeout(() => process.exit(0), 1500);
  }
};

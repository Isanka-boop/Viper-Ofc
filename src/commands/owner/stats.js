const { reply, isOwner } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');
const Log = require('../../database/models/Log');

module.exports = {
  name: 'stats',
  aliases: ['botstats'],
  category: 'owner',
  description: 'View bot-wide statistics (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalCommandsRun = await Log.countDocuments({ type: 'command' });

    const text = [
      'Bot Statistics',
      '',
      `Total users: ${totalUsers}`,
      `Banned users: ${bannedUsers}`,
      `Commands executed: ${totalCommandsRun}`
    ].join('\n');

    await reply(sock, remoteJid, text, msg);
  }
};

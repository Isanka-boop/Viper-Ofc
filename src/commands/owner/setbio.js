const { reply, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'setbio',
  aliases: [],
  category: 'owner',
  description: 'Update the bot about/bio text (owner only)',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    if (!args.length) return reply(sock, remoteJid, 'Provide the new bio text.', msg);
    await sock.updateProfileStatus(args.join(' '));
    await reply(sock, remoteJid, 'Bot bio updated successfully.', msg);
  }
};

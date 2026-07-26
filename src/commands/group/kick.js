const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  description: 'Remove a member from the group (admin only)',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || !mentioned.length) return reply(sock, remoteJid, 'Mention the member to remove.', msg);

    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'remove');
    await reply(sock, remoteJid, 'Member removed successfully.', msg);
  }
};

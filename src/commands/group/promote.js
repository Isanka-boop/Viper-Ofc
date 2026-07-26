const { reply, isGroupAdmin, isBotAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'promote',
  aliases: [],
  category: 'group',
  description: 'Promote a member to group admin',
  async execute({ sock, remoteJid, sender, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!(await isBotAdmin(sock, remoteJid))) return reply(sock, remoteJid, 'The bot needs to be an admin to do this.', msg);

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || !mentioned.length) return reply(sock, remoteJid, 'Mention the member to promote.', msg);

    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'promote');
    await reply(sock, remoteJid, 'Member promoted to admin.', msg);
  }
};

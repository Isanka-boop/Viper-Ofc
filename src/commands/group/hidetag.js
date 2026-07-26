const { isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'hidetag',
  aliases: [],
  category: 'group',
  description: 'Send a message mentioning everyone without showing the tag list (admin only)',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    const { reply } = require('../../lib/commandHelpers');
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const meta = await sock.groupMetadata(remoteJid);
    const mentions = meta.participants.map((p) => p.id);
    const text = args.length ? args.join(' ') : ' ';

    await sock.sendMessage(remoteJid, { text, mentions }, { quoted: msg });
  }
};

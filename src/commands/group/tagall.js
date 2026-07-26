const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'tagall',
  aliases: ['everyone'],
  category: 'group',
  description: 'Mention every member of the group (admin only)',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const meta = await sock.groupMetadata(remoteJid);
    const mentions = meta.participants.map((p) => p.id);
    const note = args.length ? args.join(' ') : 'Attention everyone';

    const text = `${note}\n\n` + mentions.map((m) => `@${m.split('@')[0]}`).join(' ');
    await sock.sendMessage(remoteJid, { text, mentions }, { quoted: msg });
  }
};

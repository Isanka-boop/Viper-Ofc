const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'listadmins',
  aliases: ['admins'],
  category: 'group',
  description: 'List all group admins',
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    const meta = await sock.groupMetadata(remoteJid);
    const admins = meta.participants.filter((p) => p.admin);
    const mentions = admins.map((a) => a.id);

    const text = 'Group admins:\n' + admins.map((a) => `@${a.id.split('@')[0]}`).join('\n');
    await sock.sendMessage(remoteJid, { text, mentions }, { quoted: msg });
  }
};

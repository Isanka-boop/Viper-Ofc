const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'listmembers',
  aliases: ['members'],
  category: 'group',
  description: 'List all members of the group',
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    const meta = await sock.groupMetadata(remoteJid);
    const text = `Total members: ${meta.participants.length}\n\n` +
      meta.participants.map((p) => `${p.id.split('@')[0]}${p.admin ? ' (admin)' : ''}`).join('\n');
    await reply(sock, remoteJid, text, msg);
  }
};

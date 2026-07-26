const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'groupinfo',
  aliases: ['ginfo'],
  category: 'group',
  description: 'Show information about the current group',
  async execute({ sock, remoteJid, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    const meta = await sock.groupMetadata(remoteJid);
    const admins = meta.participants.filter((p) => p.admin).length;

    const text = [
      `Group: ${meta.subject}`,
      `Members: ${meta.participants.length}`,
      `Admins: ${admins}`,
      `Created: ${new Date(meta.creation * 1000).toDateString()}`,
      meta.desc ? `Description: ${meta.desc}` : ''
    ].filter(Boolean).join('\n');

    await reply(sock, remoteJid, text, msg);
  }
};

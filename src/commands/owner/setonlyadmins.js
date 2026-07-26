const Settings = require('../../database/models/Settings');
const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'onlyadmins',
  aliases: [],
  category: 'group',
  description: 'Restrict bot command usage to admins only in this group. Usage: onlyadmins on / off',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply(sock, remoteJid, 'Usage: onlyadmins on  or  onlyadmins off', msg);

    await Settings.findOneAndUpdate({ scope: remoteJid }, { $set: { onlyAdmins: mode === 'on' } }, { upsert: true });
    await reply(sock, remoteJid, `Admin-only command mode turned ${mode}.`, msg);
  }
};

const Settings = require('../../database/models/Settings');
const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'setwelcome',
  aliases: [],
  category: 'owner',
  description: 'Set a custom welcome message for this group. Use {user} and {group} placeholders.',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    const admin = await isGroupAdmin(sock, remoteJid, sender);
    if (!admin) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    if (!args.length) return reply(sock, remoteJid, 'Provide a welcome message using {user} and {group} placeholders.', msg);

    await Settings.findOneAndUpdate(
      { scope: remoteJid },
      { $set: { welcomeMessage: args.join(' ') } },
      { upsert: true }
    );
    await reply(sock, remoteJid, 'Welcome message updated.', msg);
  }
};

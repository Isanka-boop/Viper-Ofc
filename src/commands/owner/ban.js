const { reply, isOwner } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'ban',
  aliases: [],
  category: 'owner',
  description: 'Ban a user from using the bot (owner only)',
  async execute({ sock, remoteJid, sender, args, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mentioned || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
    if (!target) return reply(sock, remoteJid, 'Mention or provide a number to ban.', msg);

    await User.findOneAndUpdate({ jid: target }, { $set: { isBanned: true } }, { upsert: true });
    await reply(sock, remoteJid, `User ${target.split('@')[0]} has been banned from using the bot.`, msg);
  }
};


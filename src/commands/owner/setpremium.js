const { reply, isOwner } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'setpremium',
  aliases: [],
  category: 'owner',
  description: 'Grant premium status to a user (owner only)',
  async execute({ sock, remoteJid, sender, msg }) {
    if (!isOwner(sender)) return reply(sock, remoteJid, 'This command is restricted to the bot owner.', msg);
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentioned) return reply(sock, remoteJid, 'Mention the user to grant premium.', msg);

    await User.findOneAndUpdate({ jid: mentioned }, { $set: { isPremium: true } }, { upsert: true });
    await reply(sock, remoteJid, `Premium status granted to @${mentioned.split('@')[0]}`, msg);
  }
};

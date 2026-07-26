const { reply } = require('../../lib/commandHelpers');
const User = require('../../database/models/User');

module.exports = {
  name: 'userinfo',
  aliases: ['whois'],
  category: 'utility',
  description: 'Show stored profile information for a user',
  async execute({ sock, remoteJid, sender, msg }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mentioned || sender;
    const user = await User.findOne({ jid: target }).lean();

    const text = [
      `User: ${target.split('@')[0]}`,
      `Commands used: ${user?.commandsUsed || 0}`,
      `Premium: ${user?.isPremium ? 'Yes' : 'No'}`,
      `Registered: ${user?.registeredAt ? new Date(user.registeredAt).toDateString() : 'Unknown'}`
    ].join('\n');

    await reply(sock, remoteJid, text, msg);
  }
};

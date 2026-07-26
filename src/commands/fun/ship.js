const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'ship',
  aliases: [],
  category: 'fun',
  description: 'Calculate compatibility between two mentioned users',
  async execute({ sock, remoteJid, msg }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length < 2) return reply(sock, remoteJid, 'Mention two users to ship, e.g. ship @user1 @user2', msg);
    const percent = Math.floor(Math.random() * 101);
    await sock.sendMessage(remoteJid, {
      text: `Compatibility between @${mentioned[0].split('@')[0]} and @${mentioned[1].split('@')[0]}: ${percent}%`,
      mentions: mentioned.slice(0, 2)
    }, { quoted: msg });
  }
};

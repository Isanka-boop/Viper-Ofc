const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'flip',
  aliases: ['coinflip'],
  category: 'fun',
  description: 'Flip a coin',
  async execute({ sock, remoteJid, msg }) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await reply(sock, remoteJid, `Coin flip result: ${result}`, msg);
  }
};

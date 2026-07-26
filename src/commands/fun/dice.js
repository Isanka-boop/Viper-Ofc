const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'dice',
  aliases: ['roll'],
  category: 'fun',
  description: 'Roll a six-sided die',
  async execute({ sock, remoteJid, msg }) {
    const result = Math.floor(Math.random() * 6) + 1;
    await reply(sock, remoteJid, `You rolled a ${result}`, msg);
  }
};

const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'quiz',
  aliases: [],
  category: 'fun',
  description: 'Start a quick math quiz',
  async execute({ sock, remoteJid, msg }) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    await reply(sock, remoteJid, `Quick quiz: what is ${a} + ${b}? Reply with your answer.`, msg);
  }
};

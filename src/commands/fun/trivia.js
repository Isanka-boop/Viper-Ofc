const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'trivia',
  aliases: [],
  category: 'fun',
  description: 'Get a random trivia question',
  async execute({ sock, remoteJid, msg }) {
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const q = res.data.results[0];
      const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      const text = `${q.question}\n\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
      await reply(sock, remoteJid, text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch trivia right now.', msg);
    }
  }
};

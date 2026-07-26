const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'quote',
  aliases: [],
  category: 'fun',
  description: 'Get a random inspirational quote',
  async execute({ sock, remoteJid, msg }) {
    try {
      const res = await axios.get('https://api.quotable.io/random');
      await reply(sock, remoteJid, `"${res.data.content}"\n- ${res.data.author}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch a quote right now.', msg);
    }
  }
};

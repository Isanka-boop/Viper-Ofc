const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'joke',
  aliases: [],
  category: 'fun',
  description: 'Get a random joke',
  async execute({ sock, remoteJid, msg }) {
    try {
      const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
      await reply(sock, remoteJid, `${res.data.setup}\n\n${res.data.punchline}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch a joke right now.', msg);
    }
  }
};

const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'fact',
  aliases: [],
  category: 'fun',
  description: 'Get a random fact',
  async execute({ sock, remoteJid, msg }) {
    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
      await reply(sock, remoteJid, res.data.text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch a fact right now.', msg);
    }
  }
};

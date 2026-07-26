const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'meme',
  aliases: [],
  category: 'fun',
  description: 'Get a random meme image',
  async execute({ sock, remoteJid, msg }) {
    try {
      const res = await axios.get('https://meme-api.com/gimme');
      await sock.sendMessage(remoteJid, { image: { url: res.data.url }, caption: res.data.title }, { quoted: msg });
    } catch (err) {
      await reply(sock, remoteJid, 'Could not fetch a meme right now.', msg);
    }
  }
};

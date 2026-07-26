const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'define',
  aliases: ['dictionary'],
  category: 'search',
  description: 'Get the dictionary definition of a word',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: define <word>', msg);
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(args[0])}`);
      const entry = res.data[0];
      const meaning = entry.meanings[0];
      const text = `${entry.word}\n\n${meaning.partOfSpeech}: ${meaning.definitions[0].definition}`;
      await reply(sock, remoteJid, text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'No definition found for that word.', msg);
    }
  }
};


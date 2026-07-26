const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'translate',
  aliases: ['tr'],
  category: 'utility',
  description: 'Translate text. Usage: translate <lang-code> <text>',
  async execute({ sock, remoteJid, args, msg }) {
    if (args.length < 2) return reply(sock, remoteJid, 'Usage: translate <lang-code> <text>  e.g. translate es Hello', msg);
    const lang = args[0];
    const text = args.slice(1).join(' ');

    try {
      const res = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: text, langpair: `en|${lang}` }
      });
      const translated = res.data?.responseData?.translatedText || 'Translation unavailable.';
      await reply(sock, remoteJid, translated, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Translation failed right now.', msg);
    }
  }
};

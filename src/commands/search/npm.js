const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'npm',
  aliases: [],
  category: 'search',
  description: 'Look up an npm package',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: npm <package name>', msg);
    try {
      const res = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(args[0])}`);
      const pkg = res.data;
      const text = [
        `${pkg.name} (${pkg['dist-tags']?.latest})`,
        pkg.description || '',
        `Homepage: ${pkg.homepage || 'N/A'}`
      ].join('\n');
      await reply(sock, remoteJid, text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Package not found on npm.', msg);
    }
  }
};

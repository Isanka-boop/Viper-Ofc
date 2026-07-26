const axios = require('axios');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'github',
  aliases: ['gh'],
  category: 'search',
  description: 'Look up a GitHub user profile',
  async execute({ sock, remoteJid, args, msg }) {
    if (!args.length) return reply(sock, remoteJid, 'Usage: github <username>', msg);
    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(args[0])}`);
      const u = res.data;
      const text = [
        `${u.name || u.login}`,
        u.bio || '',
        `Followers: ${u.followers}`,
        `Public repos: ${u.public_repos}`,
        u.html_url
      ].filter(Boolean).join('\n');
      await reply(sock, remoteJid, text, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'GitHub user not found.', msg);
    }
  }
};

const config = require('../../config/config');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'donate',
  aliases: [],
  category: 'general',
  description: 'Show support and donation info',
  async execute({ sock, remoteJid, msg }) {
    await reply(sock, remoteJid, `If you enjoy ${config.bot.name}, consider supporting development by sharing the bot and joining our channel.`, msg);
  }
};

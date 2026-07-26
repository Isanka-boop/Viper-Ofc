const config = require('../../config/config');

module.exports = {
  name: 'about',
  aliases: ['info'],
  category: 'general',
  description: 'Learn more about this bot',
  async execute({ sock, remoteJid, msg }) {
    const text = [
      `${config.bot.name}`,
      'An ultra fast WhatsApp multi device bot built on Baileys.',
      '',
      `Owner: ${config.bot.ownerName}`,
      `Website: ${config.branding.siteUrl}`,
      '',
      config.branding.footer
    ].join('\n');
    await sock.sendMessage(remoteJid, { text }, { quoted: msg });
  }
};


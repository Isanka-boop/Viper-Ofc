const config = require('../../config/config');

module.exports = {
  name: 'support',
  aliases: ['channel'],
  category: 'general',
  description: 'Show the official support channel link',
  async execute({ sock, remoteJid, msg }) {
    const text = [
      'Join our official support channel:',
      config.branding.supportChannel,
      '',
      config.branding.footer
    ].join('\n');
    await sock.sendMessage(remoteJid, { text }, { quoted: msg });
  }
};

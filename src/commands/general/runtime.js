const os = require('os');
const config = require('../../config/config');

module.exports = {
  name: 'runtime',
  aliases: ['sysinfo', 'system'],
  category: 'general',
  description: 'Show system and runtime information',
  async execute({ sock, remoteJid, msg }) {
    const mem = process.memoryUsage();
    const text = [
      'System Information',
      '',
      `Platform: ${os.platform()} ${os.release()}`,
      `Node version: ${process.version}`,
      `CPU cores: ${os.cpus().length}`,
      `Memory used: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      `Free system memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
      '',
      config.branding.footer
    ].join('\n');
    await sock.sendMessage(remoteJid, { text }, { quoted: msg });
  }
};

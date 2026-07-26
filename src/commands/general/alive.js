const config = require('../../config/config');
const { getStatus } = require('../../lib/whatsapp');

module.exports = {
  name: 'alive',
  aliases: ['status'],
  category: 'general',
  description: 'Check if the bot is online and view uptime',
  async execute({ sock, remoteJid, msg }) {
    const st = getStatus();
    const uptimeSec = Math.floor(st.uptimeMs / 1000);
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = uptimeSec % 60;

    const text = [
      `${config.bot.name} is online and running.`,
      '',
      `Status: ${st.status}`,
      `Uptime: ${h}h ${m}m ${s}s`,
      `Owner: ${config.bot.ownerName}`,
      '',
      config.branding.footer
    ].join('\n');

    await sock.sendMessage(remoteJid, { text }, { quoted: msg });
  }
};

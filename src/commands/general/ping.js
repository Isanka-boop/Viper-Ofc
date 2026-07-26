module.exports = {
  name: 'ping',
  aliases: ['speed'],
  category: 'general',
  description: 'Check bot response speed',
  async execute({ sock, remoteJid, msg }) {
    const start = Date.now();
    const sent = await sock.sendMessage(remoteJid, { text: 'Testing speed...' }, { quoted: msg });
    const ms = Date.now() - start;
    const { reply } = require('../../lib/commandHelpers');
    await sock.sendMessage(remoteJid, { text: `Response time: ${ms}ms`, edit: sent.key }).catch(async () => {
      await reply(sock, remoteJid, `Response time: ${ms}ms`, msg);
    });
  }
};

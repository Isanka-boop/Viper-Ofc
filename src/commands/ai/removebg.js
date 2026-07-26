const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'removebg',
  aliases: ['nobg'],
  category: 'ai',
  description: 'Remove background from a quoted image (requires REMOVE_BG_API_KEY)',
  async execute({ sock, remoteJid, msg }) {
    if (!config.apiKeys.removeBg) {
      return reply(sock, remoteJid, 'This command is not configured. Set REMOVE_BG_API_KEY in the environment to enable it.', msg);
    }
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Send or reply to an image with this command.', msg);

    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const form = new FormData();
    form.append('image_file', buffer, 'image.png');
    form.append('size', 'auto');

    try {
      const res = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
        headers: { ...form.getHeaders(), 'X-Api-Key': config.apiKeys.removeBg },
        responseType: 'arraybuffer'
      });
      await sock.sendMessage(remoteJid, { image: Buffer.from(res.data) }, { quoted: msg });
    } catch (err) {
      await reply(sock, remoteJid, 'Background removal failed.', msg);
    }
  }
};

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'tourl',
  aliases: ['upload'],
  category: 'converter',
  description: 'Upload a quoted image and get a shareable URL',
  async execute({ sock, remoteJid, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
      || msg.message?.imageMessage;
    if (!quoted) return reply(sock, remoteJid, 'Send or reply to an image with this command.', msg);

    const axios = require('axios');
    const FormData = require('form-data');

    const stream = await downloadContentFromMessage(quoted, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const form = new FormData();
    form.append('file', buffer, 'image.png');

    try {
      const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders()
      });
      const url = res.data?.data?.url || 'Upload succeeded but no URL was returned.';
      await reply(sock, remoteJid, `Uploaded: ${url}`, msg);
    } catch (err) {
      await reply(sock, remoteJid, 'Upload failed. The upload service may be unavailable right now.', msg);
    }
  }
};

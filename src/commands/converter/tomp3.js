const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { reply } = require('../../lib/commandHelpers');

module.exports = {
  name: 'tomp3',
  aliases: ['toaudio'],
  category: 'converter',
  description: 'Convert a quoted video into an audio file',
  async execute({ sock, remoteJid, msg }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    if (!quoted) return reply(sock, remoteJid, 'Reply to a video with this command.', msg);

    const stream = await downloadContentFromMessage(quoted, 'video');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const tmpIn = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
    const tmpOut = path.join(os.tmpdir(), `out_${Date.now()}.mp3`);
    fs.writeFileSync(tmpIn, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(tmpIn).noVideo().audioCodec('libmp3lame').save(tmpOut).on('end', resolve).on('error', reject);
    });

    const audioBuffer = fs.readFileSync(tmpOut);
    await sock.sendMessage(remoteJid, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: msg });

    fs.unlinkSync(tmpIn);
    fs.unlinkSync(tmpOut);
  }
};

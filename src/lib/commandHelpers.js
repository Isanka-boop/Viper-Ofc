const config = require('../config/config');

function withFooter(text) {
  return `${text}\n\n${config.branding.footer}`;
}

async function reply(sock, jid, text, msg) {
  return sock.sendMessage(jid, { text: withFooter(text) }, msg ? { quoted: msg } : {});
}

function isOwner(sender) {
  const ownerNumber = config.bot.ownerNumber.replace(/[^0-9]/g, '');
  const senderNumber = sender.split('@')[0].split(':')[0];
  return ownerNumber && senderNumber === ownerNumber;
}

async function isGroupAdmin(sock, groupJid, sender) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    const participant = meta.participants.find((p) => p.id === sender);
    return Boolean(participant?.admin);
  } catch (_) {
    return false;
  }
}

async function isBotAdmin(sock, groupJid) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const participant = meta.participants.find((p) => p.id.startsWith(botJid.split('@')[0]));
    return Boolean(participant?.admin);
  } catch (_) {
    return false;
  }
}

module.exports = { withFooter, reply, isOwner, isGroupAdmin, isBotAdmin };

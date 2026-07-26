function getMessageType(message) {
  if (!message) return null;
  return Object.keys(message)[0];
}

function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.templateButtonReplyMessage?.selectedId ||
    ''
  );
}

function getQuotedMessage(msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctx || !ctx.quotedMessage) return null;
  return {
    message: ctx.quotedMessage,
    participant: ctx.participant,
    stanzaId: ctx.stanzaId
  };
}

function getMentions(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

function isGroup(jid) {
  return jid?.endsWith('@g.us');
}

module.exports = { getMessageType, extractText, getQuotedMessage, getMentions, isGroup };

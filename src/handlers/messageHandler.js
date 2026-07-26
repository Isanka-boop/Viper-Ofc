const config = require('../config/config');
const logger = require('../lib/logger');
const rateLimiter = require('../lib/rateLimiter');
const { extractText, isGroup } = require('../lib/messageUtils');
const { getCommand } = require('./commandLoader');
const User = require('../database/models/User');
const Settings = require('../database/models/Settings');
const Log = require('../database/models/Log');

const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

async function getScopedSettings(scope) {
  let settings = await Settings.findOne({ scope }).lean();
  if (!settings) {
    settings = await Settings.create({ scope });
    settings = settings.toObject();
  }
  return settings;
}

async function messageHandler(sock, { messages, type }, botEvents) {
  if (type !== 'notify') return;

  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue;

    const remoteJid = msg.key.remoteJid;
    const sender = msg.key.participant || remoteJid;
    const group = isGroup(remoteJid);
    const text = extractText(msg).trim();

    // Global settings (auto read / react at bot level)
    const globalSettings = await getScopedSettings('global');

    if (globalSettings.autoRead) {
      sock.readMessages([msg.key]).catch(() => {});
    }

    if (globalSettings.autoReact) {
      const emojiMap = { PLUS_ONE: '👍', HEART: '❤️', FIRE: '🔥', CHECK: '✅' };
      const emoji = emojiMap[globalSettings.autoReactEmoji] || '✅';
      sock
        .sendMessage(remoteJid, { react: { text: emoji, key: msg.key } })
        .catch(() => {});
    }

    // Track / upsert user
    User.findOneAndUpdate(
      { jid: sender },
      { $set: { lastSeen: new Date() }, $setOnInsert: { name: msg.pushName || '' } },
      { upsert: true }
    ).catch(() => {});

    // Anti-link enforcement (group scoped)
    if (group) {
      const groupSettings = await getScopedSettings(remoteJid);
      if (groupSettings.antilink && LINK_REGEX.test(text)) {
        try {
          const meta = await sock.groupMetadata(remoteJid);
          const senderIsAdmin = meta.participants.find((p) => p.id === sender)?.admin;
          if (!senderIsAdmin) {
            await sock.sendMessage(remoteJid, { delete: msg.key });
            await sock.sendMessage(remoteJid, {
              text: `Link detected and removed.\n\n${config.branding.footer}`
            });
          }
        } catch (err) {
          logger.error(`[ANTILINK] ${err.message}`);
        }
      }
    }

    if (!text.startsWith(config.bot.prefix)) continue;

    const withoutPrefix = text.slice(config.bot.prefix.length).trim();
    if (!withoutPrefix) continue;

    const [cmdName, ...args] = withoutPrefix.split(/\s+/);
    const command = getCommand(cmdName);
    if (!command) continue;

    if (!rateLimiter.allow(sender)) {
      await sock.sendMessage(remoteJid, {
        text: `You are sending commands too fast. Please slow down.\n\n${config.branding.footer}`
      });
      continue;
    }

    try {
      await command.execute({
        sock,
        msg,
        remoteJid,
        sender,
        args,
        text,
        isGroup: group,
        config,
        botEvents
      });

      User.findOneAndUpdate({ jid: sender }, { $inc: { commandsUsed: 1 } }).catch(() => {});
      Log.create({ type: 'command', message: cmdName, meta: { sender, remoteJid } }).catch(() => {});
    } catch (err) {
      logger.error(`[COMMAND] ${cmdName} failed: ${err.stack || err.message}`);
      Log.create({ type: 'error', message: err.message, meta: { cmdName, sender } }).catch(() => {});
      await sock
        .sendMessage(remoteJid, {
          text: `An error occurred while running that command.\n\n${config.branding.footer}`
        })
        .catch(() => {});
    }
  }
}

module.exports = messageHandler;

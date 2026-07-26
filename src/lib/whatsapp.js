const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const NodeCache = require('node-cache');
const { EventEmitter } = require('events');

const config = require('../config/config');
const logger = require('../lib/logger');
const { useMongoAuthState } = require('../database/mongoAuthState');
const messageHandler = require('../handlers/messageHandler');
const groupHandler = require('../handlers/groupHandler');
const { sendWelcomeMessage } = require('../handlers/welcomeHandler');
const Log = require('../database/models/Log');

const baileysLogger = pino({ level: 'silent' });
const msgRetryCache = new NodeCache();

class BotEvents extends EventEmitter {}
const botEvents = new BotEvents();

let sock = null;
let currentQR = null;
let currentPairCode = null;
let connectionStatus = 'disconnected'; // disconnected | connecting | connected | qr_pending | code_pending
let botStartTime = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;

const DEFAULT_SESSION_ID = 'primary';

async function startSock(sessionId = DEFAULT_SESSION_ID, pairMethod = null, phoneNumber = null) {
  const { state, saveCreds, clearSession } = await useMongoAuthState(sessionId);
  const { version } = await fetchLatestBaileysVersion();

  connectionStatus = 'connecting';

  sock = makeWASocket({
    version,
    logger: baileysLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger)
    },
    msgRetryCounterCache: msgRetryCache,
    generateHighQualityLinkPreview: true,
    browser: ['V!PER MD OFC', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true
  });

  // Request a pairing code if a phone number was supplied and we are not registered yet
  if (pairMethod === 'code' && phoneNumber && !sock.authState?.creds?.registered) {
    try {
      await delay(1500);
      const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
      currentPairCode = code;
      connectionStatus = 'code_pending';
      botEvents.emit('pair-code', code);
      logger.info(`[PAIRING] Pair code generated: ${code}`);
    } catch (err) {
      logger.error(`[PAIRING] Failed to generate pair code: ${err.message}`);
      botEvents.emit('pair-error', err.message);
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && pairMethod !== 'code') {
      currentQR = qr;
      connectionStatus = 'qr_pending';
      botEvents.emit('qr', qr);
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      botStartTime = Date.now();
      currentQR = null;
      currentPairCode = null;
      reconnectAttempts = 0;

      const botJid = sock.user?.id || '';
      logger.info(`[CONNECTION] V!PER MD OFC connected as ${botJid}`);
      botEvents.emit('connected', botJid);

      await Log.create({ type: 'connection', message: 'Bot connected', meta: { jid: botJid } }).catch(() => {});

      try {
        await sendWelcomeMessage(sock);
      } catch (err) {
        logger.error(`[WELCOME] Failed to send welcome message: ${err.message}`);
      }
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected';
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn(`[CONNECTION] Closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`);
      botEvents.emit('disconnected', { statusCode, shouldReconnect });

      await Log.create({
        type: 'connection',
        message: 'Bot disconnected',
        meta: { statusCode, shouldReconnect }
      }).catch(() => {});

      if (shouldReconnect) {
        reconnectAttempts += 1;
        const delayMs = Math.min(2000 * reconnectAttempts, MAX_RECONNECT_DELAY);
        logger.info(`[CONNECTION] Reconnecting in ${delayMs}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => startSock(sessionId).catch((e) => logger.error(e.message)), delayMs);
      } else {
        logger.warn('[CONNECTION] Logged out. Clearing session, awaiting new pairing.');
        await clearSession();
      }
    }
  });

  sock.ev.on('messages.upsert', async (payload) => {
    try {
      await messageHandler(sock, payload, botEvents);
    } catch (err) {
      logger.error(`[MESSAGE-HANDLER] ${err.stack || err.message}`);
    }
  });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      await groupHandler(sock, event);
    } catch (err) {
      logger.error(`[GROUP-HANDLER] ${err.stack || err.message}`);
    }
  });

  sock.ev.on('messages.delete', async (event) => {
    botEvents.emit('messages-delete', event);
  });

  return sock;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSock() {
  return sock;
}

function getStatus() {
  return {
    status: connectionStatus,
    uptimeMs: connectionStatus === 'connected' && botStartTime ? Date.now() - botStartTime : 0,
    jid: sock?.user?.id || null,
    reconnectAttempts
  };
}

function getCurrentQR() {
  return currentQR;
}

function getCurrentPairCode() {
  return currentPairCode;
}

module.exports = {
  startSock,
  getSock,
  getStatus,
  getCurrentQR,
  getCurrentPairCode,
  botEvents
};

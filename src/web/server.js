const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server: SocketIOServer } = require('socket.io');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const config = require('../config/config');
const logger = require('../lib/logger');
const { startSock, getStatus, botEvents } = require('../lib/whatsapp');
const { sendSupportReminder } = require('../handlers/welcomeHandler');
const PairSession = require('../database/models/PairSession');
const User = require('../database/models/User');
const Log = require('../database/models/Log');
const Settings = require('../database/models/Settings');
const { getAllCategories } = require('../handlers/commandLoader');

async function startWebServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: '*' } });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', limiter);

  // -------- Pairing API --------

  app.post('/api/pair/qr', async (req, res) => {
    try {
      const requestId = uuidv4();
      const expiresAt = new Date(Date.now() + config.pairing.qrExpirySeconds * 1000);

      await PairSession.create({
        requestId,
        method: 'qr',
        status: 'pending',
        ip: req.ip,
        expiresAt
      });

      const onQr = async (qr) => {
        const dataUrl = await QRCode.toDataURL(qr);
        io.to(requestId).emit('qr', { qr: dataUrl, expiresIn: config.pairing.qrExpirySeconds });
      };
      const onConnected = async (jid) => {
        await PairSession.updateOne({ requestId }, { $set: { status: 'connected', connectedJid: jid } });
        io.to(requestId).emit('connected', { jid });
        await sendSupportReminder(require('../lib/whatsapp').getSock(), jid).catch(() => {});
        cleanup();
      };
      const cleanup = () => {
        botEvents.off('qr', onQr);
        botEvents.off('connected', onConnected);
      };

      botEvents.on('qr', onQr);
      botEvents.on('connected', onConnected);

      await startSock(`web-${requestId}`, 'qr');

      setTimeout(async () => {
        const session = await PairSession.findOne({ requestId });
        if (session && session.status === 'pending') {
          await PairSession.updateOne({ requestId }, { $set: { status: 'expired' } });
          io.to(requestId).emit('expired');
          cleanup();
        }
      }, config.pairing.qrExpirySeconds * 1000);

      res.json({ success: true, requestId });
    } catch (err) {
      logger.error(`[WEB] QR pairing error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to start QR pairing.' });
    }
  });

  app.post('/api/pair/code', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber || !/^\d{8,15}$/.test(phoneNumber.replace(/[^0-9]/g, ''))) {
        return res.status(400).json({ success: false, message: 'Provide a valid phone number with country code.' });
      }

      const requestId = uuidv4();
      const expiresAt = new Date(Date.now() + config.pairing.codeExpirySeconds * 1000);

      await PairSession.create({
        requestId,
        method: 'code',
        number: phoneNumber,
        status: 'pending',
        ip: req.ip,
        expiresAt
      });

      const onCode = async (code) => {
        await PairSession.updateOne({ requestId }, { $set: { code } });
        io.to(requestId).emit('code', { code, expiresIn: config.pairing.codeExpirySeconds });
      };
      const onConnected = async (jid) => {
        await PairSession.updateOne({ requestId }, { $set: { status: 'connected', connectedJid: jid } });
        io.to(requestId).emit('connected', { jid });
        await sendSupportReminder(require('../lib/whatsapp').getSock(), jid).catch(() => {});
        cleanup();
      };
      const cleanup = () => {
        botEvents.off('pair-code', onCode);
        botEvents.off('connected', onConnected);
      };

      // Listeners must be attached BEFORE startSock runs — it can request
      // and emit the pairing code synchronously before this call resolves.
      botEvents.on('pair-code', onCode);
      botEvents.on('connected', onConnected);

      await startSock(`web-${requestId}`, 'code', phoneNumber);

      setTimeout(async () => {
        const session = await PairSession.findOne({ requestId });
        if (session && session.status === 'pending') {
          await PairSession.updateOne({ requestId }, { $set: { status: 'expired' } });
          io.to(requestId).emit('expired');
          cleanup();
        }
      }, config.pairing.codeExpirySeconds * 1000);

      res.json({ success: true, requestId });
    } catch (err) {
      logger.error(`[WEB] Pair code error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to generate pair code.' });
    }
  });

  app.get('/api/pair/status/:requestId', async (req, res) => {
    const session = await PairSession.findOne({ requestId: req.params.requestId }).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, status: session.status });
  });

  // -------- Dashboard API --------

  app.get('/api/status', async (req, res) => {
    const status = getStatus();
    res.json({ success: true, ...status, botName: config.bot.name, owner: config.bot.ownerName });
  });

  app.get('/api/stats', async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalCommandsRun = await Log.countDocuments({ type: 'command' });
    const categories = getAllCategories();
    let totalCommands = 0;
    for (const cmds of categories.values()) totalCommands += new Set(cmds).size;

    res.json({
      success: true,
      totalUsers,
      totalCommandsRun,
      totalCommands,
      categories: categories.size
    });
  });

  app.get('/api/health', async (req, res) => {
    const { isDatabaseConnected } = require('../database/connection');
    res.json({
      success: true,
      database: isDatabaseConnected() ? 'connected' : 'disconnected',
      bot: getStatus().status,
      uptimeProcess: process.uptime()
    });
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (requestId) => {
      socket.join(requestId);
    });
  });

  // SPA fallback for any non-API route -> single page site
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'Not found' });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  server.listen(config.port, () => {
    logger.info(`[WEB] ${config.bot.name} website running on port ${config.port}`);
  });

  return { app, server, io };
}

module.exports = { startWebServer };


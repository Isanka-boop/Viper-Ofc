require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://firstbro882_db_user:jr1yrw6kFenQ2Dei@visper-md-main.ilygjnh.mongodb.net/',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'Vipermd',

  bot: {
    name: process.env.BOT_NAME || 'V!PER MD OFC',
    ownerName: process.env.OWNER_NAME || 'Sasa Dev',
    ownerNumber: process.env.OWNER_NUMBER || '',
    prefix: process.env.BOT_PREFIX || '.'
  },

  branding: {
    footerLine1: process.env.FOOTER_LINE_1 || '(c) POWERD BY SASA DEV',
    footerLine2: process.env.FOOTER_LINE_2 || 'CONNECT V!PER MD :- https://vipermd.sasatech.online',
    supportChannel: process.env.SUPPORT_CHANNEL || 'https://whatsapp.com/channel/0029Vb86hKVJUM2SYD2qNw3K',
    logoUrl: process.env.LOGO_URL || 'https://i.ibb.co/G4z2SQ4M/160640.png',
    siteUrl: process.env.SITE_URL || 'https://vipermd.sasatech.online',
    get footer() {
      return `${this.footerLine1}\n${this.footerLine2}`;
    }
  },

  security: {
    sessionSecret: process.env.SESSION_SECRET || 'insecure_default_change_me',
    adminPassword: process.env.ADMIN_PASSWORD || 'Chamu2010@',
    jwtSecret: process.env.JWT_SECRET || 'insecure_jwt_change_me'
  },

  pairing: {
    codeExpirySeconds: parseInt(process.env.PAIR_CODE_EXPIRY_SECONDS || '30', 10),
    qrExpirySeconds: parseInt(process.env.QR_CODE_EXPIRY_SECONDS || '30', 10)
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10)
  },

  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    removeBg: process.env.REMOVE_BG_API_KEY || ''
  }
};


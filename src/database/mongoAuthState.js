/**
 * MongoDB backed auth state adapter for Baileys.
 * Mirrors the behaviour of useMultiFileAuthState but persists every key
 * into the Session collection so sessions survive restarts/redeploys
 * without relying on the local filesystem.
 */
const { proto } = require('@whiskeysockets/baileys');
const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');
const Session = require('./models/Session');
const logger = require('../lib/logger');

function serialize(value) {
  return JSON.parse(JSON.stringify(value, BufferJSON.replacer));
}

function deserialize(value) {
  return JSON.parse(JSON.stringify(value), BufferJSON.reviver);
}

async function readData(sessionId, key) {
  try {
    const doc = await Session.findOne({ sessionId: `${sessionId}:${key}` }).lean();
    if (!doc) return null;
    return deserialize(doc.data);
  } catch (err) {
    logger.error(`[AUTH-STATE] read error for ${key}: ${err.message}`);
    return null;
  }
}

async function writeData(sessionId, key, value) {
  try {
    await Session.updateOne(
      { sessionId: `${sessionId}:${key}` },
      { $set: { data: serialize(value), updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`[AUTH-STATE] write error for ${key}: ${err.message}`);
  }
}

async function removeData(sessionId, key) {
  try {
    await Session.deleteOne({ sessionId: `${sessionId}:${key}` });
  } catch (err) {
    logger.error(`[AUTH-STATE] remove error for ${key}: ${err.message}`);
  }
}

async function useMongoAuthState(sessionId) {
  const creds = (await readData(sessionId, 'creds')) || initAuthCreds();

  const keys = {};

  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        const data = {};
        await Promise.all(
          ids.map(async (id) => {
            let value = await readData(sessionId, `${type}-${id}`);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          })
        );
        return data;
      },
      set: async (data) => {
        const tasks = [];
        for (const category in data) {
          for (const id in data[category]) {
            const value = data[category][id];
            const key = `${category}-${id}`;
            tasks.push(value ? writeData(sessionId, key, value) : removeData(sessionId, key));
          }
        }
        await Promise.all(tasks);
      }
    }
  };

  const saveCreds = async () => {
    await writeData(sessionId, 'creds', state.creds);
  };

  const clearSession = async () => {
    await Session.deleteMany({ sessionId: new RegExp(`^${sessionId}:`) });
  };

  return { state, saveCreds, clearSession };
}

module.exports = { useMongoAuthState };

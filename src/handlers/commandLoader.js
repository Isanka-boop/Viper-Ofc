const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');

const commandsDir = path.join(__dirname, '..', 'commands');
const registry = new Map(); // name -> command object
const categories = new Map(); // category -> [command names]

function loadCommands() {
  registry.clear();
  categories.clear();

  const folders = fs.readdirSync(commandsDir).filter((f) =>
    fs.statSync(path.join(commandsDir, f)).isDirectory()
  );

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      try {
        delete require.cache[require.resolve(path.join(folderPath, file))];
        const cmd = require(path.join(folderPath, file));

        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
          logger.warn(`[COMMAND-LOADER] Skipping invalid command file: ${folder}/${file}`);
          continue;
        }

        cmd.category = cmd.category || folder;
        const names = [cmd.name, ...(cmd.aliases || [])];

        for (const n of names) {
          registry.set(n.toLowerCase(), cmd);
        }

        if (!categories.has(cmd.category)) categories.set(cmd.category, []);
        categories.get(cmd.category).push(cmd.name);
      } catch (err) {
        logger.error(`[COMMAND-LOADER] Failed loading ${folder}/${file}: ${err.message}`);
      }
    }
  }

  logger.info(`[COMMAND-LOADER] Loaded ${registry.size} command aliases across ${categories.size} categories`);
  return { registry, categories };
}

function getCommand(name) {
  return registry.get(name.toLowerCase());
}

function getAllCategories() {
  return categories;
}

function getRegistry() {
  return registry;
}

function registerCustomCommand(cmd) {
  if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
    throw new Error('Invalid custom command: requires name and execute()');
  }
  cmd.category = cmd.category || 'custom';
  const names = [cmd.name, ...(cmd.aliases || [])];
  for (const n of names) registry.set(n.toLowerCase(), cmd);
  if (!categories.has(cmd.category)) categories.set(cmd.category, []);
  categories.get(cmd.category).push(cmd.name);
  return true;
}

module.exports = {
  loadCommands,
  getCommand,
  getAllCategories,
  getRegistry,
  registerCustomCommand
};


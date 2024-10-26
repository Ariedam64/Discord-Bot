const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const loadEvents = (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);

      if (stat.isDirectory()) {
        loadEvents(filePath);
      } else if (file.endsWith('.js')) {
        const event = require(filePath);
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
      }
    }
  };

  loadEvents(path.join(__dirname, '../events'));
};
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../../data/economy.json');

function loadEconomy() {
  try {
    if (fs.existsSync(economyPath)) {
      const data = fs.readFileSync(economyPath, 'utf-8');
      return data ? JSON.parse(data) : {};
    }
  } catch (error) {
    console.error('❌ Error al cargar la economía:', error);
  }
  return {};
}

function saveEconomy(economy) {
  try {
    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
  } catch (error) {
    console.error('❌ Error al guardar la economía:', error);
  }
}

module.exports = {
  loadEconomy,
  saveEconomy
};

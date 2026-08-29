require('dotenv').config();

const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await db.query('ALTER TABLE products MODIFY image_url MEDIUMTEXT NOT NULL');
    console.log('Columna image_url migrada a MEDIUMTEXT');
  } catch (err) {
    console.error('Error migrando image_url:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

start();

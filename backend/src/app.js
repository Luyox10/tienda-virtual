const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;

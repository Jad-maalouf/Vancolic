const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const menuRoutes = require('./routes/menu.js');
const tableRoutes = require('./routes/tables.js');
const orderRoutes = require('./routes/orders.js');
const orderItemRoutes = require('./routes/orderItems.js');
const userRoutes = require('./routes/users.js');

// Confirmed via local testing: when netlify.toml redirects "/api/*" to this
// function, both `netlify dev` and (per Netlify's docs) production keep the
// original "/api/..." path in the request the function receives — the
// redirect's "to" pattern is not what actually reaches Express. Routes are
// mounted at both prefixes so this keeps working even if that ever changes.
const API_PREFIXES = ['/api', '/.netlify/functions/api'];

const app = express();
app.use(cors());
app.use(express.json());

function mount(subpath, router) {
  for (const prefix of API_PREFIXES) {
    app.use(`${prefix}${subpath}`, router);
  }
}

mount('/auth', authRoutes);
mount('/menu', menuRoutes);
mount('/tables', tableRoutes);
mount('/orders', orderRoutes);
mount('/order-items', orderItemRoutes);
mount('/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = { app };

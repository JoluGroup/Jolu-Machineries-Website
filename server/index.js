const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const quoteRoutes = require('./routes/quoteRoutes');

app.get('/', (req, res) => {
  res.send('Hello from JOLU Machinery Server!');
});

app.use('/api/quotes', quoteRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

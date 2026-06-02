require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const apiRouter = require('./routes/index');

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

app.use('/api', apiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PCMaxing API running on port ${PORT}`));

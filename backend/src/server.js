import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api', apiRouter);
app.use('/api', statsRouter);

app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

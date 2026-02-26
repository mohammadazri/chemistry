import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';
import authRoutes from './routes/auth';
import experimentRoutes from './routes/experiments';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT ?? 3000;

// Detrás del proxy/edge de Vercel: sin esto, req.ip no es la IP real.
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

const ALLOWED_ORIGINS = [
  'https://spa-blush-theta.vercel.app',
  'https://spa-staff-2026.vercel.app',
  'https://dashboard-mocha-tau-10.vercel.app',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Origen no permitido'));
  },
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((_, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
  });
}

app.use(express.static(join(__dirname, 'frontend')));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', app: 'admin-dashboard', timestamp: new Date().toISOString() });
});

// SPA fallback — todas las rutas sirven la SPA del admin
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, 'frontend', 'index.html'));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Admin Dashboard corriendo en http://localhost:${PORT}`);
  });
}

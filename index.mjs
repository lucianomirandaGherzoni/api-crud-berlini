import 'dotenv/config';
import express from 'express';
import rutasApi from './modulos/rutas.mjs';
import bodyParser from 'body-parser';
import cors from 'cors';

const PUERTO = process.env.PORT || 3000;
const app = express();

// ─── CORS: solo orígenes conocidos ───────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://www.berlinipastas.com',
    'https://berlinipastas.com',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, cb) => {
        // Permitir requests sin origin (Postman, Vercel internal, etc.) solo en dev
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        cb(new Error(`CORS bloqueado para el origen: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(rutasApi);

app.listen(PUERTO, () => {
    console.log(`✓ Servidor corriendo en puerto ${PUERTO}`);
});

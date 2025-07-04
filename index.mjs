import express from 'express';
import rutasApi from './modulos/rutas.mjs';
import bodyParser from 'body-parser'; // Ya lo tienes
import cors from 'cors'; // Ya lo tienes

const PUERTO = 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json()); // Para JSON bodies
app.use(express.json()); // Para JSON bodies (redundante con bodyParser.json() pero no hace daño)
app.use(express.urlencoded({ extended: true })); // Para manejar datos de formularios URL-encoded

app.use(rutasApi);

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

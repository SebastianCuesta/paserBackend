import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import actividadRoutes from "./routes/actividadRoutes.js";
import respuestaRoutes from "./routes/respuestaRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/respuestas", respuestaRoutes);

// Servir archivos estáticos (uploads) para que desde el cliente se pueda acceder a ellos:
app.use("/uploads/actividades", express.static(path.join("uploads/actividades")));
app.use("/uploads/respuestas", express.static(path.join("uploads/respuestas")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});
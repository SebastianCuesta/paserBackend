// routes/respuestaRoutes.js
import express from "express";
import {
  enviarRespuesta,
  obtenerRespuestasPorAprendiz,
} from "../controllers/respuestaController.js";
import { upload } from "../utils/multerConfig.js";

const router = express.Router();

// Enviar evidencia de una actividad (usuario autenticado)
router.post(
  "/:actividadId",
  upload.single("archivoEvidencia"),
  enviarRespuesta
);

// Obtener todas las respuestas del aprendiz logueado
router.get("/mis-respuestas", obtenerRespuestasPorAprendiz);

export default router;

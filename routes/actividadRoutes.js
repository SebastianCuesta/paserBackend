// routes/actividadRoutes.js
import express from "express";
import {
  crearActividad,
  listarActividades,
  obtenerActividad,
  actualizarActividad,
  eliminarActividad,
  listarRespuestas,
  aprobarRechazarRespuesta,
} from "../controllers/actividadController.js";
import { upload } from "../utils/multerConfig.js";

const router = express.Router();

// Crear actividad (sin auth, usamos el 'creador' enviado en req.body)
router.post(
  "/",
  upload.array("archivosAdjuntos", 5),
  crearActividad
);

// Listar todas las actividades
router.get("/", listarActividades);

// Obtener una sola actividad por ID
router.get("/:id", obtenerActividad);

// Actualizar actividad (subir nuevos adjuntos opcionales)
router.put(
  "/:id",
  upload.array("archivosAdjuntos", 5),
  actualizarActividad
);

// Eliminar actividad
router.delete("/:id", eliminarActividad);

// Listar respuestas de una actividad (param 'actividadId')
router.get("/:actividadId/respuestas", listarRespuestas);

// Aprobar/Reprobar respuesta (param 'id' de la respuesta)
router.put("/respuestas/:id", aprobarRechazarRespuesta);

export default router;

import Respuesta from "../models/Respuesta.js";
import Actividad from "../models/Actividad.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";

// ================================
// 1) Enviar o actualizar evidencia de una respuesta
// ================================
export const enviarRespuesta = async (req, res) => {
  try {
    let aprendizId = null;
    if (req.body.aprendizId) {
      aprendizId = req.body.aprendizId;
    } else if (req.query.aprendizId) {
      aprendizId = req.query.aprendizId;
    }

    if (!aprendizId) {
      return res.status(400).json({ message: "Falta id de aprendiz" });
    }

    // ✅ Usar aprendizId directamente para verificar el estado del usuario
    const user = await User.findById(aprendizId);
    if (!user || user.estado !== 'activo') {
      return res.status(403).json({
        message: "Tu cuenta está inactiva. No puedes enviar actividades."
      });
    }

    const { actividadId } = req.params;
    const actividad = await Actividad.findById(actividadId);
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const fechaActual = new Date();
    const fechaLimite = new Date(actividad.fechaLimite);

    if (fechaActual > fechaLimite) {
      return res.status(400).json({
        message: `La fecha límite para esta actividad (${fechaLimite.toLocaleDateString()}) ya ha pasado`
      });
    }

    // Validación de archivo
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Debe adjuntar un archivo de evidencia" });
    }

    const archivoEvidencia = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/uploads/respuestas/${req.file.filename}`,
    };

    let respuesta = await Respuesta.findOne({
      actividad: actividadId,
      aprendiz: aprendizId,
    });

    if (respuesta) {
      respuesta.archivoEvidencia = archivoEvidencia;
      respuesta.fechaEnvio = Date.now();
      respuesta.estado = "Pendiente";
      respuesta.comentario = "";
      await respuesta.save();
    } else {
      respuesta = new Respuesta({
        actividad: actividadId,
        aprendiz: aprendizId,
        archivoEvidencia,
      });
      await respuesta.save();
    }

    return res.status(201).json({
      message: "Respuesta enviada correctamente (pendiente de revisión)",
      respuesta,
    });
  } catch (error) {
    console.error("Error enviarRespuesta:", error);
    res.status(500).json({ message: "Error al enviar respuesta" });
  }
};

// ================================
// 2) Obtener todas las respuestas de un aprendiz
// ================================
export const obtenerRespuestasPorAprendiz = async (req, res) => {
  try {
    // 2.1) Determinar aprendiz de la query o de req.user
    const aprendizId = req.query.aprendiz || (req.user && req.user._id);
    if (!aprendizId) {
      return res
        .status(400)
        .json({ message: "Falta id de aprendiz en query o en token" });
    }

    // 2.2) Buscar todas las respuestas de ese aprendiz
    let respuestas = await Respuesta.find({ aprendiz: aprendizId })
      .populate("actividad", "_id nombre") // <-- Aseguramos que venga _id también
      .sort({ createdAt: -1 });

    // 2.3) Filtrar posibles respuestas con actividad eliminada
    respuestas = respuestas.filter((r) => r.actividad && r.actividad._id);

    return res.json(respuestas);
  } catch (error) {
    console.error("Error obtenerRespuestasPorAprendiz:", error);
    return res.status(500).json({ message: "Error al obtener tus respuestas" });
  }
};

// ================================
// 3) Aprobar o rechazar una respuesta (solo admin)
// ================================
export const aprobarRechazarRespuesta = async (req, res) => {
  try {
    const { id } = req.params; // id de la respuesta
    const { estado, comentario } = req.body; // estado: "Aprobado" o "Reprobado"

    // 3.1) Buscar la respuesta y poblar aprendiz y actividad para poder enviar correo
    const respuesta = await Respuesta.findById(id).populate(
      "aprendiz actividad"
    );

    if (!respuesta) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    // 3.2) Actualizar el estado y comentario
    respuesta.estado = estado;
    respuesta.comentario = comentario || "";
    await respuesta.save();

    // 3.3) Enviar correo al aprendiz notificando
    const asunto = `Tu respuesta a la actividad "${respuesta.actividad.nombre}" ha sido ${estado}`;
    const html = `
      <h2>Tu actividad ha sido ${estado}</h2>
      <p>Actividad: ${respuesta.actividad.nombre}</p>
      ${comentario ? `<p>Comentario: ${comentario}</p>` : ""}
      <p>Gracias por participar.</p>
    `;
    await sendEmail(respuesta.aprendiz.correo, asunto, html);

    return res.json({
      message: `Respuesta marcada como ${estado}`,
      respuesta,
    });
  } catch (error) {
    console.error("Error aprobarRechazarRespuesta:", error);
    return res
      .status(500)
      .json({ message: "Error al procesar la revisión de respuesta" });
  }
};

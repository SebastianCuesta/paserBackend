// controllers/actividadController.js
import Actividad from "../models/Actividad.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import Respuesta from "../models/Respuesta.js";

export const crearActividad = async (req, res) => {
  try {
    // 1) Extraemos datos del body, incluyendo 'creador' enviado desde el front
    const { nombre, descripcion, fechaLimite, creador } = req.body;

    const fechaLimiteUTC = new Date(fechaLimite);
    fechaLimiteUTC.setUTCHours(23, 59, 59, 999); // Fin del día en UTC

    // 2) Procesamos archivos subidos por multer
    const archivosAdjuntos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        archivosAdjuntos.push({
          filename: file.filename,
          originalname: file.originalname,
          url: `/uploads/actividades/${file.filename}`,
        });
      });
    }

    // 3) Creamos la actividad, asignando creador desde req.body
    const nuevaActividad = new Actividad({
      nombre,
      descripcion,
      fechaLimite: fechaLimiteUTC, // Usamos la fecha ajustada
      archivosAdjuntos,
      creador: creador || null,
    });

    await nuevaActividad.save();

    // 4) Enviar correos a aprendices activos (rol='user', estado='activo')
    const aprendicesActivos = await User.find({ rol: "user", estado: "activo" });

    const asunto = `Nueva actividad: ${nombre}`;
    const html = `
      <h2>¡Hay una nueva actividad disponible!</h2>
      <p><strong>${nombre}</strong></p>
      <p>${descripcion}</p>
      <p>Fecha límite: ${new Date(fechaLimite).toLocaleDateString()}</p>
      <p>Ingresa a la plataforma para revisarla y enviar tu evidencia.</p>
    `;

    for (const aprendiz of aprendicesActivos) {
      await sendEmail(aprendiz.correo, asunto, html);
    }

    return res.status(201).json({
      message: "Actividad creada y correos enviados",
      actividad: nuevaActividad,
    });
  } catch (error) {
    console.error("Error crearActividad:", error);
    return res.status(500).json({ message: "Error al crear actividad" });
  }
};

export const listarActividades = async (req, res) => {
  try {
    const actividades = await Actividad.find().sort({ createdAt: -1 });
    res.json(actividades);
  } catch (error) {
    console.error("Error listarActividades:", error);
    res.status(500).json({ message: "Error al obtener actividades" });
  }
};

export const obtenerActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id);
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.json(actividad);
  } catch (error) {
    console.error("Error obtenerActividad:", error);
    res.status(500).json({ message: "Error al obtener actividad" });
  }
};

export const actualizarActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id);
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const { nombre, descripcion, fechaLimite } = req.body;

    if (nombre !== undefined) actividad.nombre = nombre;
    if (descripcion !== undefined) actividad.descripcion = descripcion;
     if (fechaLimite !== undefined) {
      // Ajustar la fecha límite para UTC
      const fechaLimiteUTC = new Date(fechaLimite);
      fechaLimiteUTC.setUTCHours(23, 59, 59, 999);
      actividad.fechaLimite = fechaLimiteUTC;
    }

    // Manejo de nuevos archivos adjuntos (opcional)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        actividad.archivosAdjuntos.push({
          filename: file.filename,
          originalname: file.originalname,
          url: `/uploads/actividades/${file.filename}`,
        });
      });
    }

    await actividad.save();
    res.json({ message: "Actividad actualizada", actividad });
  } catch (error) {
    console.error("Error actualizarActividad:", error);
    res.status(500).json({ message: "Error al actualizar actividad" });
  }
};

export const eliminarActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndDelete(req.params.id);
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.json({ message: "Actividad eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminarActividad:", error);
    res.status(500).json({ message: "Error al eliminar actividad" });
  }
};

// Para el panel de “Revisión de actividades”
export const listarRespuestas = async (req, res) => {
  try {
    // Filtrar por actividad si viene actividadId en req.params
    const actividadId = req.params.actividadId;
    const filtro = actividadId ? { actividad: actividadId } : {};
    const respuestas = await Respuesta.find(filtro)
      .populate("aprendiz", "nombres apellidos correo")
      .populate("actividad", "nombre");
    res.json(respuestas);
  } catch (error) {
    console.error("Error listarRespuestas:", error);
    res.status(500).json({ message: "Error al obtener respuestas" });
  }
};

export const aprobarRechazarRespuesta = async (req, res) => {
  try {
    const { id } = req.params; // id de la respuesta
    const { estado, comentario } = req.body; // estado: "Aprobado" o "Reprobado"
    const respuesta = await Respuesta.findById(id).populate("aprendiz actividad");

    if (!respuesta) {
      return res.status(404).json({ message: "Respuesta no encontrada" });
    }

    respuesta.estado = estado;
    respuesta.comentario = comentario || "";
    await respuesta.save();

    // Enviar correo al aprendiz notificando su estado
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
    res.status(500).json({ message: "Error al procesar respuesta" });
  }
};

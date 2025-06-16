// models/Respuesta.js
import mongoose from "mongoose";

const respuestaSchema = new mongoose.Schema(
  {
    actividad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Actividad",
      required: true,
    },
    aprendiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    fechaEnvio: {
      type: Date,
      default: Date.now,
    },
    archivoEvidencia: {
      filename: String,
      originalname: String,
      url: String,
    },
    estado: {
      type: String,
      enum: ["Pendiente", "Aprobado", "Reprobado"],
      default: "Pendiente",
    },
    comentario: {
      type: String, // comentario del administrador al aprobar/reprobar
    },
  },
  { timestamps: true }
);

export default mongoose.model("Respuesta", respuestaSchema);

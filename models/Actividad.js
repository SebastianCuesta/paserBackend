// models/Actividad.js
import mongoose from "mongoose";

const actividadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    fechaLimite: {
      type: Date,
      required: true,
    },
    archivosAdjuntos: [
      {
        filename: String, // nombre de archivo en el servidor
        originalname: String, // nombre original
        url: String,         
      },
    ],
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    fechaCreado: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Actividad", actividadSchema);

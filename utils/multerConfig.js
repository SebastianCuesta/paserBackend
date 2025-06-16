// utils/multerConfig.js
import multer from "multer";
import path from "path";

// Carpeta donde se guardan temporalmente los archivos (puede ser 'uploads/actividades' y 'uploads/respuestas')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Si viene de creación de actividad:
    if (req.baseUrl.includes("/actividades")) {
      cb(null, "uploads/actividades/");
    } else {
      // Respuestas de aprendices
      cb(null, "uploads/respuestas/");
    }
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp‐nombreoriginal
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    // Aceptar pdf, docx, zip, y multimedia (según necesidad)
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".pdf", ".docx", ".zip", ".rar", ".jpg", ".png"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de archivo no permitido"), false);
    }
  },
});

// utils/multerConfig.js
import multer from "multer";
import path from "path";

// Función para sanitizar el nombre del archivo
const sanitizeFileName = (originalname) => {
  return originalname
    .normalize("NFD")                         // Elimina acentos
    .replace(/[\u0300-\u036f]/g, "")         // Más limpieza de acentos
    .replace(/\s+/g, "_")                    // Reemplaza espacios por guiones bajos
    .replace(/[^\w.-]/gi, "")                // Elimina caracteres no alfanuméricos salvo punto y guion
    .toLowerCase();                          // Opcional: todo a minúsculas
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes("/actividades")) {
      cb(null, "uploads/actividades/");
    } else {
      cb(null, "uploads/respuestas/");
    }
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}-${sanitized}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".pdf", ".docx", ".zip", ".rar", ".jpg", ".png"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de archivo no permitido"), false);
    }
  },
});

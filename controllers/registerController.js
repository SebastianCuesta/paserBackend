import xlsx from 'xlsx';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail.js';

export const register = async (req, res) => {
  const {
    nombres,
    apellidos,
    tipoIdentificacion,
    identificacion,
    numTelefono,
    correo,
    programaFormacion,
    numeroFicha,
    jornada,
    rol,
    estado
  } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (
    !nombres ||
    !apellidos ||
    !tipoIdentificacion ||
    identificacion == null ||
    !numTelefono ||
    !correo ||
    !programaFormacion ||
    numeroFicha == null ||
    !jornada ||
    !rol ||
    !estado

  ) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si ya existe un usuario con ese correo
    const existingUser = await User.findOne({ correo });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña usando el número de identificación como contraseña inicial
    const hashedPassword = await bcrypt.hash(
      identificacion.toString(),
      10
    );

    // Crear nuevo usuario según el esquema
    const newUser = new User({
      nombres,
      apellidos,
      tipoIdentificacion,
      identificacion,
      numTelefono,
      correo,
      programaFormacion,
      numeroFicha,
      jornada,
      password: hashedPassword,
      rol,
      estado,
    });

    await newUser.save();

    // Enviar correo de bienvenida
    const html = `
      <h2>¡Bienvenido a PASER, ${nombres} ${apellidos}!</h2>
      <p>Tu cuenta ha sido creada exitosamente con el correo <strong>${correo}</strong>.</p>
      <p>Recuerda que tu contraseña inicial es tu número de documento de identidad.</p>
      <p>Gracias por confiar en nosotros.</p>
    `;
    await sendEmail(correo, '🎉 Bienvenido a PASER', html);

    // Preparar respuesta sin exponer la contraseña
    const userWithoutPassword = {
      _id: newUser._id,
      nombres: newUser.nombres,
      apellidos: newUser.apellidos,
      tipoIdentificacion: newUser.tipoIdentificacion,
      identificacion: newUser.identificacion,
      numTelefono: newUser.numTelefono,
      correo: newUser.correo,
      programaFormacion: newUser.programaFormacion,
      numeroFicha: newUser.numeroFicha,
      jornada: newUser.jornada,
      rol: newUser.rol,
      estado: newUser.estado,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('❌ Error en el registro:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
  export const bulkRegister = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'El archivo está vacío' });
    }

    const results = {
      success: 0,
      errors: [],
      total: data.length
    };

    // Procesar cada usuario en paralelo
    await Promise.all(data.map(async (row, index) => {
      try {
        // Validar campos mínimos
        if (!row.nombres || !row.apellidos || !row.tipoIdentificacion || 
            !row.identificacion || !row.correo || !row.numTelefono) {
          throw new Error('Faltan campos obligatorios');
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
          $or: [
            { correo: row.correo },
            { identificacion: row.identificacion }
          ]
        });

        if (existingUser) {
          throw new Error('Usuario ya existe');
        }

        // Hashear la contraseña (usando identificación como contraseña inicial)
        const hashedPassword = await bcrypt.hash(row.identificacion.toString(), 10);

        // Crear nuevo usuario
        const newUser = new User({
          nombres: row.nombres,
          apellidos: row.apellidos,
          tipoIdentificacion: row.tipoIdentificacion,
          identificacion: row.identificacion,
          numTelefono: row.numTelefono,
          correo: row.correo,
          programaFormacion: row.programaFormacion || '',
          numeroFicha: row.numeroFicha || null,
          jornada: row.jornada || 'Mañana',
          password: hashedPassword,
          rol: row.rol || 'user',
          estado: row.estado || 'activo'
        });

        await newUser.save();

        // Enviar correo de bienvenida
        const html = `
          <h2>¡Bienvenido a PASER, ${row.nombres} ${row.apellidos}!</h2>
          <p>Tu cuenta ha sido creada exitosamente con el correo <strong>${row.correo}</strong>.</p>
          <p>Recuerda que tu contraseña inicial es tu número de documento de identidad.</p>
        `;
        await sendEmail(row.correo, '🎉 Bienvenido a PASER', html);

        results.success++;
      } catch (error) {
        results.errors.push({
          row: index + 2, // +2 porque Excel empieza en 1 y la primera fila es encabezado
          error: error.message,
          data: row
        });
      }
    }));

    return res.status(200).json({
      message: `Proceso completado: ${results.success} de ${results.total} usuarios creados`,
      details: results
    });
  } catch (error) {
    console.error('Error en carga masiva:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

import User from "../models/User.js";

// ✅ Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // omitimos el password por seguridad
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// ✅ Eliminar usuario por ID
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// ✅ Editar usuario por ID
export const updateUser = async (req, res) => {
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
    estado,
  } = req.body;

  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado" });
    }

    // Solo actualizamos los campos que vengan en el body; si no vienen, conservamos el valor actual
    if (nombres !== undefined) user.nombres = nombres;
    if (apellidos !== undefined) user.apellidos = apellidos;
    if (tipoIdentificacion !== undefined)
      user.tipoIdentificacion = tipoIdentificacion;
    if (identificacion !== undefined)
      user.identificacion = identificacion;
    if (numTelefono !== undefined) user.numTelefono = numTelefono;
    if (correo !== undefined) user.correo = correo;
    if (programaFormacion !== undefined)
      user.programaFormacion = programaFormacion;
    if (numeroFicha !== undefined) user.numeroFicha = numeroFicha;
    if (jornada !== undefined) user.jornada = jornada;
    if (rol !== undefined) user.rol = rol;
    if (estado !== undefined) user.estado = estado;

    const updatedUser = await user.save();

    res.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar usuario" });
  }
};

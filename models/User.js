import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

{
    nombres: {
      type: String,
      required: true,
    },
    apellidos: {
      type: String,
      required: true,
    },
    tipoIdentificacion: {
      enum: ["CC", "TI", "PPT", "CE"],
      type: String,
      required: true,
    },
    identificacion: {
      type: Number,
      required: true,
    },
    numTelefono: {
      type: Number,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    programaFormacion: {
      type: String,
      required: true,
    },
    numeroFicha: {
      type: Number,
      required: true,
    },
    jornada: {
      type: String,
      enum: ["Mañana", "Tarde", "Noche"],
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("Users", userSchema);

export default User;
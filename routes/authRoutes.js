import express from 'express';
import { login } from '../controllers/authController.js';
import { register } from '../controllers/registerController.js';
import { forgotPassword } from '../controllers/forgotPasswordController.js';
import { resetPassword } from '../controllers/resetPasswordController.js';
import { getAllUsers, deleteUser, updateUser } from '../controllers/adminController.js';
import bulkRegisterRoutes from './bulkRegisterRoutes.js'; // Importa las nuevas rutas

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

// Agrega las rutas de carga masiva bajo un prefijo
router.use('/bulk', bulkRegisterRoutes);

export default router;
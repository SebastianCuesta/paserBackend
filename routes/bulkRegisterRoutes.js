import express from 'express';
import { bulkRegister } from '../controllers/registerController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), bulkRegister);

export default router;
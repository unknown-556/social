import express from 'express';
import { getReport, getAllReports, updateReport, deleteReport, deleteYourReport } from '../controllers/reportController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/report/:id', getReport);
router.get('/reports', getAllReports);
router.put('/report/:id', auth, updateReport);
router.delete('/report/:id',  deleteReport);
router.delete('/report/:id', auth, deleteYourReport)

export default router;

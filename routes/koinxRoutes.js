import express from 'express';
const router=express.Router();
import {getStats,getDeviation} from '../controllers/koinxController.js';
router.get('/stats',getStats);
router.get('/deviation',getDeviation);
export default router;
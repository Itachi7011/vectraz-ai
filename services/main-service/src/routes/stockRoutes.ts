import { Router } from "express";
import * as stockController from "../controllers/stockController";

const router = Router();
router.get("/", stockController.getStockTicker);
export default router;

import { Router } from "express";
import { LocationController } from "../controllers/location.controller";

const router = Router();
const locationController = new LocationController();

// POST /location - Salvar/atualizar localização
router.post("/", locationController.saveLocation);

export default router;

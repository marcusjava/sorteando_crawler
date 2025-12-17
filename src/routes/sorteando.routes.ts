import { Router } from "express";
import { LocalController } from "../controllers/local.controller";

const router = Router();
const localController = new LocalController();

// GET /sorteando/locais - Listar todos os locais
router.get("/locais", localController.getAll);

// GET /sorteando/locais/:id - Buscar local por ID
router.get("/locais/:id", localController.getById);

export default router;

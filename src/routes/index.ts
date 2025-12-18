import { Router } from "express";
import locationRoutes from "./location.routes";
import sorteandoRoutes from "./sorteando.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Rotas principais
router.use("/auth", authRoutes);
router.use("/location", locationRoutes);
router.use("/sorteando", sorteandoRoutes);

// Rota raiz
router.get("/", (req, res) => {
  res.json({
    message: "API Sorteando Crawler",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      location: "/location",
      sorteando: "/sorteando",
    },
  });
});

export default router;

import { Router } from "express";
import { LocalController } from "../controllers/local.controller";

const router = Router();
const localController = new LocalController();

/**
 * @swagger
 * /api/sorteando/locais:
 *   get:
 *     summary: Listar todos os locais
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: Lista de locais
 */
router.get("/locais", localController.getAll);

/**
 * @swagger
 * /api/sorteando/locais/{id}:
 *   get:
 *     summary: Buscar local por ID
 *     tags: [Locais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Local encontrado
 *       404:
 *         description: Local não encontrado
 */
router.get("/locais/:id", localController.getById);

/**
 * @swagger
 * /api/sorteando/locais:
 *   post:
 *     summary: Criar novo local
 *     tags: [Locais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - endereco
 *               - logo
 *               - responsavel
 *               - latitude
 *               - longitude
 *             properties:
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               responsavel:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *     responses:
 *       201:
 *         description: Local criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/locais", localController.create);

/**
 * @swagger
 * /api/sorteando/locais/{id}:
 *   put:
 *     summary: Atualizar local existente
 *     tags: [Locais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               responsavel:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *     responses:
 *       200:
 *         description: Local atualizado com sucesso
 *       404:
 *         description: Local não encontrado
 */
router.put("/locais/:id", localController.update);

/**
 * @swagger
 * /api/sorteando/locais/{id}:
 *   delete:
 *     summary: Deletar local
 *     tags: [Locais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Local deletado com sucesso
 *       404:
 *         description: Local não encontrado
 */
router.delete("/locais/:id", localController.delete);

/**
 * @swagger
 * /api/sorteando/locais/seed:
 *   post:
 *     summary: Inicializar banco de dados com dados padrão
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: Dados inicializados com sucesso
 */
router.post("/locais/seed", localController.seed);

export default router;

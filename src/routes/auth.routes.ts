import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRoutes = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *       401:
 *         description: Credenciais inválidas
 */
authRoutes.post("/login", authController.authenticate);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Token inválido
 */
authRoutes.post("/refresh", authController.refreshToken);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - nome
 *               - cpf
 *               - matricula
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               matricula:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
authRoutes.post("/register", authController.createUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
authRoutes.get("/users", authController.getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
authRoutes.get("/users/:id", authController.getUserById);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               matricula:
 *                 type: string
 *               role:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
authRoutes.put("/users/:id", authController.updateUser);

/**
 * @swagger
 * /api/auth/users/{id}/fcm-token:
 *   patch:
 *     summary: Atualizar FCM Token do usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: FCM Token atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
authRoutes.patch("/users/:id/fcm-token", authController.updateFcmToken);

/**
 * @swagger
 * /api/auth/logout/{id}:
 *   post:
 *     summary: Fazer logout do usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
authRoutes.post("/logout/:id", authController.logout);

export default authRoutes;

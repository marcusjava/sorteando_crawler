import { Request, Response } from "express";
import AuthService from "../services/user.service";
import { z } from "zod";

// Schemas de validação
const authenticateSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  role: z.string().min(1, "Role é obrigatória"),
});

const updateUserSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional(),
  matricula: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().url("URL inválida").optional(),
  fcmToken: z.string().optional(),
});

const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(1, "FCM Token é obrigatório"),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  authenticate = async (req: Request, res: Response) => {
    try {
      const data = authenticateSchema.parse(req.body);
      const result = await this.authService.authenticate(data);

      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const result = await this.authService.refreshToken(data);

      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const data = createUserSchema.parse(req.body);
      const result = await this.authService.createUser(data);

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const data = updateUserSchema.parse(req.body);

      const result = await this.authService.updateUser(userId, data);

      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  updateFcmToken = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { fcmToken } = updateFcmTokenSchema.parse(req.body);

      await this.authService.updateFcmToken(userId, fcmToken);

      return res.json({ message: "FCM Token atualizado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await this.authService.getUserById(userId);

      return res.json({ data: user });
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.authService.findAllUsers();

      return res.json({ data: users });
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { refreshToken } = req.body;

      await this.authService.logout(userId, refreshToken);

      return res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  };
}

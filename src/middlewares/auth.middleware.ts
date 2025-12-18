import { Request, Response, NextFunction } from "express";
import AuthService from "../services/user.service";

// Estender a interface Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        nome: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: "Token não fornecido",
        });
      }

      // Formato esperado: "Bearer TOKEN"
      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
          error: "Formato de token inválido",
        });
      }

      // Verificar o token
      const decoded = this.authService.verifyAccessToken(token);

      // Adicionar informações do usuário na requisição
      req.user = {
        id: decoded.id,
        email: decoded.email,
        nome: decoded.nome,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          error: error.message,
        });
      }

      return res.status(401).json({
        error: "Token inválido ou expirado",
      });
    }
  };

  /**
   * Middleware para verificar roles específicas
   */
  requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: "Acesso negado. Permissão insuficiente.",
        });
      }

      next();
    };
  };
}

// Exportar instância para uso fácil
const authMiddleware = new AuthMiddleware();
export const authenticate = authMiddleware.authenticate;
export const requireRole = authMiddleware.requireRole;

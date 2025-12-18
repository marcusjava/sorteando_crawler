import { Request, Response } from "express";
import { LocalService } from "../services/local.service";
import { z } from "zod";

// Schema de validação para criar/atualizar local
const createLocalSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  endereco: z.string().min(10, "Endereço deve ter no mínimo 10 caracteres"),
  logo: z.string().url("Logo deve ser uma URL válida"),
  responsavel: z.string().min(3, "Responsável deve ter no mínimo 3 caracteres"),
  latitude: z.number().min(-90).max(90, "Latitude deve estar entre -90 e 90"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude deve estar entre -180 e 180"),
});

const updateLocalSchema = createLocalSchema.partial();

export class LocalController {
  private localService: LocalService;

  constructor() {
    this.localService = new LocalService();
  }

  /**
   * Listar todos os locais
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const locais = await this.localService.getAll();
      return res.json({ data: locais });
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

  /**
   * Buscar local por ID
   */
  getById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const local = await this.localService.getById(id);

      if (!local) {
        return res.status(404).json({ error: "Local não encontrado" });
      }

      return res.json({ data: local });
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

  /**
   * Criar novo local
   */
  create = async (req: Request, res: Response) => {
    try {
      const localData = createLocalSchema.parse(req.body);
      const novoLocal = await this.localService.create(localData);

      return res.status(201).json({
        message: "Local criado com sucesso",
        data: novoLocal,
      });
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

  /**
   * Atualizar local existente
   */
  update = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const localData = updateLocalSchema.parse(req.body);
      const localAtualizado = await this.localService.update(id, localData);

      return res.json({
        message: "Local atualizado com sucesso",
        data: localAtualizado,
      });
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

  /**
   * Deletar local
   */
  delete = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await this.localService.delete(id);

      return res.json({
        message: "Local deletado com sucesso",
      });
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

  /**
   * Inicializar banco com dados padrão
   */
  seed = async (req: Request, res: Response) => {
    try {
      await this.localService.seedData();

      return res.json({
        message: "Dados inicializados com sucesso",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro ao inicializar dados",
      });
    }
  };
}

import { Request, Response } from "express";
import { LocalService } from "../services/local.service";

export class LocalController {
  private localService: LocalService;

  constructor() {
    this.localService = new LocalService();
  }

  getAll = (req: Request, res: Response) => {
    const locais = this.localService.getAll();
    return res.json({ data: locais });
  };

  getById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const local = this.localService.getById(id);

    if (!local) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    return res.json({ data: local });
  };
}

import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { locationSchema } from "../schemas/location.schema";
import { isFirebaseInitialized } from "../config/firebase.config";
import { z } from "zod";

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  saveLocation = async (req: Request, res: Response) => {
    try {
      if (!isFirebaseInitialized()) {
        console.error("Firebase não inicializado");
        return res.status(500).json({
          error:
            "Serviço temporariamente indisponível. Firebase não configurado.",
        });
      }

      // Validar os dados recebidos
      const locationData = locationSchema.parse(req.body);

      console.log("Dados de localização recebidos:", {
        device: locationData.device_name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp,
      });

      const { docId, isUpdate } = await this.locationService.saveLocation(
        locationData
      );

      return res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate
          ? "Localização atualizada com sucesso"
          : "Localização criada com sucesso",
        id: docId,
        updated: isUpdate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Erro de validação:", error.errors);
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error("Erro ao salvar localização:", error);
      return res.status(500).json({
        error: "Erro ao salvar localização no banco de dados",
      });
    }
  };
}

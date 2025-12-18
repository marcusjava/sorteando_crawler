import * as admin from "firebase-admin";
import { Local } from "../types";
import { BadRequestError } from "../middlewares/error.middleware";

export class LocalService {
  private readonly DB_PATH = "gma/locais";

  /**
   * Buscar todos os locais
   */
  async getAll(): Promise<Local[]> {
    try {
      const locaisRef = admin.database().ref(this.DB_PATH);
      const snapshot = await locaisRef.once("value");

      if (!snapshot.exists()) {
        return [];
      }

      const locaisData = snapshot.val();
      const locaisList: Local[] = Object.keys(locaisData).map((key) => ({
        id: parseInt(key),
        ...locaisData[key],
      }));

      return locaisList.sort((a, b) => a.id - b.id);
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Erro ao buscar locais: ${error.message}`,
        logging: true,
      });
    }
  }

  /**
   * Buscar local por ID
   */
  async getById(id: number): Promise<Local | null> {
    try {
      const localRef = admin.database().ref(`${this.DB_PATH}/${id}`);
      const snapshot = await localRef.once("value");

      if (!snapshot.exists()) {
        return null;
      }

      const localData = snapshot.val();
      return {
        id,
        ...localData,
      };
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Erro ao buscar local: ${error.message}`,
        logging: true,
      });
    }
  }

  /**
   * Criar novo local
   */
  async create(localData: Omit<Local, "id">): Promise<Local> {
    try {
      // Gerar novo ID (buscar o maior ID existente + 1)
      const locais = await this.getAll();
      const newId =
        locais.length > 0 ? Math.max(...locais.map((l) => l.id)) + 1 : 1;

      const novoLocal: Local = {
        id: newId,
        ...localData,
      };

      const localRef = admin.database().ref(`${this.DB_PATH}/${newId}`);
      await localRef.set({
        nome: novoLocal.nome,
        endereco: novoLocal.endereco,
        logo: novoLocal.logo,
        responsavel: novoLocal.responsavel,
        latitude: novoLocal.latitude,
        longitude: novoLocal.longitude,
        createdAt: admin.database.ServerValue.TIMESTAMP,
      });

      return novoLocal;
    } catch (error: any) {
      throw new BadRequestError({
        code: 500,
        message: `Erro ao criar local: ${error.message}`,
        logging: true,
      });
    }
  }

  /**
   * Atualizar local existente
   */
  async update(
    id: number,
    localData: Partial<Omit<Local, "id">>
  ): Promise<Local> {
    try {
      const localExistente = await this.getById(id);

      if (!localExistente) {
        throw new BadRequestError({
          code: 404,
          message: "Local não encontrado",
          logging: true,
        });
      }

      const localRef = admin.database().ref(`${this.DB_PATH}/${id}`);
      await localRef.update({
        ...localData,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
      });

      const localAtualizado = await this.getById(id);
      return localAtualizado!;
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({
        code: 500,
        message: `Erro ao atualizar local: ${error.message}`,
        logging: true,
      });
    }
  }

  /**
   * Deletar local
   */
  async delete(id: number): Promise<void> {
    try {
      const localExistente = await this.getById(id);

      if (!localExistente) {
        throw new BadRequestError({
          code: 404,
          message: "Local não encontrado",
          logging: true,
        });
      }

      const localRef = admin.database().ref(`${this.DB_PATH}/${id}`);
      await localRef.remove();
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({
        code: 500,
        message: `Erro ao deletar local: ${error.message}`,
        logging: true,
      });
    }
  }

  /**
   * Inicializar banco com dados padrão (útil para primeira execução)
   */
  async seedData(): Promise<void> {
    try {
      const locaisExistentes = await this.getAll();

      if (locaisExistentes.length > 0) {
        console.log("Banco já contém dados. Seed não executado.");
        return;
      }

      const locaisIniciais: Omit<Local, "id">[] = [
        {
          nome: "CRAM Maria Otávia Gonçalves de Miranda",
          endereco:
            "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
          logo: "https://placehold.co/100x100/purple/white?text=CRAM",
          responsavel: "Maria Otávia",
          latitude: -10.9162,
          longitude: -37.0577,
        },
        {
          nome: "Secretaria da Mulher Aracaju",
          endereco:
            "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
          logo: "https://placehold.co/100x100/blue/white?text=SMA",
          responsavel: "Elaine Oliveira",
          latitude: -10.9162,
          longitude: -37.0577,
        },
        {
          nome: "Delegacia Especial de Atendimento à Mulher (DEAM)",
          endereco: "Rua C, 120 - Santos Dumont, Aracaju - SE",
          logo: "https://placehold.co/100x100/black/white?text=DEAM",
          responsavel: "Delegada Ana Paula",
          latitude: -10.9254,
          longitude: -37.0521,
        },
        {
          nome: "Defensoria Pública do Estado de Sergipe",
          endereco:
            "Travessa João Francisco da Silveira, 44 - Centro, Aracaju - SE",
          logo: "https://placehold.co/100x100/green/white?text=DPE",
          responsavel: "Dr. João Silva",
          latitude: -10.9091,
          longitude: -37.0677,
        },
        {
          nome: "Ministério Público de Sergipe",
          endereco:
            "Av. Conselheiro Carlos Alberto Sampaio, 505 - Capucho, Aracaju - SE",
          logo: "https://placehold.co/100x100/red/white?text=MPSE",
          responsavel: "Dra. Carla Souza",
          latitude: -10.9145,
          longitude: -37.0443,
        },
        {
          nome: "Tribunal de Justiça de Sergipe - Juizado da Violência Doméstica",
          endereco: "Rua Pacatuba, 55 - Centro, Aracaju - SE",
          logo: "https://placehold.co/100x100/orange/white?text=TJSE",
          responsavel: "Juíza Maria da Glória",
          latitude: -10.9105,
          longitude: -37.0652,
        },
        {
          nome: "Casa da Mulher Brasileira",
          endereco: "Av. Maranhão, s/n - Santos Dumont, Aracaju - SE",
          logo: "https://placehold.co/100x100/pink/white?text=CMB",
          responsavel: "Fernanda Lima",
          latitude: -10.9234,
          longitude: -37.0498,
        },
        {
          nome: "ONG Mulheres de Peito",
          endereco: "Rua Lagarto, 100 - Centro, Aracaju - SE",
          logo: "https://placehold.co/100x100/yellow/black?text=ONG",
          responsavel: "Roberta Santos",
          latitude: -10.9115,
          longitude: -37.0625,
        },
        {
          nome: "Coordenadoria Estadual de Políticas para as Mulheres",
          endereco: "Rua Vila Cristina, 1051 - 13 de Julho, Aracaju - SE",
          logo: "https://placehold.co/100x100/cyan/black?text=CEPM",
          responsavel: "Juliana Costa",
          latitude: -10.9178,
          longitude: -37.0542,
        },
        {
          nome: "Patrulha Maria da Penha - Guarda Municipal",
          endereco: "Parque da Sementeira - Jardins, Aracaju - SE",
          logo: "https://placehold.co/100x100/gray/white?text=PMP",
          responsavel: "Comandante Silva",
          latitude: -10.9389,
          longitude: -37.0452,
        },
      ];

      for (const local of locaisIniciais) {
        await this.create(local);
      }

      console.log(
        `✓ ${locaisIniciais.length} locais inicializados no Firebase`
      );
    } catch (error: any) {
      console.error("Erro ao inicializar dados:", error.message);
      throw error;
    }
  }
}

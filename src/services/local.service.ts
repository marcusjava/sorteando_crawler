import { Local } from "../types";

export class LocalService {
  private locais: Local[] = [
    {
      id: 1,
      nome: "CRAM Maria Otávia Gonçalves de Miranda",
      endereco: "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
      logo: "https://placehold.co/100x100/purple/white?text=CRAM",
      responsavel: "Maria Otávia",
    },
    {
      id: 2,
      nome: "Secretaria da Mulher Aracaju",
      endereco: "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
      logo: "https://placehold.co/100x100/blue/white?text=SMA",
      responsavel: "Elaine Oliveira",
    },
    {
      id: 3,
      nome: "Delegacia Especial de Atendimento à Mulher (DEAM)",
      endereco: "Rua C, 120 - Santos Dumont, Aracaju - SE",
      logo: "https://placehold.co/100x100/black/white?text=DEAM",
      responsavel: "Delegada Ana Paula",
    },
    {
      id: 4,
      nome: "Defensoria Pública do Estado de Sergipe",
      endereco:
        "Travessa João Francisco da Silveira, 44 - Centro, Aracaju - SE",
      logo: "https://placehold.co/100x100/green/white?text=DPE",
      responsavel: "Dr. João Silva",
    },
    {
      id: 5,
      nome: "Ministério Público de Sergipe",
      endereco:
        "Av. Conselheiro Carlos Alberto Sampaio, 505 - Capucho, Aracaju - SE",
      logo: "https://placehold.co/100x100/red/white?text=MPSE",
      responsavel: "Dra. Carla Souza",
    },
    {
      id: 6,
      nome: "Tribunal de Justiça de Sergipe - Juizado da Violência Doméstica",
      endereco: "Rua Pacatuba, 55 - Centro, Aracaju - SE",
      logo: "https://placehold.co/100x100/orange/white?text=TJSE",
      responsavel: "Juíza Maria da Glória",
    },
    {
      id: 7,
      nome: "Casa da Mulher Brasileira",
      endereco: "Av. Maranhão, s/n - Santos Dumont, Aracaju - SE",
      logo: "https://placehold.co/100x100/pink/white?text=CMB",
      responsavel: "Fernanda Lima",
    },
    {
      id: 8,
      nome: "ONG Mulheres de Peito",
      endereco: "Rua Lagarto, 100 - Centro, Aracaju - SE",
      logo: "https://placehold.co/100x100/yellow/black?text=ONG",
      responsavel: "Roberta Santos",
    },
    {
      id: 9,
      nome: "Coordenadoria Estadual de Políticas para as Mulheres",
      endereco: "Rua Vila Cristina, 1051 - 13 de Julho, Aracaju - SE",
      logo: "https://placehold.co/100x100/cyan/black?text=CEPM",
      responsavel: "Juliana Costa",
    },
    {
      id: 10,
      nome: "Patrulha Maria da Penha - Guarda Municipal",
      endereco: "Parque da Sementeira - Jardins, Aracaju - SE",
      logo: "https://placehold.co/100x100/gray/white?text=PMP",
      responsavel: "Comandante Silva",
    },
  ];

  getAll(): Local[] {
    return this.locais;
  }

  getById(id: number): Local | undefined {
    return this.locais.find((local) => local.id === id);
  }
}

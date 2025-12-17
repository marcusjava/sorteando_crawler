export interface Local {
  id: number;
  nome: string;
  endereco: string;
  logo: string;
  responsavel: string;
}

export interface LocationResponse {
  success: boolean;
  message: string;
  id: string;
  updated: boolean;
}

export interface SorteioResponse {
  message: string;
  dados: {
    nome: string;
    email: string;
    link_sorteio: string;
    codigo_acesso: string;
    numero_sorteio: string;
  };
}

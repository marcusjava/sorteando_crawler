export interface Local {
  id: number;
  nome: string;
  endereco: string;
  logo: string;
  responsavel: string;
  latitude: number;
  longitude: number;
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

// Auth Types
export interface IAuthenticateRequest {
  email: string;
  senha: string;
}

export interface IAuthResponse {
  user: Omit<UserData, "password">;
  accessToken: string;
  refreshToken: string;
  fcmToken: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface ICreateUserRequest {
  email: string;
  senha: string;
  nome: string;
  matricula: string;
  role: string;
  cpf: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  nome: string;
  role: string;
  type: "access" | "refresh";
}

export interface UserData {
  id: string;
  nome: string;
  cpf: string;
  password: string;
  matricula: string;
  email: string;
  role: string;
  avatarUrl?: string;
  fcmToken?: string;
  createdAt: number;
}

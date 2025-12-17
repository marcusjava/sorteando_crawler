import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  firebaseCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

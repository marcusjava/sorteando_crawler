import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  firebaseCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  jwt: {
    secretKey:
      process.env.SECRET_KEY || "default-secret-key-change-in-production",
    refreshSecretKey:
      process.env.REFRESH_SECRET_KEY ||
      "default-refresh-secret-key-change-in-production",
  },
};

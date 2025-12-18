import * as admin from "firebase-admin";
import path from "path";

let firebaseInitialized = false;
let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  if (firebaseInitialized) {
    return { db, firebaseInitialized };
  }

  try {
    console.log("Inicializando Firebase Admin...");
    console.log("Ambiente:", process.env.NODE_ENV || "development");

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS não está definido no .env"
      );
    }

    let credential;
    let serviceAccount: any;
    const serviceAccountKey =
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY ou GOOGLE_APPLICATION_CREDENTIALS não configurada"
      );
    }

    // Detectar o tipo de configuração
    if (
      serviceAccountKey.startsWith("./") ||
      serviceAccountKey.startsWith("/")
    ) {
      // Caminho de arquivo (ambiente local)
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(serviceAccountKey);
      serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      console.log("✓ Service account carregada do arquivo:", filePath);
    } else if (serviceAccountKey.startsWith("{")) {
      // JSON direto
      serviceAccount = JSON.parse(serviceAccountKey);
      console.log("✓ Service account carregada diretamente do JSON");
    } else {
      // Base64 encoded
      const decodedKey = Buffer.from(serviceAccountKey, "base64").toString(
        "utf-8"
      );
      serviceAccount = JSON.parse(decodedKey);
      console.log("✓ Service account decodificada de base64");
    }

    // Configuração do Firebase Admin
    const firebaseConfig: admin.AppOptions = {
      credential: admin.credential.cert(serviceAccount),
    };

    // Adicionar databaseURL se estiver configurado
    if (process.env.FIREBASE_DATABASE_URL) {
      firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
      console.log("✓ Firebase Realtime Database URL configurada");
    } else {
      // Usar URL padrão baseada no project_id
      const projectId = serviceAccount.project_id;
      firebaseConfig.databaseURL = `https://${projectId}-default-rtdb.firebaseio.com`;
      console.log(
        `✓ Usando URL padrão do Realtime Database: ${firebaseConfig.databaseURL}`
      );
    }

    admin.initializeApp(firebaseConfig);

    db = admin.firestore();
    firebaseInitialized = true;

    console.log("✓ Firebase Admin inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin:", error);
    console.log(
      "Verifique as variáveis de ambiente do Firebase no .env ou Render"
    );
    // @ts-ignore
    db = null;
  }

  return { db, firebaseInitialized };
};

export const getFirestore = () => {
  if (!firebaseInitialized) {
    throw new Error(
      "Firebase não foi inicializado. Chame initializeFirebase() primeiro."
    );
  }
  return db;
};

export const isFirebaseInitialized = () => firebaseInitialized;

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

    let credential;

    // Tentar usar FIREBASE_SERVICE_ACCOUNT (JSON direto - para produção/Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log("Usando FIREBASE_SERVICE_ACCOUNT (JSON direto)");
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    }
    // Tentar usar GOOGLE_APPLICATION_CREDENTIALS (caminho do arquivo - para desenvolvimento)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("Usando GOOGLE_APPLICATION_CREDENTIALS (arquivo)");
      const absolutePath = path.resolve(
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      );
      console.log("Caminho absoluto:", absolutePath);
      const serviceAccount = require(absolutePath);
      credential = admin.credential.cert(serviceAccount);
    }
    // Tentar credenciais individuais (alternativa)
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      console.log("Usando credenciais individuais");
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    } else {
      throw new Error(
        "Nenhuma credencial do Firebase encontrada. Configure FIREBASE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS ou credenciais individuais."
      );
    }

    admin.initializeApp({
      credential: credential,
    });

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

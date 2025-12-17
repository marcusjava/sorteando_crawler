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
    const credentialsValue = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Tentar parsear como JSON primeiro (para produção/Render)
    /*  try {
      console.log("Tentando parsear como JSON...");
      const serviceAccount = JSON.parse(credentialsValue);
      credential = admin.credential.cert(serviceAccount);
      console.log("✓ Usando credenciais do JSON direto");
    } catch (jsonError) {
      // Se falhar, tratar como caminho de arquivo (para desenvolvimento local)
      console.log("JSON parse falhou, tratando como caminho de arquivo...");
      const absolutePath = path.resolve(credentialsValue);
      console.log("Caminho absoluto:", absolutePath);
      const serviceAccount = require(absolutePath);
      credential = admin.credential.cert(serviceAccount);
      console.log("✓ Usando credenciais do arquivo");
    } */

    admin.initializeApp({
      credential: admin.credential.cert(credentialsValue),
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

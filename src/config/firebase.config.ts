import * as admin from "firebase-admin";
import path from "path";

let firebaseInitialized = false;
let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  if (firebaseInitialized) {
    return { db, firebaseInitialized };
  }

  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    console.log("Inicializando Firebase Admin...");
    console.log("GOOGLE_APPLICATION_CREDENTIALS:", serviceAccountPath);

    if (!serviceAccountPath) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS não está definido no .env"
      );
    }

    // Resolver caminho relativo para absoluto
    const absolutePath = path.resolve(serviceAccountPath);
    console.log("Caminho absoluto:", absolutePath);

    const serviceAccount = require(absolutePath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    firebaseInitialized = true;

    console.log("✓ Firebase Admin inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin:", error);
    console.log(
      "Verifique se GOOGLE_APPLICATION_CREDENTIALS está configurado no .env"
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

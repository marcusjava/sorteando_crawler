import dotenv from "dotenv";
import "express-async-errors";
import { initializeFirebase } from "./config/firebase.config";
import { LocalService } from "./services/local.service";

// Carregar variáveis de ambiente ANTES de inicializar Firebase
dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    // Inicializar Firebase
    const { firebaseInitialized } = initializeFirebase();

    if (!firebaseInitialized) {
      console.error("❌ Erro: Firebase não inicializado");
      console.error(
        "Verifique se as variáveis de ambiente estão configuradas corretamente"
      );
      process.exit(1);
    }

    console.log("✓ Firebase inicializado com sucesso\n");

    // Executar seed de locais
    const localService = new LocalService();
    await localService.seedData();

    console.log("\n✅ Seed concluído com sucesso!");

    // Dar tempo para o Firebase finalizar operações pendentes
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error("\n❌ Erro ao executar seed:");
    console.error(error);

    // Dar tempo para exibir o erro
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Executar seed
seedDatabase();

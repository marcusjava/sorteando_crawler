import * as admin from "firebase-admin";
import { getFirestore } from "../config/firebase.config";
import { LocationData } from "../schemas/location.schema";

export class LocationService {
  private getDb() {
    return getFirestore();
  }

  async saveLocation(locationData: LocationData) {
    const db = this.getDb();

    // Verificar se já existe um documento para este dispositivo
    const existingDocsSnapshot = await db
      .collection("coords")
      .where("device_name", "==", locationData.device_name)
      .limit(1)
      .get();

    const dataToSave = {
      accuracy: locationData.accuracy,
      device_name: locationData.device_name,
      device_time: locationData.device_time,
      is_moving: locationData.is_moving,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      speed: locationData.speed,
      timestamp: locationData.timestamp,
      received_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    let docId: string;
    let isUpdate: boolean;

    if (!existingDocsSnapshot.empty) {
      // Atualizar documento existente
      const existingDoc = existingDocsSnapshot.docs[0];
      docId = existingDoc.id;
      await db.collection("coords").doc(docId).update(dataToSave);
      isUpdate = true;
      console.log(`Localização atualizada no Firestore. ID: ${docId}`);
    } else {
      // Criar novo documento
      const docRef = await db.collection("coords").add(dataToSave);
      docId = docRef.id;
      isUpdate = false;
      console.log(`Nova localização criada no Firestore. ID: ${docId}`);
    }

    return { docId, isUpdate };
  }
}

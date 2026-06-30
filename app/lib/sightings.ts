import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type CatSighting = {
  id: string;
  imageData: string;   // base64 jpeg data URL
  latitude: number;
  longitude: number;
  accuracy: number | null;
  confidence: number;
  deviceId: string;
  createdAt: string;   // ISO timestamp
};

const DEVICE_ID_KEY = "pocatmon_device_id";

/**
 * Returns a stable per-browser device id, creating and persisting
 * one in localStorage on first use. No login required.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Wraps the browser geolocation API in a promise.
 * Rejects if permission is denied or the device has no GPS/location support.
 */
export function getCurrentPosition(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000 }
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Saves a confirmed cat sighting to Firebase Realtime Database
 * under /sightings/{id}.
 */
export async function saveCatSighting(params: {
  imageData: string;
  confidence: number;
  latitude: number;
  longitude: number;
  accuracy: number | null;
}): Promise<CatSighting> {
  const db = getFirebaseDb();
  const id = crypto.randomUUID();

  const sighting: CatSighting = {
    id,
    imageData: params.imageData,
    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: params.accuracy,
    confidence: params.confidence,
    deviceId: getDeviceId(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(collection(db, "sightings"), id), sighting);

  return sighting;
}
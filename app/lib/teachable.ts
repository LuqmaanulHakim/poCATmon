import * as tmImage from "@teachablemachine/image";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/KYhzmTMgs/";

let model: Awaited<ReturnType<typeof tmImage.load>> | undefined;

export async function loadModel() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
}

export async function predictImage(image: HTMLImageElement) {
  if (!model) {
    await loadModel();
  }

  if (!model) {
    throw new Error("Model failed to load");
  }

  const predictions = await model.predict(image);
  return predictions;
}
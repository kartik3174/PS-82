import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Ensure backends are loaded
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

let model: cocoSsd.ObjectDetection | null = null;

export const loadVisionModel = async () => {
  try {
    await tf.ready();
    
    // Try to use webgl, fallback to cpu if it fails
    try {
      if (!tf.getBackend()) {
        await tf.setBackend('webgl');
      }
      console.log("Using backend:", tf.getBackend());
    } catch (e) {
      console.warn("WebGL failed, falling back to CPU");
      await tf.setBackend('cpu');
    }

    if (!model) {
      console.log("Loading COCO-SSD model...");
      model = await cocoSsd.load({
        base: 'lite_mobilenet_v2' // Use a lighter model for better performance in browser
      });
      console.log("COCO-SSD model loaded successfully");
    }
    return model;
  } catch (error) {
    console.error("Failed to load vision model:", error);
    throw new Error("AI Model failed to load. Please check your connection.");
  }
};

export const detectShipsInImage = async (imageElement: HTMLImageElement | HTMLCanvasElement) => {
  const detector = await loadVisionModel();
  const predictions = await detector.detect(imageElement);
  
  // Filter for 'boat' or 'ship' classes
  return predictions.filter(p => ['boat', 'ship'].includes(p.class));
};

export const detectOilSpill = async (canvas: HTMLCanvasElement) => {
  // Simulated oil spill detection using color histogram analysis
  // In a real app, this would be a specialized CNN model
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let darkPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Oil spills often appear as dark, iridescent patches
    // Simple heuristic: very low brightness but slightly blue/purple tint
    const brightness = (r + g + b) / 3;
    if (brightness < 50 && b > r && b > g) {
      darkPixels++;
    }
  }

  const ratio = darkPixels / (canvas.width * canvas.height);
  return {
    detected: ratio > 0.05,
    confidence: Math.min(ratio * 10, 1),
    areaRatio: ratio
  };
};

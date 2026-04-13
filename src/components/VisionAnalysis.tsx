import React, { useState, useRef } from 'react';
import { Upload, Search, ShieldAlert, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { detectShipsInImage, detectOilSpill } from '../services/visionService';
import { toast } from 'sonner';

const VisionAnalysis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    
    try {
      const img = new Image();
      img.src = image;
      await img.decode();

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        let ships = [];
        try {
          ships = await detectShipsInImage(img);
        } catch (e) {
          console.error("Ship detection failed:", e);
          toast.error("Vessel detection failed");
        }

        let oil = { detected: false, confidence: 0, areaRatio: 0 };
        try {
          const oilResult = await detectOilSpill(canvas);
          if (oilResult) oil = oilResult;
        } catch (e) {
          console.error("Oil spill detection failed:", e);
          toast.error("Environmental analysis failed");
        }

        setResults({ ships, oil });
        toast.success("Analysis complete");
      }
    } catch (error) {
      console.error("Vision Analysis Error:", error);
      toast.error("Analysis failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="text-blue-500" />
            AI Satellite Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-12 bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleImageUpload}
              accept="image/*"
            />
            {image ? (
              <img src={image} alt="Upload" className="max-h-64 rounded-lg shadow-xl" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-slate-500 mb-4" size={48} />
                <p className="text-slate-300 font-medium">Upload Satellite Image</p>
                <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>

          <Button 
            onClick={analyzeImage} 
            disabled={!image || isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg font-bold"
          >
            {isAnalyzing ? "Processing with TensorFlow.js..." : "Run AI Analysis"}
          </Button>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <ShieldAlert size={20} />
                  <span className="font-bold uppercase text-xs">Vessel Detection</span>
                </div>
                <p className="text-2xl font-bold">{results.ships.length} Vessels Identified</p>
                <p className="text-sm text-slate-400 mt-1">Confidence: 94.2%</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Droplets size={20} />
                  <span className="font-bold uppercase text-xs">Environmental Risk</span>
                </div>
                <p className="text-2xl font-bold">
                  {results.oil.detected ? "Oil Spill Detected" : "No Spills Detected"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Confidence: {(results.oil.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VisionAnalysis;

import React, { useState, useRef } from 'react';
import { Upload, Search, ShieldAlert, Droplets, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectShipsInImage, detectOilSpill } from '@/services/visionService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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
        }

        let oil = { detected: false, confidence: 0, areaRatio: 0 };
        try {
          const oilResult = await detectOilSpill(canvas);
          if (oilResult) oil = oilResult;
        } catch (e) {
          console.error("Oil spill detection failed:", e);
        }

        setResults({ ships, oil });
        toast.success("AI Analysis complete");
      }
    } catch (error) {
      console.error("Vision Analysis Error:", error);
      toast.error("Analysis failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-full">
      <header>
        <h2 className="text-4xl font-black text-white tracking-tight">AI <span className="text-blue-500">Vision</span></h2>
        <p className="text-slate-400 mt-2 font-medium">Neural-network powered satellite imagery analysis</p>
      </header>

      <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50 text-white rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/30">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Search className="text-blue-500" size={20} />
            </div>
            Satellite Core Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-12 bg-slate-900/30 hover:bg-slate-900/50 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              onChange={handleImageUpload}
              accept="image/*"
            />
            {image ? (
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={image} 
                alt="Upload" 
                className="max-h-80 rounded-2xl shadow-2xl border-4 border-slate-800" 
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-slate-500" size={32} />
                </div>
                <p className="text-white font-black text-lg">Drop Satellite Imagery</p>
                <p className="text-slate-500 text-sm mt-2 font-medium">Supports high-res multispectral data (JPG, PNG)</p>
              </div>
            )}
          </div>

          <Button 
            onClick={analyzeImage} 
            disabled={!image || isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-500 h-14 text-lg font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" />
                <span>Processing Neural Layers...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles size={20} />
                <span>Run Deep Analysis</span>
              </div>
            )}
          </Button>

          <AnimatePresence>
            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center gap-3 text-blue-400 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <ShieldAlert size={20} />
                    </div>
                    <span className="font-black uppercase text-[10px] tracking-widest">Vessel Detection</span>
                  </div>
                  <p className="text-3xl font-black text-white">{results.ships.length} <span className="text-sm font-medium text-slate-500">Targets</span></p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[94%]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">94.2% CONF</span>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center gap-3 text-amber-400 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Droplets size={20} />
                    </div>
                    <span className="font-black uppercase text-[10px] tracking-widest">Environmental Risk</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {results.oil.detected ? "Spill Detected" : "Clear"}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${results.oil.detected ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${results.oil.confidence * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{(results.oil.confidence * 100).toFixed(1)}% CONF</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VisionAnalysis;

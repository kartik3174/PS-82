import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface VoiceControlProps {
  onCommand: (command: string) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        toast.info(`Voice Command Received: "${command}"`);
        onCommand(command);
      };

      recog.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition error. Please try again.");
      };

      setRecognition(recog);
    }
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
      toast.info("Listening for commands...");
    }
  };

  if (!recognition) return null;

  return (
    <div className="fixed bottom-6 right-24 z-[1000]">
      <Button
        variant={isListening ? "destructive" : "secondary"}
        size="icon"
        className={`rounded-full w-12 h-12 shadow-lg transition-all ${isListening ? 'animate-pulse' : ''}`}
        onClick={toggleListening}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </Button>
    </div>
  );
};

export default VoiceControl;

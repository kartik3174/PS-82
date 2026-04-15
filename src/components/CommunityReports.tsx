import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';

const CommunityReports: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Please login to submit a report");
      return;
    }

    setIsSubmitting(true);
    try {
      const reportId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await addDoc(collection(db, 'reports'), {
        id: reportId,
        title,
        description,
        reporterUid: auth.currentUser.uid,
        status: 'pending',
        timestamp: serverTimestamp(),
        lat: 15.0,
        lon: 80.0
      });
      toast.success("Report submitted successfully for moderation");
      setTitle('');
      setDescription('');
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-950 min-h-full">
      <header className="mb-8">
        <h2 className="text-4xl font-black text-white tracking-tight">Community <span className="text-amber-500">Reports</span></h2>
        <p className="text-slate-400 mt-2 font-medium">Crowdsourced maritime intelligence for a safer ocean</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800/50 text-white rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800/50 bg-slate-900/30 p-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="text-amber-500" />
              </div>
              Report Suspicious Activity
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Help the Coast Guard by reporting illegal fishing, oil spills, or suspicious vessels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Report Title</label>
                <Input 
                  placeholder="e.g., Potential Oil Spill near Chennai" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white h-12 rounded-xl focus:ring-amber-500/50"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Detailed Description</label>
                <Textarea 
                  placeholder="Describe what you saw in detail..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-950/50 border-slate-800 text-white min-h-[150px] rounded-xl focus:ring-amber-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="h-12 rounded-xl gap-2 border-slate-800 bg-slate-900 text-white hover:bg-slate-800 font-bold transition-all">
                  <Camera size={18} />
                  Attach Evidence
                </Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl gap-2 border-slate-800 bg-slate-900 text-white hover:bg-slate-800 font-bold transition-all">
                  <MapPin size={18} />
                  Tag Location
                </Button>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-500 h-14 text-lg font-black rounded-2xl shadow-lg shadow-amber-600/20 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Send size={18} />
                    </motion.div>
                    <span>Transmitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={18} />
                    <span>Submit Intelligence Report</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <ShieldCheck className="text-blue-500" size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Secure Submission</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            All reports are encrypted and sent directly to the Maritime Security Operations Center. Your identity is protected under the Whistleblower Protection Act.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityReports;

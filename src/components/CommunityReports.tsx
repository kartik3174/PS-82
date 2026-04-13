import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
      await addDoc(collection(db, 'reports'), {
        title,
        description,
        reporterUid: auth.currentUser.uid,
        status: 'pending',
        timestamp: serverTimestamp(),
        lat: 15.0, // Mock location, in real app use geolocation
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-amber-500" />
            Report Suspicious Activity
          </CardTitle>
          <CardDescription className="text-slate-400">
            Help the Coast Guard by reporting illegal fishing, oil spills, or suspicious vessels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g., Potential Oil Spill near Chennai" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Describe what you saw..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 gap-2 border-slate-700 hover:bg-slate-800">
                <Camera size={18} />
                Add Image
              </Button>
              <Button type="button" variant="outline" className="flex-1 gap-2 border-slate-700 hover:bg-slate-800">
                <MapPin size={18} />
                Tag Location
              </Button>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
              <Send className="ml-2" size={18} />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityReports;

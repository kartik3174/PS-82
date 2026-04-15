import React, { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Shield, Mail, Lock, User, LogIn, Github, Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Use popup first, if it fails maybe log why
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully signed in with Google');
    } catch (error: any) {
      console.error('Google Login Error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by your browser. Please allow popups for this site.');
      } else {
        toast.error(`Google Sign-In Error: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in');
    } catch (error: any) {
      console.error('Login Error:', error);
      toast.error(error.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Registration Error:', error);
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="p-4 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/40 mb-6"
          >
            <Shield className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">SEAGUARD</h1>
          <p className="text-xs font-bold text-blue-500 tracking-[0.4em] uppercase">AI Maritime Intelligence</p>
        </div>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800/50 shadow-2xl rounded-3xl overflow-hidden shadow-black/50">
          <Tabs defaultValue="login" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-950/80 rounded-xl p-1 border border-slate-800/50">
                <TabsTrigger value="login" className="rounded-lg font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Register</TabsTrigger>
              </TabsList>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white">Welcome Commander</CardTitle>
              <CardDescription className="text-slate-400">
                Authorized personnel access only.
              </CardDescription>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input 
                        type="email" 
                        placeholder="Military Email" 
                        className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-12 text-white placeholder:text-slate-600 focus:ring-blue-600 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input 
                        type="password" 
                        placeholder="Passcode" 
                        className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-12 text-white placeholder:text-slate-600 focus:ring-blue-600 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl h-12 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 w-5 h-5" />}
                    Authenticate
                  </Button>
                  
                  <div className="relative w-full text-center py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
                    <span className="relative bg-transparent px-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">External Access</span>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full border-slate-800 bg-slate-900/50 rounded-xl h-12 font-bold hover:bg-slate-800 text-white transition-all active:scale-[0.98] border shadow-sm"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 w-5 h-5 text-blue-400" />
                    <span className="text-slate-200">Secure with Google</span>
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleEmailRegister}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input 
                        type="text" 
                        placeholder="Full Name" 
                        className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-12 text-white"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input 
                        type="email" 
                        placeholder="Work Email" 
                        className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-12 text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <Input 
                        type="password" 
                        placeholder="Strong Passcode" 
                        className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-12 text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl h-12 font-bold shadow-lg shadow-blue-600/20"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2 w-5 h-5" />}
                    Create High-Security Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="mt-8 text-center text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">
          Global Defense & Monitoring Network
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

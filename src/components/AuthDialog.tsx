import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "../lib/supabaseClient";
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const AuthDialog = ({ children, isAdmin = false }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if admin approved
        const { data: userData, error: userError } = await supabase
          .from('user_master')
          .select('*')
          .eq('email', email)
          .single();

        if (userError) throw userError;
        if (!userData.admin_approved) throw new Error('Admin approval pending');

        toast({
          title: 'Success!',
          description: 'Logged in successfully.',
        });

      } else {
        // SIGNUP

        // Check if email already exists
        const { data: existingUser } = await supabase
          .from('user_master')
          .select('email, admin_approved')
          .eq('email', email)
          .single();

        if (existingUser) {
          if (!existingUser.admin_approved) throw new Error('User already registered! Admin approval is pending');
          else throw new Error('User already registered!');
        }

        // Sign up in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // Insert extra user info into user_master
        const { error: userInsertError } = await supabase.from('user_master').insert([
          {
            user_id: signUpData.user?.id,
            user_name: name,
            email: email,                // Add email here
            contact_number: phone,
            Gender: gender,
            status: 'inactive',
            admin_approved: false,
          },
        ]);

        if (userInsertError) throw userInsertError;

        toast({
          title: 'Success!',
          description: 'Account created. Please verify your email and wait for admin approval.',
        });
      }

      setOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setGender('');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isAdmin ? 'Admin ' : ''}{isLogin ? 'Login' : 'Sign Up'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>

          <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

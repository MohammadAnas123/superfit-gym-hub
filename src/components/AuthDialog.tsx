import { useState, useEffect } from 'react';
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

  // OTP related states
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  const { toast } = useToast();

  // Reset all form states
  const resetForm = () => {
    setIsLogin(true);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setGender('');
    setOtp('');
    setGeneratedOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setTimer(0);
  };

  // Check if all signup fields are filled
  const isSignupFormComplete = !isLogin && name && email && password && phone && gender;

  // Generate 6-digit random OTP
  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log('Generated OTP:', newOtp); // ✅ Keep this log for testing
    return newOtp;
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Handle Send/Resend OTP
  const handleSendOtp = () => {
    if (!isSignupFormComplete) {
      toast({
        title: 'Error',
        description: 'Please fill all fields before sending OTP.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    generateOtp();
    setOtpSent(true);
    setOtpVerified(false);
    setOtp('');
    setTimer(30); // start 30s countdown

    toast({
      title: 'OTP Sent!',
      description: `6-digit OTP has been generated. Check console for the code.`,
    });
  };

  // Countdown effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP verification
  const handleOtpChange = (value: string) => {
    setOtp(value);

    if (value === generatedOtp && value.length === 6) {
      setOtpVerified(true);
      toast({
        title: 'OTP Verified!',
        description: 'You can now proceed with signup.',
      });
    } else {
      setOtpVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

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
        if (!otpVerified) throw new Error('Please verify OTP before signing up.');

        if (!isValidEmail(email)) {
          throw new Error('Please enter a valid email address.');
        }

        const cleanEmail = email.trim().toLowerCase();

        const { data: existingUser } = await supabase
          .from('user_master')
          .select('email, admin_approved, user_id')
          .eq('email', cleanEmail)
          .single();

        if (existingUser) {
          if (!existingUser.admin_approved) throw new Error('User already registered! Admin approval is pending');
          else throw new Error('User already registered!');
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (signUpError) throw new Error(signUpError.message);

        if (!signUpData.user?.id) throw new Error('Failed to create user account');

        const { error: userInsertError } = await supabase.from('user_master').insert([
          {
            user_id: signUpData.user.id,
            user_name: name,
            email: email,
            contact_number: phone,
            Gender: gender,
            status: 'inactive',
            admin_approved: false,
          },
        ]);

        if (userInsertError) {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
          throw new Error(`Failed to create user profile: ${userInsertError.message}`);
        }

        toast({
          title: 'Success!',
          description: 'Account created. Please verify your email and wait for admin approval.',
        });
      }

      setOpen(false);
      resetForm();
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

  // Reset OTP states when switching between login/signup
  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setOtp('');
    setGeneratedOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setTimer(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'Admin ' : ''}
            {isLogin ? 'Login' : 'Sign Up'}
          </DialogTitle>
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
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
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

          {!isLogin && (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleSendOtp}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={!isSignupFormComplete || timer > 0}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
              </Button>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    maxLength={6}
                    placeholder="000000"
                    className={otpVerified ? 'border-green-500' : ''}
                  />
                  {otpVerified && <p className="text-sm text-green-600">✓ OTP verified successfully!</p>}
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={loading || (!isLogin && !otpVerified)}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>

          <Button type="button" variant="ghost" className="w-full" onClick={handleModeSwitch}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

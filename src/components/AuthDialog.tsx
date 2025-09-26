import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "../lib/supabaseClient";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
              <fieldset className="relative border border-gray-300 rounded-lg px-3 pt-1 pb-2 focus-within:border-black">
                <legend className="px-1 text-sm text-gray-600 transition-colors focus-within:text-black">
                  Name
                </legend>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full focus:outline-none text-base text-gray-900"
                />
              </fieldset>

              <div className="flex gap-4">
                {/* Phone */}
                <div className="flex-1">
                  <fieldset className="relative border border-gray-300 rounded-lg px-3 pt-1 pb-2 focus-within:border-black">
                    <legend className="px-1 text-sm text-gray-600 transition-colors focus-within:text-black">
                      Phone
                    </legend>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full focus:outline-none text-base text-gray-900"
                    />
                  </fieldset>
                </div>

                {/* Gender - Using fieldset/legend to match Phone */}
                <div className="flex-1">
                  <fieldset className="relative border border-gray-300 rounded-lg px-3 pt-1 pb-2 focus-within:border-black">
                    <legend className="px-1 text-sm text-gray-600 transition-colors focus-within:text-black">
                      Gender
                    </legend>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger className="w-full h-[28px] p-0 border-0 focus:ring-0 focus:ring-offset-0 shadow-none">
                        <SelectValue placeholder="Select Gender" className="text-base" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </fieldset>
                </div>
              </div>
            </>
          )}

          <fieldset className="relative border border-gray-300 rounded-lg px-3 pt-1 pb-2 focus-within:border-black">
            <legend className="px-1 text-sm text-gray-600 transition-colors focus-within:text-black">
              Email
            </legend>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Reset OTP input and verification when email changes
                setOtp('');
                setOtpVerified(false);
                setOtpSent(false);
              }}
              required
              className="w-full focus:outline-none text-base text-gray-900"
            />
          </fieldset>

          <fieldset className="relative border border-gray-300 rounded-lg px-3 pt-1 pb-2 focus-within:border-black">
            <legend className="px-1 text-sm text-gray-600 transition-colors focus-within:text-black">
              Password
            </legend>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full focus:outline-none text-base text-gray-900 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </fieldset>

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
                <fieldset className={`relative border rounded-lg px-3 pt-1 pb-2 ${
                  otpVerified ? 'border-green-500' : 'border-gray-300 focus-within:border-black'
                }`}>
                  <legend className={`px-1 text-sm transition-colors ${
                    otpVerified ? 'text-green-600' : 'text-gray-600 focus-within:text-black'
                  }`}>
                    Enter 6-digit OTP
                  </legend>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    maxLength={6}
                    placeholder="000000"
                    className="w-full focus:outline-none text-base text-gray-900"
                  />
                  {otpVerified && (
                    <p className="text-sm text-green-600 mt-1">✓ OTP verified successfully!</p>
                  )}
                </fieldset>
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
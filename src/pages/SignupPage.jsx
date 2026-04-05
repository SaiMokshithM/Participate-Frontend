import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, IdCard } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/context/AuthContext';

const ICE = '#E8F4F8';
const LIGHT = '#B8D4DC';
const MID = '#8BAEBF';
const DARK = '#4A6572';
const DEEP = '#1C2B33';
const CARD = '#243542';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const studentId = formData.get('studentId');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    const role = 'STUDENT';

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, studentId, email, password, role });
      navigate('/login');
    } catch (err) {
      console.log(err);
      setErrorMsg(
        err?.response?.data?.message ?? 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ backgroundColor: DEEP }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px]"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <BrandLogo size="lg" />
            <span className="text-3xl font-bold tracking-tight" style={{ color: ICE }}>Participate+</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD, border: '1px solid rgba(139,174,191,0.15)' }}>
          <div className="h-1" style={{ background: `linear-gradient(to right, ${DEEP}, ${MID}, ${LIGHT})` }} />

          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold mb-1 text-center" style={{ color: ICE }}>Create Account</h2>
            <p className="text-sm text-center mb-6" style={{ color: LIGHT }}>Join the premier campus activity platform</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg text-sm text-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {errorMsg}
                </div>
              )}

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Input name="firstName" placeholder="First Name" required
                  className="h-11 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }} />
                <Input name="lastName" placeholder="Last Name" required
                  className="h-11 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }} />
              </div>

              {/* Identification ID */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <IdCard className="w-4 h-4" style={{ color: MID }} />
                </div>
                <Input
                  id="studentId" name="studentId"
                  placeholder="Identification Number (e.g. STU-001 or ADM-02)"
                  required
                  className="h-11 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4" style={{ color: MID }} />
                </div>
                <Input
                  id="email" name="email" type="email"
                  placeholder="University Email Address"
                  required
                  className="h-11 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: MID }} />
                </div>
                <Input id="password" name="password" type="password"
                  placeholder="Create a strong password" required
                  className="h-11 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }} />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: DARK }} />
                </div>
                <Input id="confirmPassword" name="confirmPassword" type="password"
                  placeholder="Confirm your password" required
                  className="h-11 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }} />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <div className="relative w-4 h-4 rounded mt-0.5 shrink-0"
                  style={{ border: '1px solid rgba(139,174,191,0.25)', backgroundColor: DEEP }}>
                  <input type="checkbox" id="terms" className="opacity-0 absolute inset-0 cursor-pointer peer" required />
                  <div className="w-2.5 h-2.5 rounded-sm m-auto scale-0 peer-checked:scale-100 transition-transform"
                    style={{ backgroundColor: MID }} />
                </div>
                <span className="text-sm leading-relaxed" style={{ color: LIGHT }}>
                  I agree to the{' '}
                  <Link to="#" className="font-semibold" style={{ color: MID }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="#" className="font-semibold" style={{ color: MID }}>Privacy Policy</Link>
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold rounded-xl text-sm mt-1 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: MID, color: DEEP }}
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </Button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator style={{ backgroundColor: 'rgba(139,174,191,0.10)' }} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 font-semibold tracking-wider" style={{ backgroundColor: CARD, color: DARK }}>Already a member?</span>
                </div>
              </div>

              <p className="text-center text-sm" style={{ color: LIGHT }}>
                <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: MID }}>Sign In Instead</Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { User, Lock } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth }   from '@/context/AuthContext';

const ICE  = '#E8F4F8';
const LIGHT = '#B8D4DC';
const MID   = '#8BAEBF';
const DARK  = '#4A6572';
const DEEP  = '#1C2B33';
const CARD  = '#243542';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [activeTab, setActiveTab] = useState('Student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const email    = e.target.email.value;
    const password = e.target.password.value;
    const role     = activeTab.toUpperCase(); // 'STUDENT' or 'ADMIN'

    try {
      const data = await login({ email, password, role });
      
      // Enforce the visual tab selection logically against the DB role
      if (activeTab === 'Admin' && data.role !== 'ADMIN') {
        await logout();
        setErrorMsg('Access denied. You do not have Administrator privileges.');
        return;
      }
      if (activeTab === 'Student' && data.role === 'ADMIN') {
        await logout();
        setErrorMsg('Access denied. Please use the Admin tab to log in.');
        return;
      }

      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else                       navigate('/student/dashboard');
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ?? err?.message ?? 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: DEEP }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
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
            <h2 className="text-2xl font-bold mb-1 text-center" style={{ color: ICE }}>Welcome Back</h2>
            <p  className="text-sm text-center mb-6"            style={{ color: LIGHT }}>Authenticate to access your portal</p>

            {/* Segmented Control */}
            <div className="flex p-1.5 mb-6 rounded-xl" style={{ backgroundColor: 'rgba(28,43,51,0.5)', border: '1px solid rgba(139,174,191,0.1)' }}>
              <button 
                type="button" 
                onClick={() => setActiveTab('Student')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'Student' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`} 
                style={{ 
                  backgroundColor: activeTab === 'Student' ? MID : 'transparent', 
                  color: activeTab === 'Student' ? DEEP : ICE 
                }}>
                Student
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('Admin')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'Admin' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`} 
                style={{ 
                  backgroundColor: activeTab === 'Admin' ? MID : 'transparent', 
                  color: activeTab === 'Admin' ? DEEP : ICE 
                }}>
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-lg text-sm text-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {errorMsg}
                </div>
              )}

              {/* Identifier (Email/Username) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4" style={{ color: MID }} />
                </div>
                <Input
                  id="email" name="email"
                  type={activeTab === 'Student' ? 'email' : 'text'}
                  placeholder={activeTab === 'Student' ? 'university@email.com' : 'Admin Username'}
                  required
                  className="h-12 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: MID }} />
                </div>
                <Input
                  id="password" name="password" type="password"
                  placeholder="Enter your password"
                  required
                  className="h-12 pl-10 rounded-xl text-sm"
                  style={{ backgroundColor: DEEP, border: '1px solid rgba(139,174,191,0.15)', color: ICE }}
                />
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative w-4 h-4 rounded" style={{ border: '1px solid rgba(139,174,191,0.25)', backgroundColor: DEEP }}>
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <div className="w-2.5 h-2.5 rounded-sm m-auto scale-0 peer-checked:scale-100 transition-transform" style={{ backgroundColor: MID }} />
                  </div>
                  <span style={{ color: LIGHT }}>Remember me</span>
                </label>
                {activeTab === 'Student' && (
                  <Link to="#" className="font-medium hover:opacity-80 transition-opacity" style={{ color: MID }}>Forgot password?</Link>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold rounded-xl text-sm mt-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: MID, color: DEEP }}
              >
                {loading ? 'Authenticating…' : 'Authenticate'}
              </Button>

              {activeTab === 'Student' && (
                <>
                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <Separator style={{ backgroundColor: 'rgba(139,174,191,0.10)' }} />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-3 font-semibold tracking-wider" style={{ backgroundColor: CARD, color: DARK }}>New to Participate+?</span>
                    </div>
                  </div>

                  <p className="text-center text-sm" style={{ color: LIGHT }}>
                    <Link to="/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: MID }}>Request an Account</Link>
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

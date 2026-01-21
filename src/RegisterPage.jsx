import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/app');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username,
            mobile: mobile
          }
        }
      });
      if (error) throw error;
      setMessage('Check your email for confirmation link! Your account will be reviewed by admin.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 sm:p-10 text-center rounded-b-[2rem]">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Speed Planner</h1>
          </Link>
          <p className="text-emerald-200 text-sm">Request Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              required
              className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mobile</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+62 812 3456 7890"
              required
              className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm font-medium">
              {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-600/30"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Request Access
          </button>

          <div className="flex items-center justify-center pt-2">
            <span className="text-slate-500 text-sm">Already have an account?</span>
            <Link 
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors ml-2"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Save, Trash2, Sparkles, Loader2, LogOut, User, Download, Menu, Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formatTime = (hour, minute = 0) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
const parseTime = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
};

const HEADER_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000"
];

const generateGeminiResponse = async (prompt, systemInstruction = "") => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key not configured");
    return null;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error("Gemini API Error Status:", response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return null;
  }
};

const CATEGORIES = {
  INCOME: {
    id: 'income',
    label: 'Income',
    fullLabel: 'Income Generating',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    activeColor: 'bg-emerald-200 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400',
    barColor: 'bg-emerald-500',
    activities: [
      '1. Setting New Sales Appointments',
      '2. Sales Activities',
      '3. Fact finding Interviews',
      '4. Prospecting (Build New Customer)'
    ]
  },
  SUPPORTING: {
    id: 'supporting',
    label: 'Support',
    fullLabel: 'Supporting',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    activeColor: 'bg-amber-200 border-amber-400 text-amber-900 ring-2 ring-amber-400',
    barColor: 'bg-amber-500',
    activities: [
      '5. Planning',
      '6. Proposal Development',
      '7. Client Building',
      '8. Other Telephoning',
      '9. Record Keeping',
      '10. Recruiting',
      '11. Build COI',
      '12. Build High Value Policy',
      '13. Meeting'
    ]
  },
  SELF_DEV: {
    id: 'self_dev',
    label: 'Growth',
    fullLabel: 'Self Development',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    activeColor: 'bg-blue-200 border-blue-400 text-blue-900 ring-2 ring-blue-400',
    barColor: 'bg-blue-500',
    activities: [
      '14. Self Development',
      '15. SG Contribution Activity'
    ]
  },
  PERSONAL: {
    id: 'personal',
    label: 'Personal',
    fullLabel: 'Personal / Leisure',
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    activeColor: 'bg-rose-200 border-rose-400 text-rose-900 ring-2 ring-rose-400',
    barColor: 'bg-rose-500',
    activities: [
      '16. Exercise',
      '17. Tension Relieving',
      '18. Break',
      '19. Leisure',
      '20. Informal Visiting',
      '21. Others'
    ]
  }
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

const Modal = ({ isOpen, onClose, title, children, fullScreen = false }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className={`bg-white w-full ${fullScreen ? 'h-full sm:h-auto sm:max-h-[90vh]' : 'max-h-[90vh]'} sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col`}>
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const TimeSelectionBlock = ({ formStartTime, setFormStartTime, formEndTime, setFormEndTime, initialDate, setSelectedDayIndex }) => {
  const startHour = HOURS[0]; 
  const endHour = HOURS[HOURS.length - 1] + 1; 

  const allTimeOptions = useMemo(() => {
    const options = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        options.push(formatTime(h, m));
      }
    }
    if (endHour === 22) options.push(formatTime(22, 0)); 
    return options;
  }, []);

  const validEndOptions = useMemo(() => {
    return allTimeOptions.filter(time => time > formStartTime);
  }, [formStartTime, allTimeOptions]);

  useEffect(() => {
    if (formEndTime && formStartTime && formEndTime <= formStartTime) {
      setFormEndTime(validEndOptions[0] || allTimeOptions[allTimeOptions.length - 1]);
    }
  }, [formStartTime, formEndTime, setFormEndTime, validEndOptions, allTimeOptions]);

  useEffect(() => {
    if (!formStartTime || !formEndTime) {
      setFormStartTime(formatTime(8, 0));
      setFormEndTime(formatTime(9, 0));
    }
  }, [formStartTime, formEndTime, setFormStartTime, setFormEndTime]);
  
  const getWeekDateOptions = (date) => {
    const options = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      options.push({
        value: day.toISOString().split('T')[0],
        dayIndex: i, 
        label: `${DAYS[i]} (${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
      });
    }
    return options;
  };
  
  const weekDateOptions = getWeekDateOptions(initialDate);
  const selectedDateString = initialDate.toISOString().split('T')[0];
  
  return (
    <>
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Day</label>
        <select
          value={selectedDateString}
          onChange={(e) => {
            const selectedOption = weekDateOptions.find(opt => opt.value === e.target.value);
            if (selectedOption) {
              setSelectedDayIndex(selectedOption.dayIndex);
            }
          }}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
        >
          {weekDateOptions.map(option => (
            <option key={option.value} value={option.value}> 
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Start</label>
          <select 
            value={formStartTime} 
            onChange={(e) => setFormStartTime(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          >
            {allTimeOptions.slice(0, allTimeOptions.length - 1).map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">End</label>
          <select 
            value={formEndTime} 
            onChange={(e) => setFormEndTime(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          >
            {validEndOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const OverviewModal = ({ isOpen, onClose, appointments, metrics, weekKey, weeklyOverviewDoc, onRemarksChange, onAiAnalyze }) => {
  const [remarks, setRemarks] = useState(weeklyOverviewDoc?.remarks || '');
  const [aiText, setAiText] = useState(weeklyOverviewDoc?.ai_analysis || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null); 

  useEffect(() => {
    setRemarks(weeklyOverviewDoc?.remarks || '');
    setAiText(weeklyOverviewDoc?.ai_analysis || null);
    setAiError(null); 
  }, [weeklyOverviewDoc]);

  const stats = useMemo(() => {
    let catCounts = { income: 0, supporting: 0, self_dev: 0, personal: 0 };
    let totalHours = 0;
    let metricTotals = { O: 0, P: 0, F: 0, R: 0 };

    if (!isOpen) return { catCounts, totalHours, metricTotals };

    Object.values(appointments).forEach(appt => {
      if (appt.week_key === weekKey) {
        if (catCounts[appt.category] !== undefined) {
          catCounts[appt.category]++;
          totalHours++;
        }
      }
    });

    Object.values(metrics).forEach(m => {
      if (m.week_key === weekKey) {
        metricTotals.O += m.open_count || 0;
        metricTotals.P += m.present_count || 0;
        metricTotals.F += m.follow_count || 0;
        metricTotals.R += m.close_count || 0;
      }
    });

    return { catCounts, totalHours, metricTotals };
  }, [appointments, metrics, weekKey, isOpen]);

  const getPercent = (count) => stats.totalHours > 0 ? Math.round((count / stats.totalHours) * 100) : 0;

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiText(null); 
    setAiError(null);
    onAiAnalyze(null); 

    const prompt = `
      Act as a high-performance Sales Manager analyzing a weekly activity log. Provide a concise, professional analysis.
      
      Here is the data for the week:
      - Total Hours Logged: ${stats.totalHours}
      - Income Generating Hours: ${stats.catCounts.income}
      - Supporting/Admin Hours: ${stats.catCounts.supporting}
      - Self Development Hours: ${stats.catCounts.self_dev}
      - Personal Hours: ${stats.catCounts.personal}
      
      Sales Pipeline Metrics:
      - Opens: ${stats.metricTotals.O}
      - Presentations: ${stats.metricTotals.P}
      - Follow-ups: ${stats.metricTotals.F}
      - Reviews (Closes): ${stats.metricTotals.R}

      Please provide your feedback using the following structure, separated by blank lines:
      
      [1. A one-sentence summary of my performance (Be encouraging but honest).]

      [2. A specific observation about my activity balance.]

      [3. Three actionable pieces of advice for next week, formatted as a numbered list (1., 2., 3.).]
    `;

    const result = await generateGeminiResponse(prompt);

    if (result) {
      onAiAnalyze(result); 
    } else {
      setAiError("Failed to connect to the AI service or retrieve a valid analysis.");
    }
    setIsAnalyzing(false);
  };
  
  const handleRemarksLocalChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleRemarksBlur = () => {
    onRemarksChange(remarks);
  };
  
  const handleModalClose = () => {
    handleRemarksBlur(); 
    onClose(); 
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Weekly Overview</h3>
            <p className="text-xs text-slate-500 font-semibold">{weekKey}</p>
          </div>
          <button onClick={handleModalClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={22} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
            {['O', 'P', 'F', 'R'].map(metric => {
              const style = {
                'O': { label: 'Open', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
                'P': { label: 'Present', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                'F': { label: 'Follow', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                'R': { label: 'Close', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
              }[metric];

              return (
                <div key={metric} className={`${style.bg} ${style.border} border rounded-xl p-3 sm:p-4 text-center`}>
                  <div className={`text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider ${style.text} opacity-80`}>
                    {style.label}
                  </div>
                  <div className={`text-2xl sm:text-3xl font-black ${style.text}`}>{stats.metricTotals[metric]}</div>
                </div>
              )
            })}
          </div>

          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Time Distribution</h4>
          <div className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-slate-200">
            {Object.values(CATEGORIES).map(cat => {
              const count = stats.catCounts[cat.id];
              const percent = getPercent(count);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-bold text-slate-700">{cat.fullLabel}</span>
                    <span className="text-slate-500 font-semibold">{count}h ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${cat.barColor} transition-all duration-500`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Coach Comments
            </h4>
            <textarea
              value={remarks}
              onChange={handleRemarksLocalChange}
              onBlur={handleRemarksBlur}
              placeholder="Add your coaching notes..."
              className="w-full p-3 sm:p-4 bg-white border border-slate-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-slate-700 resize-none"
            />
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 sm:p-5 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-indigo-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                AI Coach
              </h4>
              {!aiText && !isAnalyzing && (
                <button 
                  onClick={handleAiAnalyze}
                  className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-all font-bold flex items-center gap-1 active:scale-95"
                >
                  <Sparkles size={12} /> Analyze
                </button>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-blue-500 text-sm py-3 justify-center">
                <Loader2 className="animate-spin" size={18} />
                <span className="font-bold">Analyzing...</span>
              </div>
            )}
            
            {aiError && (
              <div className="text-sm p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 font-semibold">
                {aiError}
              </div>
            )}

            {aiText && (
              <div 
                className="text-slate-700 bg-white p-3 sm:p-4 rounded-lg border border-indigo-100 text-sm leading-relaxed font-medium"
                style={{ whiteSpace: 'pre-line' }} 
              >
                {aiText}
              </div>
            )}
            
            {!aiText && !isAnalyzing && !aiError && (
              <p className="text-sm text-indigo-600/70 text-center py-2">
                Tap "Analyze" to get AI insights
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <button 
            onClick={handleModalClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Weekly Planner</h1>
          <p className="text-blue-100 text-sm">Track your activities & grow</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-semibold">
              {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MobileDaySelector = ({ mobileDay, setMobileDay, getDayDate }) => {
  return (
    <div className="flex overflow-x-auto gap-2 p-3 bg-white border-b border-slate-200 md:hidden scrollbar-hide">
      {DAYS.map((day, idx) => {
        const isActive = idx === mobileDay;
        const dayDate = getDayDate(idx);
        return (
          <button
            key={day}
            onClick={() => setMobileDay(idx)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-center transition-all ${
              isActive 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <div className="text-xs font-bold">{day}</div>
            <div className={`text-lg font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>
              {dayDate.getDate()}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [dailyTasks, setDailyTasks] = useState({});
  const [metrics, setMetrics] = useState({});
  const [weeklyOverviews, setWeeklyOverviews] = useState({}); 
  const [generatingDay, setGeneratingDay] = useState(null);
  const [taskGenError, setTaskGenError] = useState(null); 
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [formActivity, setFormActivity] = useState('');
  const [formCategory, setFormCategory] = useState('income');
  const [formDescription, setFormDescription] = useState('');
  const [formStartTime, setFormStartTime] = useState(formatTime(8, 0)); 
  const [formEndTime, setFormEndTime] = useState(formatTime(9, 0));
  const [editId, setEditId] = useState(null);
  
  const [mobileDay, setMobileDay] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  }); 
  
  const [headerImage, setHeaderImage] = useState('');

  const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
  };

  const weekKey = useMemo(() => getWeekKey(currentDate), [currentDate]);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const getDayDate = (dayIndex) => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay() + 1;
    const day = new Date(curr.setDate(first + dayIndex));
    return day;
  };

  useEffect(() => {
    const randomImg = HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)];
    setHeaderImage(randomImg);
  }, []);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) console.error("Login failed", error);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) console.error("Guest login failed", error);
    } catch (error) {
      console.error("Guest login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAppointments({});
      setDailyTasks({});
      setMetrics({});
      setWeeklyOverviews({});
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load appointments
      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id);
      
      if (apptData) {
        const apptObj = {};
        apptData.forEach(a => { apptObj[a.slot_key] = a; });
        setAppointments(apptObj);
      }

      // Load tasks
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (taskData) {
        const taskObj = {};
        taskData.forEach(t => { taskObj[t.day_key] = t.task_list; });
        setDailyTasks(taskObj);
      }

      // Load metrics
      const { data: metricData } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);
      
      if (metricData) {
        const metricObj = {};
        metricData.forEach(m => { metricObj[m.day_key] = m; });
        setMetrics(metricObj);
      }

      // Load weekly overviews
      const { data: overviewData } = await supabase
        .from('weekly_overviews')
        .select('*')
        .eq('user_id', user.id);
      
      if (overviewData) {
        const overviewObj = {};
        overviewData.forEach(o => { overviewObj[o.week_key] = o; });
        setWeeklyOverviews(overviewObj);
      }
    };

    loadData();

    // Real-time subscriptions
    const apptChannel = supabase
      .channel('appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setAppointments(prev => {
            const newAppts = { ...prev };
            delete newAppts[payload.old.slot_key];
            return newAppts;
          });
        } else {
          setAppointments(prev => ({ ...prev, [payload.new.slot_key]: payload.new }));
        }
      })
      .subscribe();

    const taskChannel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setDailyTasks(prev => {
            const newTasks = { ...prev };
            delete newTasks[payload.old.day_key];
            return newTasks;
          });
        } else {
          setDailyTasks(prev => ({ ...prev, [payload.new.day_key]: payload.new.task_list }));
        }
      })
      .subscribe();

    const metricChannel = supabase
      .channel('metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metrics', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMetrics(prev => {
            const newMetrics = { ...prev };
            delete newMetrics[payload.old.day_key];
            return newMetrics;
          });
        } else {
          setMetrics(prev => ({ ...prev, [payload.new.day_key]: payload.new }));
        }
      })
      .subscribe();

    const overviewChannel = supabase
      .channel('weekly_overviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_overviews', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setWeeklyOverviews(prev => {
            const newOverviews = { ...prev };
            delete newOverviews[payload.old.week_key];
            return newOverviews;
          });
        } else {
          setWeeklyOverviews(prev => ({ ...prev, [payload.new.week_key]: payload.new }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(apptChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(metricChannel);
      supabase.removeChannel(overviewChannel);
    };
  }, [user]);

  const handleSaveOverviewField = async (field, value) => {
    if (!user) return;
    
    const dbField = field === 'aiAnalysis' ? 'ai_analysis' : field;
    const update = { 
      user_id: user.id,
      week_key: weekKey,
      [dbField]: value, 
      updated_at: new Date().toISOString() 
    };
    
    if (field === 'aiAnalysis' && value !== null) {
      update.analysis_generated_at = new Date().toISOString(); 
    }
    
    setWeeklyOverviews(prev => ({
      ...prev,
      [weekKey]: { ...prev[weekKey], ...update }
    }));

    try {
      await supabase
        .from('weekly_overviews')
        .upsert(update, { onConflict: 'user_id,week_key' });
    } catch (e) {
      console.error(`Error saving ${field}:`, e);
    }
  };
  
  const handleExportHtml = () => {
    let catCounts = { income: 0, supporting: 0, self_dev: 0, personal: 0 };
    let totalHours = 0;
    let metricTotals = { O: 0, P: 0, F: 0, R: 0 };

    Object.values(appointments).forEach(appt => {
      if (appt.week_key === weekKey) {
        if (catCounts[appt.category] !== undefined) {
          catCounts[appt.category]++;
          totalHours++;
        }
      }
    });

    Object.values(metrics).forEach(m => {
      if (m.week_key === weekKey) {
        metricTotals.O += m.open_count || 0;
        metricTotals.P += m.present_count || 0;
        metricTotals.F += m.follow_count || 0;
        metricTotals.R += m.close_count || 0;
      }
    });

    const getPercent = (count) => totalHours > 0 ? Math.round((count / totalHours) * 100) : 0;
    
    const aiAnalysisText = weeklyOverviews[weekKey]?.ai_analysis || "No AI analysis was generated for this week.";
    const coachRemarksText = weeklyOverviews[weekKey]?.remarks || "No personal coach remarks were added.";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coach Overview - ${currentYear} ${weekKey}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f7; padding: 20px; color: #1d1d1f; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h1 { color: #1d1d1f; margin-bottom: 4px; font-size: 24px; }
    .subtitle { color: #86868b; font-size: 13px; margin-bottom: 24px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric-card { border: 1px solid #f0f0f0; border-radius: 12px; padding: 12px; text-align: center; }
    .metric-label { color: #86868b; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
    .metric-value { color: #1d1d1f; font-size: 28px; font-weight: 700; }
    .section-title { color: #1d1d1f; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .bar-item { margin-bottom: 12px; }
    .bar-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    .bar-bg { background: #f5f5f7; height: 8px; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .coach-box { background: #fbfbfd; border: 1px solid #f0f0f0; padding: 16px; border-radius: 12px; margin-top: 16px; }
    .coach-title { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
    .coach-content { line-height: 1.5; white-space: pre-line; font-size: 13px; color: #424245; }
    .footer { margin-top: 24px; text-align: center; color: #86868b; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weekly Report</h1>
    <p class="subtitle">${weekKey} | ${new Date().toLocaleDateString()}</p>
    <div class="metrics-grid">
      <div class="metric-card" style="background: #fff1f2;">
        <div class="metric-label" style="color: #9f1239;">Open</div>
        <div class="metric-value" style="color: #be123c;">${metricTotals.O}</div>
      </div>
      <div class="metric-card" style="background: #f5f3ff;">
        <div class="metric-label" style="color: #5b21b6;">Present</div>
        <div class="metric-value" style="color: #6d28d9;">${metricTotals.P}</div>
      </div>
      <div class="metric-card" style="background: #f0fdf4;">
        <div class="metric-label" style="color: #166534;">Follow</div>
        <div class="metric-value" style="color: #15803d;">${metricTotals.F}</div>
      </div>
      <div class="metric-card" style="background: #fffbeb;">
        <div class="metric-label" style="color: #92400e;">Close</div>
        <div class="metric-value" style="color: #b45309;">${metricTotals.R}</div>
      </div>
    </div>
    <div class="section-title">Time Distribution</div>
    ${Object.values(CATEGORIES).map(cat => {
      const count = catCounts[cat.id] || 0;
      const percent = getPercent(count);
      let colorHex = '#9ca3af'; 
      if (cat.id === 'income') colorHex = '#10b981';
      if (cat.id === 'supporting') colorHex = '#f59e0b';
      if (cat.id === 'self_dev') colorHex = '#3b82f6';
      if (cat.id === 'personal') colorHex = '#f43f5e';
      return `<div class="bar-item">
        <div class="bar-header"><strong>${cat.fullLabel}</strong><span>${count}h (${percent}%)</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${percent}%; background-color: ${colorHex};"></div></div>
      </div>`;
    }).join('')}
    <div class="coach-box">
      <div class="coach-title">Coach Remarks</div>
      <div class="coach-content">${coachRemarksText}</div>
    </div>
    <div class="coach-box" style="background: #eff6ff;">
      <div class="coach-title" style="color: #2563eb;">AI Coach</div>
      <div class="coach-content">${aiAnalysisText}</div>
    </div>
    <div class="footer">Weekly Activity Planner</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report-${weekKey}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMobileMenu(false);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleNewActivityClick = () => {
    const today = new Date();
    const initialDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; 
    
    const currentHour = today.getHours();
    const defaultStartHour = HOURS.includes(currentHour) ? currentHour : HOURS[0];
    const defaultEndHour = defaultStartHour < HOURS[HOURS.length - 1] + 1 ? defaultStartHour + 1 : HOURS[HOURS.length - 1] + 1;
    
    setFormCategory('income');
    setFormActivity(CATEGORIES.INCOME.activities[0]);
    setFormDescription('');
    setFormStartTime(formatTime(defaultStartHour, 0)); 
    setFormEndTime(formatTime(defaultEndHour, 0));
    setEditId(null);
    setSelectedDayIndex(initialDayIndex);
    setIsModalOpen(true);
    setShowMobileMenu(false);
  };
  
  const handleEditActivityClick = (dayIndex, hour) => {
    const key = `${weekKey}-${dayIndex}-${hour}`;
    const existing = appointments[key];
    
    setSelectedDayIndex(dayIndex); 
    
    if (existing) {
      setFormCategory(existing.category);
      setFormActivity(existing.activity_type);
      setFormDescription(existing.description || '');
      setFormStartTime(existing.start_time); 
      setFormEndTime(existing.end_time);
      setEditId(existing.custom_id); 
    } else {
      setFormCategory('income');
      setFormActivity(CATEGORIES.INCOME.activities[0]);
      setFormDescription('');
      setFormStartTime(formatTime(hour, 0));
      setFormEndTime(formatTime(hour + 1, 0));
      setEditId(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!user) return;
    
    const startObj = parseTime(formStartTime);
    const endObj = parseTime(formEndTime);
    
    if (endObj.hour < startObj.hour || (endObj.hour === startObj.hour && endObj.minute <= startObj.minute)) {
      alert("End time must be after start time.");
      return;
    }
    
    const updateTime = new Date().toISOString();

    const startHourBlock = startObj.hour; 
    const endHourBlock = endObj.hour + (endObj.minute > 0 ? 1 : 0); 
    
    const minHour = HOURS[0];
    const maxHour = HOURS[HOURS.length - 1] + 1;
    
    const actualStartHourBlock = Math.max(startHourBlock, minHour);
    const actualEndHourBlock = Math.min(endHourBlock, maxHour);

    const customId = editId || Date.now().toString(); 
    
    // Delete old blocks if editing
    if (editId) {
      const blocksToDelete = Object.keys(appointments).filter(key => {
        const appt = appointments[key];
        const isSameDay = appt.day_index === selectedDayIndex && appt.week_key === weekKey;
        const isSameCustomId = appt.custom_id === editId; 
        
        if (isSameDay && isSameCustomId) {
          const blockHour = appt.hour;
          const isStillWithinRange = (blockHour >= actualStartHourBlock && blockHour < actualEndHourBlock);
          return !isStillWithinRange;
        }
        return false;
      });

      for (const key of blocksToDelete) {
        await supabase.from('appointments').delete().eq('slot_key', key).eq('user_id', user.id);
      }
    }

    // Save new blocks
    for (let h = actualStartHourBlock; h < actualEndHourBlock; h++) {
      const key = `${weekKey}-${selectedDayIndex}-${h}`;
      
      const blockData = {
        user_id: user.id,
        slot_key: key,
        week_key: weekKey,
        day_index: selectedDayIndex,
        hour: h,
        category: formCategory,
        activity_type: formActivity,
        description: formDescription,
        start_time: formStartTime,
        end_time: formEndTime,
        custom_id: customId,
        updated_at: updateTime
      };
      
      try {
        await supabase.from('appointments').upsert(blockData, { onConflict: 'user_id,slot_key' });
      } catch (e) {
        console.error("Error saving appt block:", e);
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteAppointment = async () => {
    if (!editId || !user) return;
    
    const blocksToDelete = Object.keys(appointments).filter(key => appointments[key].custom_id === editId);
    
    for (const key of blocksToDelete) {
      await supabase.from('appointments').delete().eq('slot_key', key).eq('user_id', user.id);
    }

    setIsModalOpen(false);
  };

  const handleTaskChange = async (dayIndex, taskIndex, value) => {
    if (!user) return;
    const key = `${weekKey}-${dayIndex}`;
    
    const currentList = dailyTasks[key] || ['', '', '', '', '', ''];
    const newList = [...currentList];
    newList[taskIndex] = value;

    setDailyTasks(prev => ({ ...prev, [key]: newList }));

    try {
      await supabase.from('tasks').upsert({
        user_id: user.id,
        day_key: key,
        week_key: weekKey,
        day_index: dayIndex,
        task_list: newList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,day_key' });
    } catch (e) {
      console.error("Error saving task:", e);
    }
  };

  const handleGenerateTasks = async (dayIndex) => {
    if (!user) return;
    setGeneratingDay(dayIndex);
    setTaskGenError(null); 

    const dayAppts = [];
    for (let h of HOURS) {
      const key = `${weekKey}-${dayIndex}-${h}`;
      if (appointments[key]) {
        dayAppts.push(appointments[key].activity_type + (appointments[key].description ? `: ${appointments[key].description}` : ''));
      }
    }

    const apptContext = dayAppts.length > 0 
      ? `Appointments today: ${dayAppts.join('; ')}` 
      : "No specific appointments scheduled yet.";

    const prompt = `
      I need a daily to-do list of exactly 6 short, actionable tasks for a salesperson.
      Context for today: ${apptContext}
      
      Return ONLY a valid JSON array of 6 strings. Example: ["Call client X", "Prep for meeting", ...]
      Do not include markdown formatting or explanation.
    `;

    const responseText = await generateGeminiResponse(prompt);
    
    if (responseText) {
      try {
        const match = responseText.match(/\[[\s\S]*?\]/);
        const jsonString = match ? match[0] : responseText.trim();
        
        const taskList = JSON.parse(jsonString);
        
        if (Array.isArray(taskList) && taskList.length > 0) {
          const finalTasks = taskList.slice(0, 6);
          while (finalTasks.length < 6) finalTasks.push("");

          const key = `${weekKey}-${dayIndex}`;

          setDailyTasks(prev => ({ ...prev, [key]: finalTasks }));
          
          await supabase.from('tasks').upsert({
            user_id: user.id,
            day_key: key,
            week_key: weekKey,
            day_index: dayIndex,
            task_list: finalTasks,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,day_key' });
        } else {
          setTaskGenError("Invalid AI response format.");
        }
      } catch (e) {
        console.error("Failed to parse AI tasks:", e);
        setTaskGenError("Failed to parse AI response.");
      }
    } else {
      setTaskGenError("AI connection failed.");
    }
    setGeneratingDay(null);
  };

  const handleMetricChange = async (dayIndex, metric, delta) => {
    if (!user) return;
    const key = `${weekKey}-${dayIndex}`;
    
    const currentMetrics = metrics[key] || { open_count: 0, present_count: 0, follow_count: 0, close_count: 0 };
    const metricFieldMap = { O: 'open_count', P: 'present_count', F: 'follow_count', R: 'close_count' };
    const field = metricFieldMap[metric];
    
    const newVal = Math.max(0, (currentMetrics[field] || 0) + delta);
    const newMetricsObj = { ...currentMetrics, [field]: newVal };

    setMetrics(prev => ({ ...prev, [key]: newMetricsObj }));

    try {
      await supabase.from('metrics').upsert({
        user_id: user.id,
        day_key: key,
        week_key: weekKey,
        day_index: dayIndex,
        open_count: newMetricsObj.open_count || 0,
        present_count: newMetricsObj.present_count || 0,
        follow_count: newMetricsObj.follow_count || 0,
        close_count: newMetricsObj.close_count || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,day_key' });
    } catch (e) {
      console.error("Error saving metric:", e);
    }
  };

  const renderCategorySelect = () => {
    return (
      <div className="space-y-4">
        <TimeSelectionBlock 
          initialDate={getDayDate(selectedDayIndex)} 
          formStartTime={formStartTime}
          setFormStartTime={setFormStartTime}
          formEndTime={formEndTime}
          setFormEndTime={setFormEndTime}
          setSelectedDayIndex={setSelectedDayIndex} 
        />
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(CATEGORIES).map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setFormCategory(cat.id);
                  setFormActivity(cat.activities[0]);
                }}
                className={`p-3 text-xs font-bold rounded-xl border-2 transition-all active:scale-95 ${
                  formCategory === cat.id ? cat.activeColor : cat.color
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Activity</label>
          <select 
            value={formActivity} 
            onChange={(e) => setFormActivity(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          >
            {CATEGORIES[formCategory.toUpperCase()]?.activities.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notes</label>
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Client name, venue..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 gap-2">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleGoogleLogin} onGuest={handleGuestLogin} />;
  }

  const getApptData = (dayIdx, hour) => {
    const key = `${weekKey}-${dayIdx}-${hour}`;
    const appt = appointments[key];
    
    if (!appt) return { isSet: false, data: null, categoryData: null };
    
    const categoryData = Object.values(CATEGORIES).find(c => c.id === appt.category);
    
    const isFirstBlock = (() => {
      const apptStartTimeHour = parseTime(appt.start_time).hour;
      if (hour === apptStartTimeHour) return true;
      
      const prevKey = `${weekKey}-${dayIdx}-${hour - 1}`;
      const prevAppt = appointments[prevKey];
      
      return !prevAppt || prevAppt.custom_id !== appt.custom_id;
    })();
    
    return { isSet: true, data: appt, categoryData, isFirstBlock };
  };

  const renderMobileDayView = () => {
    const dayIdx = mobileDay;
    const dayKey = `${weekKey}-${dayIdx}`;
    const dayMetrics = metrics[dayKey] || { open_count: 0, present_count: 0, follow_count: 0, close_count: 0 };

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-amber-50 p-4 border-b border-amber-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-amber-800">Today's Priorities</h3>
            <button 
              onClick={() => handleGenerateTasks(dayIdx)}
              disabled={generatingDay === dayIdx}
              className="text-amber-600 p-2 rounded-full hover:bg-amber-100 active:scale-95"
            >
              {generatingDay === dayIdx ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          </div>
          
          {taskGenError && (
            <div className="text-xs text-red-600 p-2 bg-red-50 rounded-lg mb-2 font-semibold">
              {taskGenError}
            </div>
          )}

          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map(taskIdx => {
              const taskKey = `${weekKey}-${dayIdx}`;
              const val = dailyTasks[taskKey]?.[taskIdx] || '';
              return (
                <div key={taskIdx} className="flex items-center gap-2">
                  <span className="text-xs text-amber-600 font-bold w-4">{taskIdx + 1}</span>
                  <input 
                    type="text"
                    className="flex-1 text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    value={val}
                    onChange={(e) => handleTaskChange(dayIdx, taskIdx, e.target.value)}
                    placeholder={`Task ${taskIdx + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Daily Metrics</h3>
          <div className="grid grid-cols-4 gap-2">
            {['O', 'P', 'F', 'R'].map(metric => {
              const config = {
                O: { label: 'Open', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', field: 'open_count' },
                P: { label: 'Present', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', field: 'present_count' },
                F: { label: 'Follow', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', field: 'follow_count' },
                R: { label: 'Close', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', field: 'close_count' }
              }[metric];
              
              return (
                <div key={metric} className={`${config.bg} ${config.border} border rounded-xl p-2 text-center`}>
                  <div className={`text-[10px] font-bold ${config.text} uppercase`}>{config.label}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button 
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm active:scale-90"
                      onClick={() => handleMetricChange(dayIdx, metric, -1)}
                    >-</button>
                    <span className={`text-xl font-black ${config.text} w-8`}>{dayMetrics[config.field] || 0}</span>
                    <button 
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm active:scale-90"
                      onClick={() => handleMetricChange(dayIdx, metric, 1)}
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Schedule</h3>
          <div className="space-y-1">
            {HOURS.map((hour) => {
              const { isSet, data: appt, categoryData, isFirstBlock } = getApptData(dayIdx, hour);
              
              return (
                <div 
                  key={hour} 
                  onClick={() => handleEditActivityClick(dayIdx, hour)}
                  className={`flex items-stretch rounded-xl overflow-hidden border transition-all active:scale-[0.99] ${
                    isSet ? `${categoryData?.color} border-current` : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-16 flex-shrink-0 flex items-center justify-center text-xs font-bold py-3 ${
                    isSet ? 'opacity-70' : 'text-slate-500 bg-slate-50'
                  }`}>
                    {hour}:00
                  </div>
                  <div className="flex-1 p-3 min-h-[52px]">
                    {isSet && isFirstBlock ? (
                      <>
                        <div className="text-sm font-bold leading-tight">
                          {appt.description || appt.activity_type}
                        </div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {appt.start_time} - {appt.end_time}
                        </div>
                      </>
                    ) : isSet ? (
                      <div className="text-xs opacity-50">continued...</div>
                    ) : (
                      <div className="flex items-center text-slate-400">
                        <Plus size={14} className="mr-1" />
                        <span className="text-xs">Add activity</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopGridView = () => {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-w-[900px]">
          <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
            <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">
              Time
            </div>
            {DAYS.map((day, idx) => (
              <div key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                <div className="font-bold text-slate-800">{day}</div>
                <div className="text-xs text-slate-500">
                  {getDayDate(idx).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 border-b border-slate-300">
            <div className="p-2 bg-amber-50 text-xs font-bold text-amber-700 text-center border-r border-slate-200 flex items-center justify-center">
              Tasks
            </div>
            {DAYS.map((_, idx) => (
              <div key={idx} className="bg-amber-50/50 p-2 border-r border-slate-200 last:border-r-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-amber-700">Priorities</span>
                  <button 
                    onClick={() => handleGenerateTasks(idx)}
                    disabled={generatingDay === idx}
                    className="text-amber-600 p-1 rounded hover:bg-amber-100"
                  >
                    {generatingDay === idx ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  </button>
                </div>
                <div className="space-y-1">
                  {[0, 1, 2].map(taskIdx => {
                    const taskKey = `${weekKey}-${idx}`;
                    const val = dailyTasks[taskKey]?.[taskIdx] || '';
                    return (
                      <input 
                        key={taskIdx}
                        type="text"
                        className="w-full text-[10px] bg-white border border-amber-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        value={val}
                        onChange={(e) => handleTaskChange(idx, taskIdx, e.target.value)}
                        placeholder={`${taskIdx + 1}.`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0 min-h-[60px]">
              <div className="border-r border-slate-200 text-xs font-bold text-slate-500 flex items-center justify-center bg-slate-50">
                {hour}:00
              </div>
              {DAYS.map((_, dayIdx) => {
                const { isSet, data: appt, categoryData, isFirstBlock } = getApptData(dayIdx, hour);
                
                return (
                  <div 
                    key={dayIdx}
                    onClick={() => handleEditActivityClick(dayIdx, hour)}
                    className={`border-r border-slate-200 last:border-r-0 cursor-pointer transition-colors group ${
                      isSet ? categoryData?.color : 'hover:bg-slate-50'
                    }`}
                  >
                    {isSet ? (
                      <div className="p-1.5 h-full">
                        {isFirstBlock && (
                          <>
                            <div className="text-[10px] font-bold opacity-70">{appt.start_time}-{appt.end_time}</div>
                            <div className="text-xs font-bold leading-tight truncate">
                              {appt.description || appt.activity_type.split('.')[1]?.trim() || appt.activity_type}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Plus size={14} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="grid grid-cols-8 border-t-2 border-slate-300 bg-slate-50">
            <div className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200 flex items-center justify-center">
              Metrics
            </div>
            {DAYS.map((_, idx) => {
              const dayKey = `${weekKey}-${idx}`;
              const dayMetrics = metrics[dayKey] || { open_count: 0, present_count: 0, follow_count: 0, close_count: 0 };
              
              return (
                <div key={idx} className="p-2 border-r border-slate-200 last:border-r-0">
                  <div className="grid grid-cols-2 gap-1">
                    {['O', 'P', 'F', 'R'].map(metric => {
                      const config = {
                        O: { color: 'text-pink-600', field: 'open_count' },
                        P: { color: 'text-purple-600', field: 'present_count' },
                        F: { color: 'text-emerald-600', field: 'follow_count' },
                        R: { color: 'text-amber-600', field: 'close_count' }
                      }[metric];
                      return (
                        <div key={metric} className="flex items-center justify-between bg-white rounded px-1 py-0.5 border">
                          <span className={`text-[9px] font-bold ${config.color}`}>{metric}</span>
                          <div className="flex items-center gap-0.5">
                            <button 
                              className="text-slate-400 hover:text-red-500 text-[10px]"
                              onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, metric, -1); }}
                            >-</button>
                            <span className="text-xs font-bold w-3 text-center">{dayMetrics[config.field] || 0}</span>
                            <button 
                              className="text-slate-400 hover:text-green-500 text-[10px]"
                              onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, metric, 1); }}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">Weekly Planner</h1>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button 
              onClick={handlePrevWeek}
              className="p-2 hover:bg-white rounded-full transition-colors active:scale-95"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <span className="px-3 text-sm font-bold text-slate-800 min-w-[100px] text-center">
              {weekKey}
            </span>
            <button 
              onClick={handleNextWeek}
              className="p-2 hover:bg-white rounded-full transition-colors active:scale-95"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOverviewOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition-all active:scale-95"
            >
              <Sparkles size={16} />
              <span>Overview</span>
            </button>
            
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors md:hidden"
            >
              <Menu size={22} className="text-slate-700" />
            </button>

            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={handleExportHtml}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Export Report"
              >
                <Download size={20} className="text-slate-600" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-30 p-4 space-y-2 md:hidden">
            <button 
              onClick={() => { setIsOverviewOpen(true); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Sparkles size={20} className="text-blue-500" />
              <span className="font-semibold text-slate-800">Weekly Overview</span>
            </button>
            <button 
              onClick={handleExportHtml}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Download size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-800">Export Report</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-red-600"
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        )}
      </header>

      <MobileDaySelector mobileDay={mobileDay} setMobileDay={setMobileDay} getDayDate={getDayDate} />

      <div className="hidden md:flex flex-1 flex-col">
        {renderDesktopGridView()}
      </div>

      <div className="md:hidden flex-1 flex flex-col">
        {renderMobileDayView()}
      </div>

      <button
        onClick={handleNewActivityClick}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-10"
      >
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Activity" : "New Activity"}>
        {renderCategorySelect()}
        <div className="flex gap-3 mt-6">
          {editId && (
            <button 
              onClick={handleDeleteAppointment}
              className="flex-1 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button 
            onClick={handleSaveAppointment}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </Modal>

      <OverviewModal 
        isOpen={isOverviewOpen} 
        onClose={() => setIsOverviewOpen(false)}
        appointments={appointments}
        metrics={metrics}
        weekKey={weekKey}
        weeklyOverviewDoc={weeklyOverviews[weekKey]}
        onRemarksChange={(val) => handleSaveOverviewField('remarks', val)}
        onAiAnalyze={(val) => handleSaveOverviewField('aiAnalysis', val)}
      />
    </div>
  );
}

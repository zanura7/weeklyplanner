import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronLeft, ChevronRight, Save, Trash2, Sparkles, Loader2, LogOut, User, Download, Calendar, Shield, Users, Check, Ban, Clock, Search, RefreshCw } from 'lucide-react';
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

const generateOpenRouterResponse = async (prompt, systemInstruction = "") => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OpenRouter API key not configured");
    return null;
  }
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Speed Planner'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: messages
      })
    });
    
    if (!response.ok) {
      console.error("OpenRouter API Error Status:", response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter generation failed:", error);
    return null;
  }
};

// Alias for backward compatibility
const generateGeminiResponse = generateOpenRouterResponse;

const CATEGORIES = {
  INCOME: {
    id: 'income',
    label: 'Income',
    fullLabel: 'Income Generating',
    color: 'bg-emerald-200 border-emerald-400 text-emerald-900 shadow-sm hover:bg-emerald-300',
    activeColor: 'bg-emerald-200 border-emerald-400 text-emerald-900 ring-2 ring-offset-1 ring-slate-400 shadow-md',
    barColor: 'bg-emerald-500',
    activities: [
      '1. Setting New Sales Appointments',
      '2. Sales Activities',
      '3. Fact finding Interviews',
      '4. Prospecting (Build New Customer)'
    ]
  },
  SERVICING: {
    id: 'servicing',
    label: 'Servicing',
    fullLabel: 'Servicing',
    color: 'bg-amber-200 border-amber-400 text-amber-900 shadow-sm hover:bg-amber-300',
    activeColor: 'bg-amber-200 border-amber-400 text-amber-900 ring-2 ring-offset-1 ring-slate-400 shadow-md',
    barColor: 'bg-amber-500',
    activities: [
      '5. Planning',
      '6. Proposal Development',
      '7. Client Building',
      '8. Other Telephoning',
      '9. Record Keeping'
    ]
  },
  NETWORKING: {
    id: 'networking',
    label: 'Networking',
    fullLabel: 'Networking',
    color: 'bg-orange-200 border-orange-400 text-orange-900 shadow-sm hover:bg-orange-300',
    activeColor: 'bg-orange-200 border-orange-400 text-orange-900 ring-2 ring-offset-1 ring-slate-400 shadow-md',
    barColor: 'bg-orange-500',
    activities: [
      '10. Recruitment Activities',
      '11. Build COI',
      '12. Build High Value Policy'
    ]
  },
  SELF_DEV: {
    id: 'self_dev',
    label: 'Growth',
    fullLabel: 'Self Development',
    color: 'bg-blue-200 border-blue-400 text-blue-900 shadow-sm hover:bg-blue-300',
    activeColor: 'bg-blue-200 border-blue-400 text-blue-900 ring-2 ring-offset-1 ring-slate-400 shadow-md',
    barColor: 'bg-blue-500',
    activities: [
      '13. Meeting',
      '14. Self Development',
      '15. Community Contribution'
    ]
  },
  PERSONAL: {
    id: 'personal',
    label: 'Personal',
    fullLabel: 'Personal / Leisure',
    color: 'bg-rose-200 border-rose-400 text-rose-900 shadow-sm hover:bg-rose-300',
    activeColor: 'bg-rose-200 border-rose-400 text-rose-900 ring-2 ring-offset-1 ring-slate-400 shadow-md',
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
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

// Generate 30-minute time slots from 7:00 to 21:30
const TIME_SLOTS = [];
for (let h = 7; h <= 21; h++) {
  TIME_SLOTS.push({ hour: h, minute: 0, label: `${h}:00` });
  if (h < 21) {
    TIME_SLOTS.push({ hour: h, minute: 30, label: `${h}:30` });
  }
}

// Helper to convert time string to slot index
const timeToSlotIndex = (timeStr) => {
  const { hour, minute } = parseTime(timeStr);
  return TIME_SLOTS.findIndex(s => s.hour === hour && (minute < 30 ? s.minute === 0 : s.minute === 30));
};

// Helper to get slot key
const getSlotKey = (weekKey, dayIndex, slotIndex) => `${weekKey}-${dayIndex}-${slotIndex}`;

// Helper to convert hour to slot indices (for migration)
const hourToSlotIndices = (hour) => {
  const baseIndex = (hour - 7) * 2;
  return [baseIndex, baseIndex + 1]; // Returns both :00 and :30 slots
};

// Check if slot_key is old format (hourly) vs new format (slot index)
// Old format: weekKey-dayIndex-hour (e.g., 2025-W03-1-9 where 9 is hour)
// New format: weekKey-dayIndex-slotIndex (e.g., 2025-W03-1-4 where 4 is slot index for 9:00)
const isOldKeyFormat = (slotKey, hour) => {
  const parts = slotKey.split('-');
  const lastPart = parseInt(parts[parts.length - 1]);
  // If the last part equals the hour value and hour is >= 7 (valid hour range)
  // and the slot index would be different, it's old format
  const expectedSlotIndex = (hour - 7) * 2;
  return lastPart === hour && lastPart !== expectedSlotIndex && hour >= 7 && hour <= 21;
};

const Modal = ({ isOpen, onClose, title, children, showActivityReference = false, onSelectActivity, selectedCategory }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-h-[90vh] sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/10">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row overflow-hidden flex-1">
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 sm:w-1/2">
            {children}
          </div>
          {showActivityReference && (
            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 p-4 overflow-y-auto sm:w-1/2 bg-slate-50 max-h-[40vh] sm:max-h-none">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Activity Reference</h4>
              <div className="space-y-3">
                {Object.values(CATEGORIES).map(cat => (
                  <div 
                    key={cat.id} 
                    className={`rounded-xl p-2 border-2 ${cat.id === selectedCategory ? cat.activeColor : cat.color}`}
                  >
                    <h5 className="text-[10px] font-black uppercase tracking-wide mb-1.5">{cat.fullLabel}</h5>
                    <ul className="space-y-0.5">
                      {cat.activities.map((act, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => onSelectActivity && onSelectActivity(cat.id, act)}
                          className="text-[10px] font-medium leading-tight cursor-pointer hover:bg-white/50 rounded px-1 py-0.5 transition-colors"
                        >
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TimeSelectionBlock = ({ 
  formStartTime, setFormStartTime, 
  formEndTime, setFormEndTime, 
  currentDate,
  startDayIndex, setStartDayIndex,
  endDayIndex, setEndDayIndex
}) => {
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
  
  const weekDateOptions = useMemo(() => {
    const options = [];
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      options.push({
        dayIndex: i, 
        label: `${DAYS[i]} (${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
      });
    }
    return options;
  }, [currentDate]);
  
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">From Day</label>
          <select
            value={startDayIndex}
            onChange={(e) => {
              const newStart = parseInt(e.target.value);
              setStartDayIndex(newStart);
              if (newStart > endDayIndex) {
                setEndDayIndex(newStart);
              }
            }}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          >
            {weekDateOptions.map(option => (
              <option key={`start-${option.dayIndex}`} value={option.dayIndex}> 
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">To Day</label>
          <select
            value={endDayIndex}
            onChange={(e) => {
              const newEnd = parseInt(e.target.value);
              setEndDayIndex(newEnd);
              if (newEnd < startDayIndex) {
                setStartDayIndex(newEnd);
              }
            }}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800"
          >
            {weekDateOptions.map(option => (
              <option key={`end-${option.dayIndex}`} value={option.dayIndex}> 
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-200">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Start Time</label>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">End Time</label>
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

const OverviewModal = ({ isOpen, onClose, appointments, metrics, weekKey, weeklyOverviewDoc, onRemarksChange, onAiAnalyze, getDayDate }) => {
  const [remarks, setRemarks] = useState('');
  const [aiText, setAiText] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [currentWeekKey, setCurrentWeekKey] = useState(weekKey);

  useEffect(() => {
    if (weekKey !== currentWeekKey || isOpen) {
      setRemarks(weeklyOverviewDoc?.remarks || '');
      setAiText(weeklyOverviewDoc?.aiAnalysis || null);
      setAiError(null);
      setCurrentWeekKey(weekKey);
    }
  }, [weekKey, isOpen, weeklyOverviewDoc, currentWeekKey]);

  const stats = useMemo(() => {
    let catCounts = { income: 0, servicing: 0, networking: 0, self_dev: 0, personal: 0 };
    let totalHours = 0;
    let metricTotals = { O: 0, P: 0, F: 0, R: 0 };

    if (!isOpen) return { catCounts, totalHours, metricTotals };

    Object.values(appointments).forEach(appt => {
      if (appt.week === weekKey) {
        if (catCounts[appt.category] !== undefined) {
          catCounts[appt.category]++;
          totalHours++;
        }
      }
    });

    Object.entries(metrics).forEach(([key, m]) => {
      if (key.startsWith(`${weekKey}-`)) {
        metricTotals.O += m.O || 0;
        metricTotals.P += m.P || 0;
        metricTotals.F += m.F || 0;
        metricTotals.R += m.R || 0;
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
      setAiText(result);
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-slate-50 w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-md flex-shrink-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Weekly Overview</h3>
            <p className="text-sm text-slate-500 mt-1 font-semibold">Performance Summary for {weekKey}</p>
          </div>
          <button onClick={handleModalClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100">
          <div className="grid grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {['O', 'P', 'F', 'R'].map(metric => {
              const style = {
                'O': { label: 'Open', classes: 'bg-white border-pink-200 ring-2 ring-pink-50', text: 'text-pink-700' },
                'P': { label: 'Present', classes: 'bg-white border-purple-200 ring-2 ring-purple-50', text: 'text-purple-700' },
                'F': { label: 'Follow', classes: 'bg-white border-emerald-200 ring-2 ring-emerald-50', text: 'text-emerald-700' },
                'R': { label: 'Close', classes: 'bg-white border-amber-200 ring-2 ring-amber-50', text: 'text-amber-700' }
              }[metric];

              return (
                <div key={metric} className={`${style.classes} border rounded-2xl p-4 sm:p-5 text-center shadow-sm`}>
                  <div className={`text-[10px] sm:text-xs font-bold mb-2 uppercase tracking-widest ${style.text} opacity-90`}>
                    {style.label}
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black ${style.text} tracking-tight`}>{stats.metricTotals[metric]}</div>
                </div>
              )
            })}
          </div>

          <h4 className="text-xs font-bold text-slate-600 mb-4 sm:mb-5 uppercase tracking-widest pl-1">Time Distribution (Hours)</h4>
          <div className="space-y-5 sm:space-y-6 mb-8 sm:mb-10 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            {Object.values(CATEGORIES).map(cat => {
              const count = stats.catCounts[cat.id];
              const percent = getPercent(count);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-800">{cat.fullLabel}</span>
                    <span className="text-slate-500 font-semibold">{count} hrs ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full ${cat.barColor}`} 
                      style={{ width: `${percent}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Daily Activities Detail */}
          <h4 className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-widest pl-1">Daily Activities</h4>
          <div className="space-y-4 mb-8 sm:mb-10">
            {DAYS.map((day, dayIdx) => {
              const dayDate = getDayDate(dayIdx);
              const dayActivities = Object.values(appointments).filter(
                appt => appt.week === weekKey && appt.dayIndex === dayIdx
              );
              const uniqueActivities = [];
              const seenIds = new Set();
              dayActivities.forEach(appt => {
                if (!seenIds.has(appt.customId)) {
                  uniqueActivities.push(appt);
                  seenIds.add(appt.customId);
                }
              });
              uniqueActivities.sort((a, b) => a.startTime.localeCompare(b.startTime));
              
              return (
                <div key={dayIdx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-800">{day}</span>
                    <span className="text-xs text-slate-500">{dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="p-3">
                    {uniqueActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No activities</p>
                    ) : (
                      <div className="space-y-2">
                        {uniqueActivities.map((appt, idx) => {
                          const cat = Object.values(CATEGORIES).find(c => c.id === appt.category);
                          return (
                            <div key={idx} className={`flex items-start gap-3 p-2 rounded-lg ${cat?.color || 'bg-slate-100'}`}>
                              <div className="text-xs font-bold opacity-70 w-20 flex-shrink-0">
                                {appt.startTime} - {appt.endTime}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate">{appt.activityType}</div>
                                {appt.description && (
                                  <div className="text-xs opacity-70 truncate">{appt.description}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mb-8 sm:mb-10">
            <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-widest pl-1">
              Coach Comments
            </h4>
            <textarea
              value={remarks}
              onChange={handleRemarksLocalChange}
              onBlur={handleRemarksBlur}
              placeholder="Add your own personalized coaching notes..."
              className="w-full p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl text-sm min-h-[120px] sm:min-h-[140px] focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm font-medium text-slate-700 resize-none"
            />
          </div>

          <div className="bg-indigo-50/50 rounded-2xl p-5 sm:p-7 border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h4 className="text-indigo-900 font-bold text-base sm:text-lg flex items-center gap-2 tracking-tight">
                <Sparkles size={18} className="text-blue-500" />
                AI Performance Coach
              </h4>
              <div className="flex gap-2">
                {aiText && !isAnalyzing && (
                  <button 
                    onClick={() => { setAiText(null); onAiAnalyze(null); }}
                    className="text-xs bg-slate-200 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-300 transition-all font-bold flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw size={12} /> Reset
                  </button>
                )}
                {!aiText && !isAnalyzing && (
                  <button 
                    onClick={handleAiAnalyze}
                    className="text-xs bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all font-bold flex items-center gap-1 shadow-md shadow-blue-200 active:scale-95"
                  >
                    <Sparkles size={12} /> Analyze Week
                  </button>
                )}
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center gap-3 text-blue-500 text-sm py-4 justify-center">
                <Loader2 className="animate-spin" size={20} />
                <span className="font-bold">Thinking...</span>
              </div>
            )}
            
            {aiError && (
              <div className="text-sm p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
                Error: {aiError} Please try again.
              </div>
            )}

            {aiText && (
              <div 
                className="text-slate-800 bg-white p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-sm text-sm leading-relaxed font-medium"
                style={{ whiteSpace: 'pre-line' }} 
              >
                {aiText}
              </div>
            )}
            
            {!aiText && !isAnalyzing && !aiError && (
              <p className="text-sm text-indigo-600/70 text-center py-2">
                Tap "Analyze Week" to get AI insights on your performance.
              </p>
            )}
          </div>
          
          {stats.totalHours === 0 && (
            <div className="mt-8 text-center text-slate-400 text-sm font-bold">
              No activities recorded for this week yet.
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white/80 backdrop-blur-md flex justify-end flex-shrink-0">
          <button 
            onClick={handleModalClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-black transition-transform active:scale-95 shadow-lg"
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
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Password reset link sent to your email!');
        return;
      }
      
      if (isSignUp) {
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 sm:p-10 text-center rounded-b-[2rem]">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Speed Planner</h1>
          <p className="text-blue-200 text-sm">Track your activities & grow</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {isForgotPassword ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          ) : (
            <>
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                      className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                  className="w-full p-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </>
          )}

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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/30"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="flex items-center justify-center gap-4 pt-2">
            {!isForgotPassword && (
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            )}
            {!isForgotPassword && <span className="text-slate-600">|</span>}
            <button 
              type="button"
              onClick={() => { setIsForgotPassword(!isForgotPassword); setError(''); setMessage(''); }}
              className="text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors"
            >
              {isForgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MobileDaySelector = ({ mobileDay, setMobileDay, getDayDate }) => {
  return (
    <div className="flex overflow-x-auto gap-2 p-3 bg-white border-b border-slate-200 scrollbar-hide">
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

const ActivityCategoriesPanel = () => {
  return (
    <div className="bg-white border-t border-slate-200 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(CATEGORIES).map(cat => (
          <div 
            key={cat.id} 
            className={`${cat.color} rounded-xl p-3 border-2`}
          >
            <h4 className="text-xs font-black uppercase tracking-wide mb-2">{cat.fullLabel}</h4>
            <ul className="space-y-0.5">
              {cat.activities.map((act, idx) => (
                <li key={idx} className="text-[10px] font-medium leading-tight">{act}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const PendingApprovalScreen = ({ onLogout, userEmail }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md overflow-hidden text-center">
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-8 sm:p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="text-white animate-spin" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Pending Approval</h1>
          <p className="text-amber-100 text-sm">Your account is being reviewed</p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-slate-600">
            Hi! Your account <strong>{userEmail}</strong> is currently pending approval from an administrator.
          </p>
          <p className="text-slate-500 text-sm">
            You will receive an email notification once your account has been approved.
          </p>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-3 px-6 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const AccessDeniedScreen = ({ onLogout, userEmail, reason }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md overflow-hidden text-center">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 sm:p-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="text-white" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Access Denied</h1>
          <p className="text-red-100 text-sm">{reason}</p>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <p className="text-slate-600">
            Your account <strong>{userEmail}</strong> cannot access this application.
          </p>
          <p className="text-slate-500 text-sm">
            Please contact the administrator for assistance.
          </p>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-3 px-6 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ currentUser, onLogout, onBackToPlanner }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    setUpdating(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating status:', error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    }
    setUpdating(null);
  };

  const handleUpdateRole = async (userId, newRole) => {
    setUpdating(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating role:', error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setUpdating(null);
  };

  const handleUpdateExpiry = async (userId, expiryDate) => {
    setUpdating(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ expiry_date: expiryDate || null, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating expiry:', error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, expiry_date: expiryDate } : u));
    }
    setUpdating(null);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This will delete ALL user data including appointments, tasks, metrics, and weekly overviews. This action cannot be undone.`)) {
      return;
    }
    
    setUpdating(userId);
    
    try {
      // Delete user's appointments
      await supabase
        .from('appointments')
        .delete()
        .eq('user_id', userId);
      
      // Delete user's tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId);
      
      // Delete user's metrics
      await supabase
        .from('metrics')
        .delete()
        .eq('user_id', userId);
      
      // Delete user's weekly overviews
      await supabase
        .from('weekly_overviews')
        .delete()
        .eq('user_id', userId);
      
      // Finally delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        alert('Failed to delete user profile. Please try again.');
        setUpdating(null);
        return;
      }
      
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user data:', error);
      alert('Failed to delete user data. Please try again.');
    }
    
    setUpdating(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    denied: users.filter(u => u.status === 'denied').length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Manage users and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPlanner}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              <Calendar size={16} className="inline mr-2" />
              Planner
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <User size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{currentUser?.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statusCounts.all}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                <p className="text-xs text-slate-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{statusCounts.denied}</p>
                <p className="text-xs text-slate-500">Denied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by email, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'denied'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <button
                onClick={fetchUsers}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Expiry Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-slate-50 ${updating === user.id ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{user.username || '-'}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.mobile || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'approved' ? 'bg-green-100 text-green-700' :
                          user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={user.expiry_date || ''}
                          onChange={(e) => handleUpdateExpiry(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {user.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(user.id, 'approved')}
                              disabled={updating === user.id}
                              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {user.status !== 'denied' && (
                            <button
                              onClick={() => handleUpdateStatus(user.id, 'denied')}
                              disabled={updating === user.id}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Deny"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {user.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(user.id, 'pending')}
                              disabled={updating === user.id}
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-lg transition-colors"
                              title="Set Pending"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={updating === user.id}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [dailyTasks, setDailyTasks] = useState({});
  const [metrics, setMetrics] = useState({});
  const [weeklyOverviews, setWeeklyOverviews] = useState({}); 
  const [generatingDay, setGeneratingDay] = useState(null);
  const [taskGenError, setTaskGenError] = useState(null); 
  
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [endDayIndex, setEndDayIndex] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  
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
  
  const weekNumber = useMemo(() => {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }, [currentDate]);

  const isTodayInCurrentWeek = useMemo(() => {
    const today = new Date();
    return getWeekKey(today) === weekKey;
  }, [weekKey]);

  const todayDayIndex = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

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

  const fetchUserProfile = async (userId) => {
    console.log('Fetching profile for userId:', userId);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('Profile fetch result:', { data, error });
      
      if (error) {
        console.log('Profile not found or error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('Auth useEffect running...');
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange:', event, session?.user?.email);
      if (!isMounted) return;
      setUser(session?.user || null);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        console.log('Setting userProfile:', profile);
        if (isMounted) setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      console.log('Setting isLoading to false (onAuthStateChange)');
      if (isMounted) setIsLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('getSession result:', session?.user?.email);
      if (!isMounted) return;
      setUser(session?.user || null);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        console.log('Setting userProfile (getSession):', profile);
        if (isMounted) setUserProfile(profile);
      }
      console.log('Setting isLoading to false (getSession)');
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id);
      
      if (apptData) {
        const apptObj = {};
        const recordsToMigrate = [];
        const oldKeysToDelete = [];
        
        apptData.forEach(a => {
          const key = a.slot_key;
          
          // Check if this is old format (hourly key)
          if (isOldKeyFormat(key, a.hour)) {
            // Mark for migration - need to convert to slot-based keys
            recordsToMigrate.push(a);
            oldKeysToDelete.push(key);
          } else {
            // New format - use as is
            apptObj[key] = {
              category: a.category,
              activityType: a.activity_type,
              description: a.description,
              startTime: a.start_time,
              endTime: a.end_time,
              week: a.week_key,
              dayIndex: a.day_index,
              hour: a.hour,
              customId: a.custom_id,
              lastUpdated: a.updated_at
            };
          }
        });
        
        // Migrate old records if any
        if (recordsToMigrate.length > 0) {
          console.log(`Migrating ${recordsToMigrate.length} old format records...`);
          
          const newRecords = [];
          
          for (const oldRecord of recordsToMigrate) {
            // Parse start and end times to determine which slots to fill
            const startTime = oldRecord.start_time || `${oldRecord.hour}:00`;
            const endTime = oldRecord.end_time || `${oldRecord.hour + 1}:00`;
            
            const startObj = parseTime(startTime);
            const endObj = parseTime(endTime);
            
            // Calculate slot indices based on time
            const getSlotIdx = (hour, minute) => {
              const slotMinute = minute < 30 ? 0 : 30;
              return TIME_SLOTS.findIndex(s => s.hour === hour && s.minute === slotMinute);
            };
            
            let startSlotIdx = getSlotIdx(startObj.hour, startObj.minute);
            let endSlotIdx = getSlotIdx(endObj.hour, endObj.minute);
            
            // Adjust end slot - if end time is exactly on boundary, don't include that slot
            if (endObj.minute !== 0 && endObj.minute !== 30) {
              endSlotIdx++;
            }
            
            // Create new records for each slot
            for (let slotIdx = startSlotIdx; slotIdx < endSlotIdx && slotIdx < TIME_SLOTS.length; slotIdx++) {
              if (slotIdx < 0) continue;
              
              const slot = TIME_SLOTS[slotIdx];
              const newKey = `${oldRecord.week_key}-${oldRecord.day_index}-${slotIdx}`;
              
              // Add to local state
              apptObj[newKey] = {
                category: oldRecord.category,
                activityType: oldRecord.activity_type,
                description: oldRecord.description,
                startTime: oldRecord.start_time,
                endTime: oldRecord.end_time,
                week: oldRecord.week_key,
                dayIndex: oldRecord.day_index,
                hour: slot.hour,
                customId: oldRecord.custom_id,
                lastUpdated: oldRecord.updated_at
              };
              
              // Prepare for database update
              newRecords.push({
                user_id: oldRecord.user_id,
                slot_key: newKey,
                week_key: oldRecord.week_key,
                day_index: oldRecord.day_index,
                hour: slot.hour,
                category: oldRecord.category,
                activity_type: oldRecord.activity_type,
                description: oldRecord.description,
                start_time: oldRecord.start_time,
                end_time: oldRecord.end_time,
                custom_id: oldRecord.custom_id,
                updated_at: new Date().toISOString()
              });
            }
          }
          
          // Delete old records and insert new ones in database
          if (oldKeysToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('appointments')
              .delete()
              .eq('user_id', user.id)
              .in('slot_key', oldKeysToDelete);
            
            if (deleteError) {
              console.error('Error deleting old records:', deleteError);
            }
          }
          
          if (newRecords.length > 0) {
            const { error: insertError } = await supabase
              .from('appointments')
              .upsert(newRecords, { onConflict: 'user_id,slot_key' });
            
            if (insertError) {
              console.error('Error inserting migrated records:', insertError);
            } else {
              console.log(`Successfully migrated ${newRecords.length} records`);
            }
          }
        }
        
        setAppointments(apptObj);
      }

      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (taskData) {
        const taskObj = {};
        taskData.forEach(t => { taskObj[t.day_key] = t.task_list; });
        setDailyTasks(taskObj);
      }

      const { data: metricData } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id);
      
      if (metricData) {
        const metricObj = {};
        metricData.forEach(m => { 
          metricObj[m.day_key] = { 
            O: m.open_count || 0, 
            P: m.present_count || 0, 
            F: m.follow_count || 0, 
            R: m.close_count || 0,
            lastUpdated: m.updated_at
          }; 
        });
        setMetrics(metricObj);
      }

      const { data: overviewData } = await supabase
        .from('weekly_overviews')
        .select('*')
        .eq('user_id', user.id);
      
      if (overviewData) {
        const overviewObj = {};
        overviewData.forEach(o => { 
          overviewObj[o.week_key] = {
            remarks: o.remarks,
            aiAnalysis: o.ai_analysis,
            analysisGeneratedTimestamp: o.analysis_generated_at,
            lastUpdated: o.updated_at
          }; 
        });
        setWeeklyOverviews(overviewObj);
      }
    };

    loadData();

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
          const a = payload.new;
          setAppointments(prev => ({ 
            ...prev, 
            [a.slot_key]: {
              category: a.category,
              activityType: a.activity_type,
              description: a.description,
              startTime: a.start_time,
              endTime: a.end_time,
              week: a.week_key,
              dayIndex: a.day_index,
              hour: a.hour,
              customId: a.custom_id,
              lastUpdated: a.updated_at
            }
          }));
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
          const m = payload.new;
          setMetrics(prev => ({ 
            ...prev, 
            [m.day_key]: { 
              O: m.open_count || 0, 
              P: m.present_count || 0, 
              F: m.follow_count || 0, 
              R: m.close_count || 0,
              lastUpdated: m.updated_at
            } 
          }));
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
          const o = payload.new;
          setWeeklyOverviews(prev => ({ 
            ...prev, 
            [o.week_key]: {
              remarks: o.remarks,
              aiAnalysis: o.ai_analysis,
              analysisGeneratedTimestamp: o.analysis_generated_at,
              lastUpdated: o.updated_at
            }
          }));
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
    let catCounts = { income: 0, servicing: 0, networking: 0, self_dev: 0, personal: 0 };
    let totalHours = 0;
    let metricTotals = { O: 0, P: 0, F: 0, R: 0 };
    
    const uniqueAppointments = [];
    const processedIds = new Set();

    Object.values(appointments).forEach(appt => {
      if (appt.week === weekKey) {
        if (catCounts[appt.category] !== undefined) {
          catCounts[appt.category]++;
          totalHours++;
        }
        
        const listKey = `${appt.customId}-${appt.dayIndex}`;
        if (!processedIds.has(listKey)) {
          uniqueAppointments.push(appt);
          processedIds.add(listKey);
        }
      }
    });
    
    uniqueAppointments.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.startTime.localeCompare(b.startTime);
    });

    Object.entries(metrics).forEach(([key, m]) => {
      if (key.startsWith(`${weekKey}-`)) {
        metricTotals.O += m.O || 0;
        metricTotals.P += m.P || 0;
        metricTotals.F += m.F || 0;
        metricTotals.R += m.R || 0;
      }
    });

    const getPercent = (count) => totalHours > 0 ? Math.round((count / totalHours) * 100) : 0;
    
    const aiAnalysisText = weeklyOverviews[weekKey]?.aiAnalysis || "No AI analysis was generated for this week.";
    const coachRemarksText = weeklyOverviews[weekKey]?.remarks || "No personal coach remarks were added.";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coach Overview - ${currentYear} ${weekKey}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f7; padding: 40px; color: #1d1d1f; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    h1 { color: #1d1d1f; margin-bottom: 5px; letter-spacing: -0.02em; }
    .subtitle { color: #86868b; font-size: 14px; margin-bottom: 40px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .metric-card { border: 1px solid #f0f0f0; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
    .metric-label { color: #86868b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
    .metric-value { color: #1d1d1f; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
    .section-title { color: #1d1d1f; font-size: 16px; font-weight: 600; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; margin-top: 40px; }
    .bar-item { margin-bottom: 20px; }
    .bar-header { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #1d1d1f; font-weight: 500; }
    .bar-bg { background: #f5f5f7; height: 10px; border-radius: 5px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 5px; }
    .coach-box { background: #fbfbfd; border: 1px solid #f0f0f0; padding: 30px; border-radius: 16px; color: #1d1d1f; margin-top: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
    .coach-title { font-weight: 600; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em; }
    .coach-content { line-height: 1.6; white-space: pre-line; font-size: 15px; color: #424245; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    td { padding: 12px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .footer { margin-top: 50px; text-align: center; color: #86868b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weekly Performance Report</h1>
    <p class="subtitle"><strong>${user.user_metadata?.username || user.email?.split('@')[0] || 'User'}</strong> | Year: ${currentYear} | Week: ${weekKey} | Generated: ${new Date().toLocaleDateString()}</p>

    <h3 class="section-title" style="margin-top: 0;">Sales Pipeline Metrics</h3>
    <div class="metrics-grid">
      <div class="metric-card" style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1px solid #fecdd3; color: #be123c;">
        <div class="metric-label" style="color: #9f1239;">Open</div>
        <div class="metric-value">${metricTotals.O}</div>
      </div>
      <div class="metric-card" style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; color: #6d28d9;">
        <div class="metric-label" style="color: #5b21b6;">Present</div>
        <div class="metric-value">${metricTotals.P}</div>
      </div>
      <div class="metric-card" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; color: #15803d;">
        <div class="metric-label" style="color: #166534;">Follow</div>
        <div class="metric-value">${metricTotals.F}</div>
      </div>
      <div class="metric-card" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; color: #b45309;">
        <div class="metric-label" style="color: #92400e;">Close</div>
        <div class="metric-value">${metricTotals.R}</div>
      </div>
    </div>
    
    <h3 class="section-title">Detailed Schedule</h3>
    ${uniqueAppointments.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th width="15%">Day / Date</th>
          <th width="15%">Time</th>
          <th width="15%">Category</th>
          <th width="25%">Activity</th>
          <th width="30%">Details</th>
        </tr>
      </thead>
      <tbody>
        ${uniqueAppointments.map(appt => {
          const dayName = DAYS[appt.dayIndex];
          const dateStr = getDayDate(appt.dayIndex).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
          
          let badgeStyle = "background: #f3f4f6; color: #4b5563;";
          if (appt.category === 'income') badgeStyle = "background: #d1fae5; color: #065f46;";
          if (appt.category === 'supporting') badgeStyle = "background: #fef3c7; color: #92400e;";
          if (appt.category === 'self_dev') badgeStyle = "background: #dbeafe; color: #1e40af;";
          if (appt.category === 'personal') badgeStyle = "background: #ffe4e6; color: #9f1239;";

          return `
            <tr>
              <td><strong>${dayName}</strong> <span style="color:#9ca3af; font-size:11px;">${dateStr}</span></td>
              <td>${appt.startTime} - ${appt.endTime}</td>
              <td><span class="tag" style="${badgeStyle}">${CATEGORIES[appt.category.toUpperCase()]?.label || appt.category}</span></td>
              <td style="font-weight: 500;">${appt.activityType}</td>
              <td style="color: #6b7280; font-style: italic;">${appt.description || '-'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    ` : '<p style="color: #9ca3af; font-style: italic;">No activities scheduled for this week.</p>'}

    <h3 class="section-title">Time Distribution</h3>
    ${Object.values(CATEGORIES).map(cat => {
      const count = catCounts[cat.id] || 0;
      const percent = getPercent(count);
      let colorHex = '#9ca3af'; 
      if (cat.id === 'income') colorHex = '#34C759';
      if (cat.id === 'supporting') colorHex = '#FFD60A';
      if (cat.id === 'self_dev') colorHex = '#007AFF';
      if (cat.id === 'personal') colorHex = '#FF3B30';
      
      return `
        <div class="bar-item">
          <div class="bar-header">
            <strong>${cat.fullLabel}</strong>
            <span>${count} hrs (${percent}%)</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: ${percent}%; background-color: ${colorHex};"></div>
          </div>
        </div>
      `;
    }).join('')}

    <h3 class="section-title">Analysis & Feedback</h3>
    
    <div class="coach-box">
      <div class="coach-title" style="color: #FF9500;">📝 Coach Remarks</div>
      <div class="coach-content">${coachRemarksText}</div>
    </div>
    
    <div class="coach-box" style="background: #F0F8FF; border-color: #E1F0FF;">
      <div class="coach-title" style="color: #007AFF;">✨ AI Performance Coach</div>
      <div class="coach-content">${aiAnalysisText}</div>
    </div>

    <div class="footer">Generated by Speed Planner</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Coach-Report-${weekKey}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    setStartDayIndex(initialDayIndex);
    setEndDayIndex(initialDayIndex);
    setIsModalOpen(true);
  };
  
  const handleEditActivityClick = (dayIndex, slotIndex) => {
    const key = `${weekKey}-${dayIndex}-${slotIndex}`;
    const existing = appointments[key];
    
    if (existing) {
      setFormCategory(existing.category);
      setFormActivity(existing.activityType);
      setFormDescription(existing.description || '');
      setFormStartTime(existing.startTime); 
      setFormEndTime(existing.endTime);
      setEditId(existing.customId);
      
      const related = Object.values(appointments).filter(a => a.customId === existing.customId && a.week === weekKey);
      const dayIndices = related.map(a => a.dayIndex);
      setStartDayIndex(Math.min(...dayIndices));
      setEndDayIndex(Math.max(...dayIndices));
    } else {
      const slot = TIME_SLOTS[slotIndex];
      const nextSlot = TIME_SLOTS[slotIndex + 1] || { hour: 22, minute: 0 };
      setFormCategory('income');
      setFormActivity(CATEGORIES.INCOME.activities[0]);
      setFormDescription('');
      setFormStartTime(formatTime(slot.hour, slot.minute));
      setFormEndTime(formatTime(nextSlot.hour, nextSlot.minute));
      setEditId(null);
      setStartDayIndex(dayIndex);
      setEndDayIndex(dayIndex);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!user) return;
    
    const startObj = parseTime(formStartTime);
    const endObj = parseTime(formEndTime);
    
    if (endObj.hour < startObj.hour || (endObj.hour === startObj.hour && endObj.minute <= startObj.minute)) {
      alert("Error: End time must be after the start time.");
      return;
    }
    
    if (endDayIndex < startDayIndex) {
      alert("Error: End day must be after or equal to start day.");
      return;
    }
    
    const updateTime = new Date().toISOString();

    // Calculate start and end slot indices based on 30-minute slots
    const startSlotIndex = TIME_SLOTS.findIndex(s => 
      s.hour === startObj.hour && s.minute <= startObj.minute && (s.minute + 30 > startObj.minute || s.minute === 30)
    ) || TIME_SLOTS.findIndex(s => s.hour === startObj.hour && s.minute === (startObj.minute < 30 ? 0 : 30));
    
    const endSlotIndex = TIME_SLOTS.findIndex(s => 
      s.hour === endObj.hour && s.minute >= endObj.minute
    );
    
    // Better calculation for slot indices
    const getSlotIndexForTime = (hour, minute) => {
      const slotMinute = minute < 30 ? 0 : 30;
      return TIME_SLOTS.findIndex(s => s.hour === hour && s.minute === slotMinute);
    };
    
    const actualStartSlot = getSlotIndexForTime(startObj.hour, startObj.minute);
    let actualEndSlot = getSlotIndexForTime(endObj.hour, endObj.minute);
    
    console.log('Save Debug:', {
      startTime: formStartTime,
      endTime: formEndTime,
      startObj,
      endObj,
      actualStartSlot,
      actualEndSlot,
      TIME_SLOTS_length: TIME_SLOTS.length
    });
    
    // If end time is exactly on a slot boundary (like 10:00 or 10:30), we don't include that slot
    // If end time is past a boundary (like 10:15), we include that slot
    if (endObj.minute === 0 || endObj.minute === 30) {
      // Exact boundary - don't include this slot, it ends just before
    } else {
      // Past boundary - include the slot
      actualEndSlot++;
    }
    
    // Ensure valid range
    const finalStartSlot = Math.max(0, actualStartSlot);
    const finalEndSlot = Math.min(TIME_SLOTS.length, actualEndSlot);
    
    console.log('Final slots:', { finalStartSlot, finalEndSlot, willCreate: finalEndSlot - finalStartSlot });

    // Check for overlapping appointments
    for (let d = startDayIndex; d <= endDayIndex; d++) {
      for (let slotIdx = finalStartSlot; slotIdx < finalEndSlot; slotIdx++) {
        const key = `${weekKey}-${d}-${slotIdx}`;
        const existingAppt = appointments[key];
        if (existingAppt && existingAppt.customId !== editId) {
          alert('Warning: Time set is overlapped. Please adjust your time to continue.');
          return;
        }
      }
    }

    const newApptData = {
      category: formCategory,
      activityType: formActivity,
      description: formDescription,
      startTime: formStartTime,
      endTime: formEndTime,
      week: weekKey,
      lastUpdated: updateTime,
    };
    
    const customId = editId || Date.now().toString();
    
    const newAppointments = { ...appointments };

    // 1. If editing, DELETE ALL old blocks with this customId first
    if (editId) {
      const blocksToDelete = Object.keys(appointments).filter(key => appointments[key].customId === editId);
      for (const key of blocksToDelete) {
        delete newAppointments[key];
      }
      
      // Delete from database first
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('user_id', user.id)
        .eq('custom_id', editId);
      
      if (deleteError) {
        console.error("Error deleting old blocks:", deleteError);
        return;
      }
    }

    // 2. Create new blocks for ALL days in range using 30-minute slots
    const newBlocks = [];
    for (let d = startDayIndex; d <= endDayIndex; d++) {
      for (let slotIdx = finalStartSlot; slotIdx < finalEndSlot; slotIdx++) {
        const slot = TIME_SLOTS[slotIdx];
        if (!slot) continue;
        
        const key = `${weekKey}-${d}-${slotIdx}`;
        
        const blockData = {
          ...newApptData,
          dayIndex: d,
          customId: customId,
          slotIndex: slotIdx,
          hour: slot.hour,
          minute: slot.minute,
        };
        
        // Database format
        const dbBlockData = {
          user_id: user.id,
          slot_key: key,
          week_key: weekKey,
          day_index: d,
          hour: slot.hour,
          category: formCategory,
          activity_type: formActivity,
          description: formDescription,
          start_time: formStartTime,
          end_time: formEndTime,
          custom_id: customId,
          updated_at: updateTime
        };
        
        newBlocks.push(dbBlockData);
        newAppointments[key] = blockData;
      }
    }
    
    // Insert all new blocks
    const { error: insertError } = await supabase
      .from('appointments')
      .upsert(newBlocks, { onConflict: 'user_id,slot_key' });
    
    if (insertError) {
      console.error("Error saving appointments:", insertError);
      return;
    }
    
    // Update state after successful database operation
    setAppointments(newAppointments);
    setIsModalOpen(false);
  };

  const handleDeleteAppointment = async () => {
    if (!editId || !user) return;
    
    // Delete from database first
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('user_id', user.id)
      .eq('custom_id', editId);
    
    if (error) {
      console.error("Error deleting appointment:", error);
      return;
    }
    
    // Update local state after successful database deletion
    const blocksToDelete = Object.keys(appointments).filter(key => appointments[key].customId === editId);
    const newAppointments = { ...appointments };
    
    for (const key of blocksToDelete) {
      delete newAppointments[key];
    }
    
    setAppointments(newAppointments);
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
    
    const currentMetrics = metrics[key] || { O: 0, P: 0, F: 0, R: 0 };
    const newVal = Math.max(0, (currentMetrics[metric] || 0) + delta);
    const newMetricsObj = { ...currentMetrics, [metric]: newVal };
    
    const updateTime = new Date().toISOString();

    setMetrics(prev => ({ ...prev, [key]: newMetricsObj }));

    try {
      await supabase.from('metrics').upsert({
        user_id: user.id,
        day_key: key,
        week_key: weekKey,
        day_index: dayIndex,
        open_count: newMetricsObj.O || 0,
        present_count: newMetricsObj.P || 0,
        follow_count: newMetricsObj.F || 0,
        close_count: newMetricsObj.R || 0,
        updated_at: updateTime
      }, { onConflict: 'user_id,day_key' });
    } catch (e) {
      console.error("Error saving metric:", e);
    }
  };

  const renderCategorySelect = () => {
    return (
      <div className="space-y-4">
        <TimeSelectionBlock 
          currentDate={currentDate}
          startDayIndex={startDayIndex}
          setStartDayIndex={setStartDayIndex}
          endDayIndex={endDayIndex}
          setEndDayIndex={setEndDayIndex}
          formStartTime={formStartTime}
          setFormStartTime={setFormStartTime}
          formEndTime={formEndTime}
          setFormEndTime={setFormEndTime}
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
    navigate('/login');
    return null;
  }

  // Check user profile status (only if profile exists)
  if (userProfile) {
    // Check if user is denied
    if (userProfile.status === 'denied') {
      return <AccessDeniedScreen onLogout={handleLogout} userEmail={user.email} reason="Your account has been denied" />;
    }
    
    // Check if user is pending
    if (userProfile.status === 'pending') {
      return <PendingApprovalScreen onLogout={handleLogout} userEmail={user.email} />;
    }
    
    // Check if user access has expired
    if (userProfile.expiry_date) {
      const expiryDate = new Date(userProfile.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        return <AccessDeniedScreen onLogout={handleLogout} userEmail={user.email} reason="Your access has expired" />;
      }
    }
  }
  
  // Show Admin Dashboard for admin users
  if (userProfile?.role === 'admin' && showAdminDashboard) {
    return (
      <AdminDashboard 
        currentUser={user} 
        onLogout={handleLogout} 
        onBackToPlanner={() => setShowAdminDashboard(false)} 
      />
    );
  }

  const getApptData = (dayIdx, slotIndex) => {
    const key = `${weekKey}-${dayIdx}-${slotIndex}`;
    const appt = appointments[key];
    
    if (!appt) return { isSet: false, data: null, categoryData: null };
    
    const categoryData = Object.values(CATEGORIES).find(c => c.id === appt.category);
    
    const isFirstBlock = (() => {
      // Check if this is the first slot for this appointment
      if (slotIndex === 0) return true;
      
      const prevKey = `${weekKey}-${dayIdx}-${slotIndex - 1}`;
      const prevAppt = appointments[prevKey];
      
      return !prevAppt || prevAppt.customId !== appt.customId;
    })();
    
    return { isSet: true, data: appt, categoryData, isFirstBlock };
  };

  const renderMobileDayView = () => {
    const dayIdx = mobileDay;
    const dayKey = `${weekKey}-${dayIdx}`;
    const dayMetrics = metrics[dayKey] || { O: 0, P: 0, F: 0, R: 0 };

    return (
      <div className="pb-20">
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
                O: { label: 'Open', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
                P: { label: 'Present', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                F: { label: 'Follow', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                R: { label: 'Close', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
              }[metric];
              
              return (
                <div key={metric} className={`${config.bg} ${config.border} border rounded-xl p-2 text-center`}>
                  <div className={`text-[10px] font-bold ${config.text} uppercase`}>{config.label}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button 
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm active:scale-90"
                      onClick={() => handleMetricChange(dayIdx, metric, -1)}
                    >-</button>
                    <span className={`text-xl font-black ${config.text} w-8`}>{dayMetrics[metric] || 0}</span>
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
            {TIME_SLOTS.map((slot, slotIndex) => {
              const { isSet, data: appt, categoryData, isFirstBlock } = getApptData(dayIdx, slotIndex);
              
              return (
                <div 
                  key={slotIndex} 
                  onClick={() => handleEditActivityClick(dayIdx, slotIndex)}
                  className={`flex items-stretch rounded-xl overflow-hidden border transition-all active:scale-[0.99] ${
                    isSet ? `${categoryData?.color} border-current` : slot.minute === 0 ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-16 flex-shrink-0 flex items-center justify-center text-xs font-bold py-2 ${
                    isSet ? 'opacity-70' : slot.minute === 0 ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-50'
                  }`}>
                    {slot.label}
                  </div>
                  <div className="flex-1 p-2 min-h-[40px]">
                    {isSet && isFirstBlock ? (
                      <>
                        <div className="text-sm font-bold leading-tight">
                          {appt.activityType.split('.')[1]?.trim() || appt.activityType}
                        </div>
                        {appt.description && (
                          <div className="text-xs opacity-80 leading-tight">
                            {appt.description}
                          </div>
                        )}
                        <div className="text-xs opacity-70 mt-0.5">
                          {appt.startTime} - {appt.endTime}
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
      <div className="flex-1 flex flex-col p-4 pt-0">
        <div className="bg-white rounded-b-2xl shadow-lg border border-slate-200 border-t-0 flex flex-col min-w-[900px]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto">
          {/* TOP PRIORITIES Section */}
          <div className="grid grid-cols-8 border-b border-slate-300">
            <div className="p-2 bg-amber-50 text-xs font-bold text-amber-700 text-center border-r border-slate-200 flex items-center justify-center">
              TOP PRIORITIES
            </div>
            {DAYS.map((_, idx) => {
              const isToday = isTodayInCurrentWeek && idx === todayDayIndex;
              return (
                <div key={idx} className={`p-2 border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-blue-100' : 'bg-amber-50/50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Top Priorities</span>
                    <button 
                      onClick={() => handleGenerateTasks(idx)}
                      disabled={generatingDay === idx}
                      className="text-amber-600 p-1 rounded hover:bg-amber-100"
                    >
                      {generatingDay === idx ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {[0, 1, 2, 3, 4, 5].map(taskIdx => {
                      const taskKey = `${weekKey}-${idx}`;
                      const val = dailyTasks[taskKey]?.[taskIdx] || '';
                      return (
                        <input 
                          key={taskIdx}
                          type="text"
                          className="w-full text-[10px] bg-amber-100/50 border border-amber-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-400"
                          value={val}
                          onChange={(e) => handleTaskChange(idx, taskIdx, e.target.value)}
                          placeholder={`${taskIdx + 1}.`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {TIME_SLOTS.map((slot, slotIndex) => (
            <div key={slotIndex} className={`grid grid-cols-8 border-b border-slate-200 last:border-b-0 min-h-[36px] ${slot.minute === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
              <div className={`border-r border-slate-200 text-xs font-bold flex items-center justify-center ${slot.minute === 0 ? 'bg-white text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                {slot.label}
              </div>
              {DAYS.map((_, dayIdx) => {
                const { isSet, data: appt, categoryData, isFirstBlock } = getApptData(dayIdx, slotIndex);
                const isToday = isTodayInCurrentWeek && dayIdx === todayDayIndex;
                
                return (
                  <div 
                    key={dayIdx}
                    onClick={() => handleEditActivityClick(dayIdx, slotIndex)}
                    className={`border-r border-slate-200 last:border-r-0 cursor-pointer transition-colors group ${
                      isSet ? categoryData?.color : isToday ? 'bg-blue-100/80 hover:bg-blue-200' : slot.minute === 0 ? 'hover:bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    {isSet ? (
                      <div className="p-1 h-full">
                        {isFirstBlock && (
                          <>
                            <div className="text-[10px] font-bold opacity-70">{appt.startTime}-{appt.endTime}</div>
                            <div className="text-[10px] font-bold leading-tight truncate">
                              {appt.activityType.split('.')[1]?.trim() || appt.activityType}
                            </div>
                            {appt.description && (
                              <div className="text-[9px] opacity-80 leading-tight truncate">
                                {appt.description}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Plus size={12} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* METRICS Section - At Bottom after Time Grid */}
          <div className="grid grid-cols-8 border-t-2 border-slate-300 bg-slate-50">
            <div className="p-2 text-xs font-bold text-slate-700 text-center border-r border-slate-200 flex items-center justify-center bg-slate-100">
              METRICS
            </div>
            {DAYS.map((_, idx) => {
              const dayKey = `${weekKey}-${idx}`;
              const dayMetrics = metrics[dayKey] || { O: 0, P: 0, F: 0, R: 0 };
              const isToday = isTodayInCurrentWeek && idx === todayDayIndex;
              
              return (
                <div key={idx} className={`border-r border-slate-200 last:border-r-0 p-2 ${isToday ? 'bg-blue-100' : 'bg-white'}`}>
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    {/* OPEN */}
                    <div className="bg-pink-50 border border-pink-200 rounded p-1 text-center">
                      <div className="text-[8px] font-bold text-pink-600 uppercase">Open</div>
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'O', -1); }}
                        >-</button>
                        <span className="text-sm font-black text-pink-700 w-5 text-center">{dayMetrics.O || 0}</span>
                        <button 
                          className="text-slate-400 hover:text-green-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'O', 1); }}
                        >+</button>
                      </div>
                    </div>
                    {/* PRESENT */}
                    <div className="bg-purple-50 border border-purple-200 rounded p-1 text-center">
                      <div className="text-[8px] font-bold text-purple-600 uppercase">Present</div>
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'P', -1); }}
                        >-</button>
                        <span className="text-sm font-black text-purple-700 w-5 text-center">{dayMetrics.P || 0}</span>
                        <button 
                          className="text-slate-400 hover:text-green-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'P', 1); }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {/* FOLLOW */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-center">
                      <div className="text-[8px] font-bold text-emerald-600 uppercase">Follow</div>
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'F', -1); }}
                        >-</button>
                        <span className="text-sm font-black text-emerald-700 w-5 text-center">{dayMetrics.F || 0}</span>
                        <button 
                          className="text-slate-400 hover:text-green-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'F', 1); }}
                        >+</button>
                      </div>
                    </div>
                    {/* CLOSE */}
                    <div className="bg-amber-50 border border-amber-200 rounded p-1 text-center">
                      <div className="text-[8px] font-bold text-amber-600 uppercase">Close</div>
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          className="text-slate-400 hover:text-red-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'R', -1); }}
                        >-</button>
                        <span className="text-sm font-black text-amber-700 w-5 text-center">{dayMetrics.R || 0}</span>
                        <button 
                          className="text-slate-400 hover:text-green-600 text-[10px] font-bold"
                          onClick={(e) => { e.stopPropagation(); handleMetricChange(idx, 'R', 1); }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          </div>{/* End Scrollable Content */}

        </div>

        {/* Activity Categories Panel */}
        <ActivityCategoriesPanel />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 relative">
        <div className="absolute inset-0 z-0">
          {headerImage && (
            <img 
              src={headerImage} 
              alt="Background" 
              className="w-full h-full object-cover filter blur-xl scale-110 opacity-60" 
            />
          )}
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Speed Planner</h1>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3">
            <button 
              onClick={handleNewActivityClick}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all text-sm font-bold shadow-md active:scale-95"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">New Activity</span>
              <span className="inline sm:hidden">New</span>
            </button>
            
            {userProfile?.role === 'admin' && (
              <button 
                onClick={() => setShowAdminDashboard(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all text-sm font-bold shadow-md active:scale-95"
              >
                <Shield size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            
            <button 
              onClick={() => setIsOverviewOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-sky-400 text-white rounded-full hover:bg-sky-500 transition-all text-sm font-bold shadow-md active:scale-95"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Weekly Overview</span>
            </button>

            <button 
              onClick={handleExportHtml}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-black transition-all text-sm font-bold shadow-md active:scale-95"
              title="Download Report"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export</span>
            </button>
              
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-slate-300 shadow-sm">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full ring-2 ring-white" />
              ) : (
                <User size={16} className="text-slate-600" />
              )}
              <span className="text-xs font-bold max-w-[60px] sm:max-w-[80px] truncate hidden sm:inline text-slate-800">
                {user.user_metadata?.username || user.email?.split('@')[0] || "User"}
              </span>
              <button 
                onClick={handleLogout}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex justify-center sm:justify-start relative z-10">
          <div className="flex items-center bg-white/80 rounded-full p-1 border border-slate-300 shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-white rounded-full transition-all text-slate-600 hover:text-black">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <div className="px-4 sm:px-6 font-bold text-sm w-40 sm:w-48 text-center text-slate-900">
              <span className="block text-xs text-slate-500 uppercase tracking-widest mb-0.5 font-extrabold">{currentYear}. W{weekNumber}</span>
              {getDayDate(0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
              {getDayDate(6).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <button onClick={handleNextWeek} className="p-2 hover:bg-white rounded-full transition-all text-slate-600 hover:text-black">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Mobile Day Selector - Inside header for sticky */}
        <div className="md:hidden bg-white border-t border-slate-200 relative z-10">
          <MobileDaySelector mobileDay={mobileDay} setMobileDay={setMobileDay} getDayDate={getDayDate} />
        </div>

        {/* Desktop Days Header - Inside header for sticky */}
        <div className="hidden md:block bg-slate-50 border-t border-slate-200 px-4 relative z-10">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8">
              <div className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 bg-slate-50">
                TIME
              </div>
              {DAYS.map((day, idx) => {
                const isToday = isTodayInCurrentWeek && idx === todayDayIndex;
                return (
                  <div key={day} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-blue-200' : 'bg-slate-50'}`}>
                    <div className={`font-bold ${isToday ? 'text-blue-900' : 'text-slate-800'}`}>{day}</div>
                    <div className={`text-xs font-semibold ${isToday ? 'text-blue-700' : 'text-slate-500'}`}>
                      {getDayDate(idx).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile View */}
      <div className="md:hidden flex-1 overflow-y-auto">
        {renderMobileDayView()}
      </div>

      {/* Desktop View */}
      <main className="hidden md:block flex-1 overflow-auto">
        {renderDesktopGridView()}
      </main>

      <OverviewModal 
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        appointments={appointments}
        metrics={metrics}
        weekKey={weekKey}
        weeklyOverviewDoc={weeklyOverviews[weekKey]}
        onRemarksChange={(remarks) => handleSaveOverviewField('remarks', remarks)}
        onAiAnalyze={(analysis) => handleSaveOverviewField('aiAnalysis', analysis)}
        getDayDate={getDayDate}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editId ? "Edit Activity" : "New Activity"}
        showActivityReference={true}
        selectedCategory={formCategory}
        onSelectActivity={(catId, activity) => {
          setFormCategory(catId);
          setFormActivity(activity);
        }}
      >
        <div className="space-y-4">
          {renderCategorySelect()}
        </div>
        
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
          {editId && (
            <button
              onClick={handleDeleteAppointment}
              className="flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-full text-sm font-bold transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
          <button
            onClick={handleSaveAppointment}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Save size={16} />
            {editId ? "Update" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Sparkles, FileText, RefreshCw, Users, TrendingUp, Zap, Tag, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans text-slate-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600" size={24} />
            <span className="text-xl font-bold text-slate-800">SpeedPlan</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
          </nav>
          
          <Link 
            to="/register"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            Request Access
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-100 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-8">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">AI-Powered Productivity</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-800">
            <span className="italic">Your Week, Planned.</span><br />
            <span className="italic">Your Goals, Achieved.</span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            SpeedPlan combines AI coaching, smart tracking, and seamless sync to help sales professionals and team leaders conquer their week with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
            >
              Request Access
            </Link>
            <a 
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all shadow-md"
            >
              Learn More
            </a>
          </div>

          {/* App Preview/Mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative bg-white border border-slate-200 rounded-xl p-2 shadow-2xl shadow-slate-300/50">
              <div className="bg-slate-100 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-200 border-b border-slate-300">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-500">SpeedPlan</span>
                  </div>
                </div>
                <img 
                  src="/mockupapp.png" 
                  alt="Speed Planner Dashboard" 
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-800">
              Powerful Features
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">AI Coach Assist</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                SpeedPlan combines that AI coach with planners, and key report data.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-100 hover:border-cyan-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-5">
                <Tag className="text-cyan-600" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">Smart Tags</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                SpeedPlan combines smart tags, trends, data, categories a metric page.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <FileText className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">Export Report</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Export report for detailed analysis, share not information in report area.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <RefreshCw className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-slate-800">Fluid Sync Everywhere.</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Report fluid sync, everywhere, subscribe sync your devices need to to simple forms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-800">
              Built for Sales Excellence
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">For Sales Professionals</h3>
              <p className="text-slate-600 leading-relaxed">
                For Sales professionals to maximize performance, clarity for team and having shareages, compatibility and professional share areas.
              </p>
            </div>
            
            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">For Group Leaders</h3>
              <p className="text-slate-600 leading-relaxed">
                For Group Leaders to searchbar and group scenarios to help supervision about the better Leaders to the sales care executors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="text-blue-600" size={20} />
              <span className="text-lg font-bold text-slate-800">SpeedPlan</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Contact</a>
            </div>
            
            <p className="text-sm text-slate-500">
              © 2025 SpeedPlan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

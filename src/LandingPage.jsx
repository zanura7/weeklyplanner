import { Link } from 'react-router-dom';
import { Sparkles, FileText, RefreshCw, Users, Target, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">SpeedPlan</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          
          <Link 
            to="/register"
            className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-full hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg"
          >
            Request Access
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.95)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-6">
            <Sparkles size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">AI-Powered Productivity</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your Week, Planned.<br />
            <span className="text-emerald-500">Your Goals, Achieved.</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            SpeedPlan combines AI coaching, smart tracking, and seamless sync to help sales professionals and team leaders conquer their week with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              Request Access
              <ChevronRight size={18} />
            </Link>
            <a 
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Peak Performance
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to plan, track, and achieve your goals — all in one beautiful app.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Coach Assist</h3>
              <p className="text-gray-600 leading-relaxed">
                Set your daily TOP PRIORITIES with AI assist. Guide ready plans on goals. Track your OPFR to review weekly with intelligent tracking insights.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Target className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Tags</h3>
              <p className="text-gray-600 leading-relaxed">
                Instantly categorize your life with color-coded tags for effortless tracking. Organize tasks, priorities, and activities at anytime.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <FileText className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Export Report</h3>
              <p className="text-gray-600 leading-relaxed">
                Weekly review done with ease with export feature. Share comprehensive reports with your leader for effective coaching sessions.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <RefreshCw className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fluid Sync Everywhere</h3>
              <p className="text-gray-600 leading-relaxed">
                Whether you are on your phone, tablet, or desktop, SpeedPlan adapts to your screen size and keeps your schedule in perfect harmony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Sales Excellence
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Whether you're hitting targets or coaching a team, SpeedPlan has you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Benefit 1 */}
            <div className="bg-slate-700/50 p-8 rounded-2xl border border-slate-600">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-5">
                <Target className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Sales Professionals</h3>
              <p className="text-slate-300 leading-relaxed">
                Track your sales activities, prioritize high-impact tasks, and hit your targets consistently with AI-powered insights.
              </p>
            </div>
            
            {/* Benefit 2 */}
            <div className="bg-slate-700/50 p-8 rounded-2xl border border-slate-600">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-5">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Group Leaders</h3>
              <p className="text-slate-300 leading-relaxed">
                Coach your agents effectively with detailed export reports. Review weekly progress and guide your team to success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Week?
          </h2>
          <p className="text-gray-600 mb-10">
            Join sales professionals and team leaders who are already achieving more with SpeedPlan.
          </p>
          
          <Link 
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            Request Access
            <ChevronRight size={18} />
          </Link>
          
          <p className="text-sm text-gray-500 mt-6">
            Free trial available. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Target className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-gray-900">SpeedPlan</span>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2025 SpeedPlan. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

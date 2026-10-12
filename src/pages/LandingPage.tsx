import React from 'react';
import {
  Building2,
  Shield,
  GraduationCap,
  Wrench,
  CheckCircle2,
  Users2,
  Bell,
  UtensilsCrossed,
  BarChart3,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onQuickDemo: (role: 'warden' | 'student' | 'staff') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToRegister,
  onQuickDemo,
}) => {
  const featureCards = [
    {
      title: 'Smart Room Allocation',
      description: 'Automated bed allocation with real-time capacity checks, preventing duplicate allocations and over-occupancy.',
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Complaint Tracking',
      description: 'End-to-end maintenance ticketing with category tagging, priority tiers, staff dispatch, and transparent audit logs.',
      icon: Wrench,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Visitor Management',
      description: 'Pre-registered student guest passes with warden authorization, verified gate check-in, and departure timestamps.',
      icon: Users2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Digital Notice Board',
      description: 'Instant broadcast of urgent campus updates, maintenance shutdowns, mess meetings, and examination rules.',
      icon: Bell,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Mess Feedback System',
      description: 'Daily meal ratings for food taste, hygiene, and service quality with direct reporting to the dietary committee.',
      icon: UtensilsCrossed,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Hostel Analytics & Reports',
      description: 'Real-time occupancy metrics, resolution time tracking, staff productivity analysis, and one-click CSV exports.',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const workflowSteps = [
    {
      phase: 'Phase I',
      title: 'Onboarding & Access',
      desc: 'Students securely register or sign in. Role-based security restricts dashboard views tailored strictly to their access rights.',
      icon: GraduationCap,
    },
    {
      phase: 'Phase II',
      title: 'Operations & Tracking',
      desc: 'Wardens allocate beds dynamically; residents log maintenance tickets or guest requests with automatic routing.',
      icon: Layers,
    },
    {
      phase: 'Phase III',
      title: 'Resolution & Analytics',
      desc: 'Hostel staff update task logs upon resolution. Metrics continuously feed the central dashboard for transparency.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">SmartHostel</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-200 pl-2">
                Campus Residential Suite
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">User Roles</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGoToRegister}
              className="px-4.5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Institutional Hostel Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight sm:leading-none">
              Smart Hostel <span className="text-blue-600">Management Platform</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              Eliminate paperwork and streamline campus residential living. Centralized room allocation,
              real-time maintenance complaint resolution, digital visitor passes, and institutional analytics.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGoToRegister}
                className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Student Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGoToLogin}
                className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs cursor-pointer"
              >
                Sign In to Portal
              </button>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mt-12 p-4 rounded-2xl bg-white border border-slate-200 shadow-md max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Experience Instant Demo Role Portals (No Password Required):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => onQuickDemo('warden')}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Chief Warden
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-blue-700/80 mt-1">Full Admin & Allocation</p>
                </button>

                <button
                  onClick={() => onQuickDemo('student')}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      Student Resident
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-emerald-700/80 mt-1">Complaints & Visitors</p>
                </button>

                <button
                  onClick={() => onQuickDemo('staff')}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      Hostel Staff
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-amber-700/80 mt-1">Task Board & Gate Desk</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Features Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Enterprise Capabilities</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
              Designed for High-Volume Academic Residencies
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Comprehensive modules engineered to eliminate administrative bottlenecks and elevate student satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Flowchart / How It Works */}
      <section id="workflow" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">System Workflow</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
              Platform Operational Flowchart
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              End-to-end execution sequence powering hostel operations seamlessly from registration to resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {step.phase}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Benefits */}
      <section id="roles" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Role Tailored Portals</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">
              Value Delivered to Every Stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Student Residents</h3>
                  <p className="text-xs text-slate-500">Autonomous self-service portal</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant visibility of allocated hostel, floor, room number & roommate list</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Log maintenance tickets with real-time status tracker from review to completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Digital guest entry passes with instant warden authorization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>5-star feedback submissions on daily mess meals and hygiene</span>
                </li>
              </ul>
            </div>

            {/* Warden */}
            <div className="rounded-2xl border-2 border-blue-500 p-6 bg-blue-50/20 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hostel Wardens</h3>
                  <p className="text-xs text-blue-600 font-medium">Complete administrative oversight</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Interactive room allocations with automatic bed capacity safeguards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Maintenance delegation desk to assign tickets to relevant department technicians</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>One-click visitor authorization and security audit log</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Real-time occupancy charts and CSV reporting for administrative reviews</span>
                </li>
              </ul>
            </div>

            {/* Staff */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hostel Staff & Security</h3>
                  <p className="text-xs text-slate-500">Task-focused mobile interfaces</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Clear task board showing pending, in-progress, and resolved repairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Update repair work notes directly upon equipment servicing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Gate security desk for 1-click visitor check-in and check-out logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct accountability and performance metrics tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Hostel Administration Office</h2>
              <p className="mt-2 text-sm text-slate-600">
                Need assistance with room allocation, special medical accommodation, or emergency assistance? Reach out to our campus residential care team.
              </p>
              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Central Administration Block, Main Campus Residency, Sector 4</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <span>Helpline: +91 98765 43210 &bull; Security Guard Desk: Ext 404</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>hostel.administration@campus.edu</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Office Hours: Monday - Saturday, 08:30 AM to 06:30 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to explore?</h3>
              <p className="text-xs text-slate-600 mb-6">
                Log in to your respective role or register as a student resident in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onGoToRegister}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Create Student Account
                </button>
                <button
                  onClick={onGoToLogin}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Access Portal Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">Smart Hostel Management Platform</span>
          </div>
          <p>&copy; {new Date().getFullYear()} University Residential Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

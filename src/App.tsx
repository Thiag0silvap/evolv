import React, { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { Experience, Project } from "./types";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Experiences from "./components/Experiences";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Timeline from "./components/Timeline";
import Resume from "./components/Resume";
import LinkedIn from "./components/LinkedIn";
import PrdView from "./components/PrdView";
import {
  Briefcase,
  Layers,
  Award,
  FileText,
  Linkedin,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  BookOpen,
  Milestone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Auth session
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application database states
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Watch auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load experiences/projects from Supabase whenever the session changes
  useEffect(() => {
    if (!session) {
      setExperiences([]);
      setProjects([]);
      return;
    }

    (async () => {
      const [expResult, projResult] = await Promise.all([
        supabase.from("experiences").select("*").order("date", { ascending: false }),
        supabase.from("projects").select("*"),
      ]);

      if (expResult.error) alert(expResult.error.message);
      if (projResult.error) alert(projResult.error.message);

      setExperiences((expResult.data as Experience[]) || []);
      setProjects((projResult.data as Project[]) || []);
    })();
  }, [session]);

  // Operations: Experience CRUD
  const handleAddExperience = async (newExpData: Omit<Experience, "id">) => {
    if (!session) return;
    const { data, error } = await supabase
      .from("experiences")
      .insert({ ...newExpData, user_id: session.user.id })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setExperiences([data as Experience, ...experiences]);
  };

  const handleUpdateExperience = async (updatedExp: Experience) => {
    const { id, ...fields } = updatedExp;
    const { data, error } = await supabase
      .from("experiences")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setExperiences(experiences.map(e => (e.id === id ? (data as Experience) : e)));
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta experiência?")) return;
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setExperiences(experiences.filter(e => e.id !== id));
  };

  // Operations: Projects CRUD
  const handleAddProject = async (newProjData: Omit<Project, "id">) => {
    if (!session) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...newProjData, user_id: session.user.id })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setProjects([data as Project, ...projects]);
  };

  const handleUpdateProject = async (updatedProj: Project) => {
    const { id, ...fields } = updatedProj;
    const { data, error } = await supabase
      .from("projects")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setProjects(projects.map(p => (p.id === id ? (data as Project) : p)));
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este projeto?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveTab("dashboard");
  };

  // Tab definitions
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "experiences", label: "Experiências", icon: <Layers className="w-4 h-4" /> },
    { id: "projects", label: "Projetos", icon: <Briefcase className="w-4 h-4" /> },
    { id: "skills", label: "Habilidades", icon: <Award className="w-4 h-4" /> },
    { id: "timeline", label: "Linha do Tempo", icon: <Milestone className="w-4 h-4" /> },
    { id: "resume", label: "Currículo", icon: <FileText className="w-4 h-4" /> },
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" /> },
    { id: "prd", label: "Documento PRD", icon: <BookOpen className="w-4 h-4" /> },
  ];

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-xs uppercase tracking-widest font-bold">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-slate-900 border-r border-slate-850 shrink-0 p-5 sticky top-0 h-screen z-20">

        <div className="space-y-8">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">E</div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight font-sans">EVOLV <span className="text-emerald-400 font-light italic text-xs">Beta 0.1</span></span>
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Sprint 0 — Discovery</span>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              {(session.user.user_metadata?.name || session.user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider truncate leading-none">
                {session.user.user_metadata?.name || session.user.email}
              </p>
              <p className="text-[9px] text-slate-500 truncate mt-1">
                {session.user.user_metadata?.title || session.user.email}
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-950/50 to-emerald-900/10 text-emerald-400 border-l-4 border-emerald-500 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-850/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer actions inside Sidebar */}
        <div className="space-y-4 pt-5 border-t border-slate-850/80">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-950/60 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-950/40 text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>

          <div className="text-[10px] text-slate-600 text-center font-mono">
            Evolv Professional v1.0.0
          </div>
        </div>

      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-gradient-to-tr from-emerald-600 to-violet-650 text-white">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-lg font-black text-white tracking-widest font-mono">EVOLV</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[65px] left-0 right-0 bg-slate-900 border-b border-slate-850 shadow-2xl p-4 space-y-4 z-20"
          >
            <nav className="grid grid-cols-2 gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-850/50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
              <span className="text-[9px] text-slate-600 font-mono">Evolv Career v1.0.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[500px]"
          >
            {activeTab === "dashboard" && (
              <Dashboard
                experiences={experiences}
                projects={projects}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "experiences" && (
              <Experiences
                experiences={experiences}
                projects={projects}
                onAddExperience={handleAddExperience}
                onDeleteExperience={handleDeleteExperience}
                onUpdateExperience={handleUpdateExperience}
              />
            )}

            {activeTab === "projects" && (
              <Projects
                projects={projects}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === "skills" && (
              <Skills experiences={experiences} />
            )}

            {activeTab === "timeline" && (
              <Timeline experiences={experiences} />
            )}

            {activeTab === "resume" && (
              <Resume experiences={experiences} projects={projects} />
            )}

            {activeTab === "linkedin" && (
              <LinkedIn experiences={experiences} />
            )}

            {activeTab === "prd" && (
              <PrdView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

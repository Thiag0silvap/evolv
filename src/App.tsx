import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Session } from "@supabase/supabase-js";
import { Experience, Project } from "./types";
import { supabase } from "./supabaseClient";
import evolvIcon from "../assets/evolv-icon-transparent.png";
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

// Desktop sidebar resize constants. MIN matches the width the collapsed
// state already shipped with (icons + comfortable padding); DEFAULT matches
// the previous fixed expanded width; MAX gives real resizing headroom.
const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_MAX_WIDTH = 380;
const SIDEBAR_DEFAULT_WIDTH = 256;
const SIDEBAR_COLLAPSE_THRESHOLD = 130;
const SIDEBAR_WIDTH_KEY = "evolv-sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "evolv-sidebar-collapsed";

export default function App() {
  // Auth session
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop sidebar: resizable width + collapsed flag, both persisted
  // locally. `sidebarWidth` always holds the last *expanded* width —
  // collapsing never overwrites it, so double-click / drag-out restores
  // exactly where the user left it.
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
      if (!Number.isNaN(stored) && stored > 0) {
        return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, stored));
      }
    } catch {
      // localStorage unavailable — fall back to default
    }
    return SIDEBAR_DEFAULT_WIDTH;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [dragWidth, setDragWidth] = useState(sidebarWidth);
  // Tooltip is portaled to <body> and positioned via getBoundingClientRect,
  // since the nav list lives inside an overflow-y-auto container that would
  // otherwise clip an absolutely-positioned tooltip on the x-axis.
  const [hoveredNavTooltip, setHoveredNavTooltip] = useState<{ id: string; label: string; top: number; left: number } | null>(null);
  const sidebarDragStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

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

  // Persist sidebar width/collapsed state locally on every change
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {
      // ignore write failures (private browsing, quota, etc.)
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      // ignore write failures
    }
  }, [sidebarCollapsed]);

  // Drag-to-resize: listens on window only while actively dragging, so the
  // handlers don't run on every render.
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const start = sidebarDragStartRef.current;
      if (!start) return;
      const next = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, start.startWidth + (e.clientX - start.startX))
      );
      setDragWidth(next);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      sidebarDragStartRef.current = null;
      setDragWidth(current => {
        if (current <= SIDEBAR_COLLAPSE_THRESHOLD) {
          setSidebarCollapsed(true);
        } else {
          setSidebarCollapsed(false);
          setSidebarWidth(current);
        }
        return current;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startWidth = sidebarCollapsed ? SIDEBAR_MIN_WIDTH : sidebarWidth;
    sidebarDragStartRef.current = { startX: e.clientX, startWidth };
    setDragWidth(startWidth);
    setIsResizingSidebar(true);
  };

  const handleSidebarHandleDoubleClick = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Live width while dragging, otherwise the committed collapsed/expanded
  // width. `sidebarShowLabels` also drives label visibility live during a
  // drag so text doesn't stay hidden/shown out of sync with the handle.
  const sidebarRenderedWidth = isResizingSidebar
    ? dragWidth
    : sidebarCollapsed
    ? SIDEBAR_MIN_WIDTH
    : sidebarWidth;
  const sidebarShowLabels = isResizingSidebar ? dragWidth > SIDEBAR_COLLAPSE_THRESHOLD : !sidebarCollapsed;

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

  const userName = session?.user.user_metadata?.name || session?.user.email || "";
  const userTitle = session?.user.user_metadata?.title || null;

  // Tab definitions
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: "experiences", label: "Experiências", icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: "projects", label: "Projetos", icon: <Briefcase className="w-4 h-4 shrink-0" /> },
    { id: "skills", label: "Habilidades", icon: <Award className="w-4 h-4 shrink-0" /> },
    { id: "timeline", label: "Linha do Tempo", icon: <Milestone className="w-4 h-4 shrink-0" /> },
    { id: "resume", label: "Currículo", icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-4 h-4 shrink-0" /> },
    { id: "prd", label: "Documento PRD", icon: <BookOpen className="w-4 h-4 shrink-0" /> },
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
      <aside
        style={{ width: `${sidebarRenderedWidth}px` }}
        className={`hidden md:flex flex-col bg-slate-900 border border-slate-850 shrink-0 p-5 sticky top-4 ml-4 h-[calc(100vh-2rem)] rounded-2xl shadow-2xl shadow-black/30 z-20 relative ${
          isResizingSidebar ? "" : "transition-[width] duration-300 ease-out"
        }`}
      >

        {/* Resize handle — drag to resize, double-click to collapse/expand */}
        <div
          onMouseDown={handleSidebarResizeStart}
          onDoubleClick={handleSidebarHandleDoubleClick}
          title="Arraste para redimensionar · duplo clique para recolher/expandir"
          className="absolute top-0 right-0 h-full w-2 -mr-1 cursor-col-resize z-30 flex justify-center group/handle"
        >
          <div className="w-0.5 h-full bg-transparent group-hover/handle:bg-brand-blue/60 transition-colors" />
        </div>

        {/* Scrollable top area: logo, profile, nav */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-6">
          {/* Logo Brand Title — its own highlighted box, clickable to
              collapse/expand the sidebar, set apart from the rest of the
              menu by a divider below it */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              className={`w-full flex items-center ${sidebarShowLabels ? "gap-2.5 px-3" : "justify-center px-2"} py-3 rounded-xl bg-slate-850/50 border border-slate-800/60 cursor-pointer hover:opacity-80 active:scale-95 transition-all`}
            >
              <img src={evolvIcon} alt="Evolv" className="w-8 h-8 shrink-0 object-contain" />
              {sidebarShowLabels && (
                <span className="text-lg font-bold text-white tracking-tight font-sans">EVOLV</span>
              )}
            </button>
            <div className="border-t border-slate-850/60" />
          </div>

          {/* User Profile Badge — the bordered/bg wrapper only makes sense
              when it also holds the name/title text; collapsed, render the
              bare avatar circle so it doesn't look like a shape nested
              inside another shape. */}
          {sidebarShowLabels ? (
            <div className="py-3 px-3 bg-slate-850/50 border border-slate-800/60 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-cyan shrink-0">
                {(userName || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider truncate leading-none">
                  {userName}
                </p>
                <p className="text-[9px] text-slate-500 truncate mt-1">
                  {userTitle || session.user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={userName}>
              <div className="w-8 h-8 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center text-xs font-bold text-brand-cyan shrink-0">
                {(userName || "?").charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Nav List — each tab its own rounded, individually spaced pill */}
          <nav className="space-y-1.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={(e) => {
                  if (sidebarShowLabels) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNavTooltip({ id: tab.id, label: tab.label, top: rect.top + rect.height / 2, left: rect.right + 8 });
                }}
                onMouseLeave={() => setHoveredNavTooltip(null)}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  sidebarShowLabels ? "" : "justify-center"
                } ${
                  activeTab === tab.id
                    ? "bg-brand-violet/30 text-brand-cyan border-brand-violet shadow-sm"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-slate-850/50"
                }`}
              >
                {tab.icon}
                {sidebarShowLabels && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer actions inside Sidebar — always fully visible, outside the scroll area */}
        <div className="shrink-0 space-y-4 pt-5 border-t border-slate-850/80">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950/60 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-950/40 text-[10px] font-bold uppercase tracking-wider transition-all`}
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {sidebarShowLabels && <span>Sair</span>}
          </button>

          {sidebarShowLabels && (
            <div className="text-[10px] text-slate-600 text-center font-mono">
              Evolv Professional v1.0.0
            </div>
          )}
        </div>

      </aside>

      {/* Collapsed sidebar nav tooltip — portaled to <body> so it isn't
          clipped by the sidebar's overflow-y-auto nav container */}
      {hoveredNavTooltip && !sidebarShowLabels && createPortal(
        <span
          style={{ position: "fixed", top: hoveredNavTooltip.top, left: hoveredNavTooltip.left, transform: "translateY(-50%)" }}
          className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-xl z-50 pointer-events-none"
        >
          {hoveredNavTooltip.label}
        </span>,
        document.body
      )}

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-gradient-to-tr from-brand-blue to-violet-650 text-white">
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
                      ? "bg-brand-violet/40 text-brand-cyan border-l-2 border-brand-blue"
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
                userName={userName}
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
              <LinkedIn experiences={experiences} userName={userName} userTitle={userTitle} />
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

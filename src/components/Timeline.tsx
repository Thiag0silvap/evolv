import React, { useState } from "react";
import { Experience } from "../types";
import { Calendar, Compass, Milestone, Award, Code, MapPin, ChevronRight, Activity, CircleDot, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface TimelineProps {
  experiences: Experience[];
}

interface CareerMilestone {
  year: string;
  role: string;
  company: string;
  description: string;
  icon: React.ReactNode;
}

export default function Timeline({ experiences }: TimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>("Todos");

  // Key historic career milestones
  const staticMilestones: CareerMilestone[] = [
    {
      year: "2026",
      role: "Engenheiro de Software & Infraestrutura",
      company: "Projetos Corporativos e Evolv",
      description: "Liderança técnica na implantação do sistema Comissys, automações de dados críticas com Python/SQL Server e criação de arquiteturas modulares integrando IA.",
      icon: <Code className="w-4 h-4 text-violet-400" />
    },
    {
      year: "2025",
      role: "Desenvolvedor de Software Integrado",
      company: "Stik / Sistemas Web",
      description: "Desenvolvimento do Sistema de Academia e Sistema de Oficina. Migração de arquiteturas legadas para soluções robustas baseadas em Python e segurança de redes.",
      icon: <Activity className="w-4 h-4 text-emerald-400" />
    },
    {
      year: "2024",
      role: "Analista de TI & Primeiro Sistema",
      company: "Sistemas Locais e Automações",
      description: "Desenvolvimento do primeiro sistema desktop integrado. Início do foco em otimização de consultas de bancos de dados SQL Server e implantações Linux locais.",
      icon: <Milestone className="w-4 h-4 text-amber-400" />
    },
    {
      year: "2023",
      role: "Assistente de TI & Infraestrutura",
      company: "Primeiro Emprego",
      description: "Responsável pelo suporte avançado a ativos, configuração de firewalls PFSense corporativos, cabeamento, isolamento de sub-redes e rotinas iniciais de backup.",
      icon: <Compass className="w-4 h-4 text-blue-400" />
    }
  ];

  // Group experiences by year
  const getGroupedExperiences = () => {
    const grouped: { [key: string]: Experience[] } = {};
    
    experiences.forEach(exp => {
      const year = exp.date.split("-")[0];
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(exp);
    });

    return grouped;
  };

  const groupedExps = getGroupedExperiences();
  const availableYears = ["Todos", "2026", "2025", "2024", "2023"];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-850 space-y-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Milestone className="w-6 h-6 text-emerald-400" />
          Linha do Tempo Profissional
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Navegue pelas conquistas, cargos e aprendizados acumulados ao longo do tempo. Uma história profissional baseada em evidências técnicas e realizações concretas.
        </p>
      </div>

      {/* Year Selector Filters */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-center md:justify-start gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Navegar por ano:</span>
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
              selectedYear === year
                ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800 hover:text-slate-300"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 md:pl-10 space-y-12 pb-10">
        
        {/* Main Vertical Axis line */}
        <div className="absolute left-[27px] md:left-[35px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-500/80 via-violet-500/60 to-slate-800" />

        {/* Outer Loop over Years */}
        {availableYears.filter(y => y !== "Todos").map((year, yearIdx) => {
          if (selectedYear !== "Todos" && selectedYear !== year) return null;

          const yearMilestone = staticMilestones.find(m => m.year === year);
          const yearExperiences = groupedExps[year] || [];

          return (
            <div key={year} className="space-y-6 relative">
              
              {/* Year Ring Icon */}
              <div className="absolute -left-[39px] md:-left-[47px] top-0 w-8 h-8 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center z-10 shadow-lg shadow-emerald-950/50">
                <span className="text-[10px] font-extrabold text-white">{year}</span>
              </div>

              {/* Year Milestone Card */}
              {yearMilestone && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="p-5 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-emerald-500/20 shadow-md relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-900/30 text-emerald-400">
                          {yearMilestone.icon}
                        </span>
                        <h2 className="text-base font-extrabold text-white tracking-tight">{yearMilestone.role}</h2>
                      </div>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {yearMilestone.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 pt-2.5 leading-relaxed font-sans">{yearMilestone.description}</p>
                </motion.div>
              )}

              {/* Experiences of this year */}
              {yearExperiences.length > 0 && (
                <div className="pl-4 md:pl-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CircleDot className="w-3 h-3 text-violet-400 animate-ping" />
                    Realizações técnicas de {year} ({yearExperiences.length})
                  </h3>

                  <div className="space-y-4">
                    {yearExperiences.map((exp, idx) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                        className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 hover:border-slate-800 transition-all space-y-2"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{exp.date}</span>
                          <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-300 border border-slate-750 font-bold uppercase tracking-wide rounded">
                            {exp.category}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-white flex items-center gap-1 hover:text-violet-300 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
                          {exp.title}
                        </h4>
                        
                        <p className="text-xs text-slate-400 pl-4 leading-relaxed font-sans">{exp.description}</p>

                        {exp.result && (
                          <div className="ml-4 p-2.5 bg-emerald-950/15 border border-emerald-950/30 rounded-lg text-emerald-400 text-[11px] leading-relaxed">
                            <strong>Impacto Real:</strong> {exp.result}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 pl-4 pt-1">
                          {exp.technologies?.map(tech => (
                            <span key={tech} className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-950 text-slate-500 border border-slate-850 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}

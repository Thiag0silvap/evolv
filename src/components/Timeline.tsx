import React, { useState } from "react";
import { Experience } from "../types";
import { Calendar, Milestone, Award, ChevronRight, CircleDot, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface TimelineProps {
  experiences: Experience[];
}

export default function Timeline({ experiences }: TimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>("Todos");

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
  const yearsWithData = Array.from(new Set(experiences.map(exp => exp.date.split("-")[0])))
    .sort((a, b) => b.localeCompare(a));
  const availableYears = ["Todos", ...yearsWithData];

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

      {experiences.length === 0 ? (
        <div className="p-10 rounded-xl bg-slate-900/40 border border-slate-850 text-center space-y-3">
          <Milestone className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Sua linha do tempo aparece aqui conforme você registra experiências.</p>
        </div>
      ) : (
        <>
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

            {/* Outer Loop over Years that actually have experiences */}
            {yearsWithData.map((year) => {
              if (selectedYear !== "Todos" && selectedYear !== year) return null;

              const yearExperiences = groupedExps[year] || [];

              return (
                <div key={year} className="space-y-6 relative">

                  {/* Year Ring Icon */}
                  <div className="absolute -left-[39px] md:-left-[47px] top-0 w-8 h-8 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center z-10 shadow-lg shadow-emerald-950/50">
                    <span className="text-[10px] font-extrabold text-white">{year}</span>
                  </div>

                  {/* Experiences of this year */}
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

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}

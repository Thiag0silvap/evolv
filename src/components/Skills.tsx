import React, { useState } from "react";
import { Experience } from "../types";
import { Award, Zap, ChevronDown, ChevronUp, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SkillsProps {
  experiences: Experience[];
}

interface SkillStats {
  name: string;
  score: number;
  level: number;
  xpToNextLevel: number;
  percentage: number;
  category: string;
  associatedExperiences: Experience[];
  lastUsed: string;
}

export default function Skills({ experiences }: SkillsProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // Derive skills and stats dynamically from experiences
  const calculateSkills = (): SkillStats[] => {
    const skillMap: { [key: string]: { points: number; lastUsed: string; exps: Experience[] } } = {};

    // 1. Process technologies listed in experiences
    experiences.forEach(exp => {
      // Look at tech tags
      exp.technologies?.forEach(tech => {
        const normalized = tech;
        if (!skillMap[normalized]) {
          skillMap[normalized] = { points: 0, lastUsed: exp.date, exps: [] };
        }
        
        // Add points per experience log
        let pointsEarned = 15; // base XP per log
        if (exp.result && exp.result.length > 20) pointsEarned += 5; // result boost
        
        skillMap[normalized].points += pointsEarned;
        skillMap[normalized].exps.push(exp);

        // Keep last used date
        if (new Date(exp.date) > new Date(skillMap[normalized].lastUsed)) {
          skillMap[normalized].lastUsed = exp.date;
        }
      });

      // Look at derived competencies list
      exp.competencies?.forEach(comp => {
        const normalized = comp;
        if (!skillMap[normalized]) {
          skillMap[normalized] = { points: 0, lastUsed: exp.date, exps: [] };
        }
        
        let pointsEarned = 12;
        skillMap[normalized].points += pointsEarned;
        skillMap[normalized].exps.push(exp);

        if (new Date(exp.date) > new Date(skillMap[normalized].lastUsed)) {
          skillMap[normalized].lastUsed = exp.date;
        }
      });
    });

    // 2. Format into statistics array
    return Object.keys(skillMap).map(name => {
      const entry = skillMap[name];
      const points = entry.points;
      
      // Level logic: Level starts at 1, every 100 XP is a level. Progress is remainder.
      // E.g. 150 points -> Level 2, 50% progress.
      const level = Math.floor(points / 50) + 1;
      const xpInCurrentLevel = points % 50;
      const xpToNextLevel = 50 - xpInCurrentLevel;
      const percentage = Math.round((xpInCurrentLevel / 50) * 100);

      // Guess category
      let category = "Habilidade Geral";
      if (["Python", "Flutter", "HTML5", "JavaScript"].includes(name)) category = "Desenvolvimento";
      else if (["SQL Server", "SQLite", "Performance Tuning", "SQL"].includes(name)) category = "Banco de Dados";
      else if (["PFSense", "VPN", "Firewall", "Redes", "Cibersegurança"].includes(name)) category = "Segurança & Redes";
      else if (["Docker", "Linux Server", "Virtualbox", "Active Directory", "NAS Storage", "Windows Server"].includes(name)) category = "Infraestrutura";
      else if (["Automação", "Python Scripting", "OpenPyXL"].includes(name)) category = "Automação";

      return {
        name,
        score: points,
        level,
        xpToNextLevel,
        percentage,
        category,
        associatedExperiences: entry.exps,
        lastUsed: entry.lastUsed
      };
    }).sort((a, b) => b.score - a.score);
  };

  const calculatedSkills = calculateSkills();

  const toggleExpand = (skillName: string) => {
    if (expandedSkill === skillName) {
      setExpandedSkill(null);
    } else {
      setExpandedSkill(skillName);
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Desenvolvimento": return "bg-violet-950/20 text-violet-300 border-violet-900/30";
      case "Banco de Dados": return "bg-blue-950/20 text-blue-300 border-blue-900/30";
      case "Segurança & Redes": return "bg-red-950/20 text-red-300 border-red-900/30";
      case "Infraestrutura": return "bg-emerald-950/20 text-emerald-300 border-emerald-900/30";
      case "Automação": return "bg-amber-950/20 text-amber-300 border-amber-900/30";
      default: return "bg-slate-850 text-slate-300 border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 to-zinc-900 border border-slate-850 space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-400" />
          Mapa de Habilidades Orgânicas
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Sua maturidade técnica não é estática. O motor de inteligência do <strong>Evolv</strong> consolida o nível de suas competências cruzando a frequência de seus registros, a relevância das tecnologias descritas e o tempo decorrido desde o último log.
        </p>
      </div>

      {/* Grid of Skill Cards */}
      {calculatedSkills.length === 0 ? (
        <div className="p-10 rounded-xl bg-slate-900/40 border border-slate-850 text-center space-y-3">
          <Award className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Nenhuma habilidade registrada ainda.</p>
          <p className="text-xs text-slate-500">Suas competências aparecem aqui conforme você registra experiências.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {calculatedSkills.map((skill, index) => {
          const isExpanded = expandedSkill === skill.name;
          const expCount = skill.associatedExperiences.length;

          return (
            <div
              key={skill.name}
              className={`p-5 rounded-xl bg-slate-900/60 border ${
                isExpanded ? "border-violet-650 ring-1 ring-violet-900/30" : "border-slate-850"
              } transition-all flex flex-col justify-between h-max relative overflow-hidden`}
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border rounded-md ${getCategoryTheme(skill.category)}`}>
                      {skill.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-snug pt-1">{skill.name}</h3>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nível</div>
                    <div className="text-sm font-extrabold text-emerald-400">{skill.level}</div>
                  </div>
                </div>

                {/* Level Progress slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progresso do Nível</span>
                    <span className="font-semibold">{skill.percentage}% ({skill.score} XP)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Faltam {skill.xpToNextLevel} XP para nível {skill.level + 1}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ativo em: {skill.lastUsed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expander to show associated experiences */}
              <div className="mt-4 pt-3 border-t border-slate-850 flex flex-col gap-2">
                <button
                  onClick={() => toggleExpand(skill.name)}
                  className="w-full flex justify-between items-center text-xs text-slate-400 hover:text-white transition-colors py-1 focus:outline-none"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {expCount === 0 
                      ? "Histórico herdado do currículo" 
                      : `${expCount} ${expCount === 1 ? "registro associado" : "registros associados"}`
                    }
                  </span>
                  {expCount > 0 && (
                    isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* Expanded Experience logs timeline */}
                <AnimatePresence>
                  {isExpanded && expCount > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden space-y-2 mt-2 pt-2 border-t border-slate-850/50"
                    >
                      {skill.associatedExperiences.map(exp => (
                        <div key={exp.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-850/60 text-[11px] space-y-1.5">
                          <div className="flex justify-between items-center text-slate-500 text-[10px]">
                            <span className="font-semibold uppercase">{exp.date}</span>
                            <span>{exp.project}</span>
                          </div>
                          <div className="font-bold text-slate-200 line-clamp-1">{exp.title}</div>
                          <div className="text-slate-400 line-clamp-2 leading-relaxed">{exp.description}</div>
                          {exp.result && (
                            <div className="text-[10px] text-emerald-400 leading-snug font-medium border-t border-slate-850/40 pt-1 flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{exp.result}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          );
        })}
      </div>
      )}

    </div>
  );
}

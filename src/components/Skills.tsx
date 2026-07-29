import React, { useState } from "react";
import { Experience } from "../types";
import { Award, Zap, ChevronDown, ChevronUp, Clock, CheckCircle2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSkillCategories } from "../hooks/useSkillCategories";

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

type SortMode = "level" | "recent" | "alpha";

interface CategorySection {
  category: string;
  allSkills: SkillStats[];
  skills: SkillStats[];
}

function compareSkills(a: SkillStats, b: SkillStats, sortBy: SortMode): number {
  if (sortBy === "recent") return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  if (sortBy === "alpha") return a.name.localeCompare(b.name);
  return b.score - a.score;
}

function categoryNumericValue(skills: SkillStats[], sortBy: "level" | "recent"): number {
  if (sortBy === "recent") return Math.max(...skills.map(s => new Date(s.lastUsed).getTime()));
  return Math.max(...skills.map(s => s.score));
}

// Default open/closed state per category section:
// - Small skill counts (<15 total) open every section — nothing feels hidden.
// - Past that, only the section holding the single most recently active skill
//   opens automatically, so the page reads as a scannable list of categories
//   instead of a wall of cards. Manual clicks always override this once used,
//   and an active search forces every matching section open regardless.
function getDefaultExpandedCategories(skills: SkillStats[]): Set<string> {
  if (skills.length === 0) return new Set();
  if (skills.length < 15) return new Set(skills.map(s => s.category));

  const mostRecent = skills.reduce((latest, s) =>
    new Date(s.lastUsed) > new Date(latest.lastUsed) ? s : latest
  );
  return new Set([mostRecent.category]);
}

export default function Skills({ experiences }: SkillsProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>("level");
  const [searchTerm, setSearchTerm] = useState("");

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

      // Provisional keyword-based guess — used until the AI-assisted /
      // cached category resolves (see useSkillCategories below), and as a
      // fallback if that lookup ever fails.
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

  const provisionalSkills = calculateSkills();

  // AI-assisted / cached categories, keyed by skill name. Falls back
  // transparently to the keyword-based provisional category above whenever a
  // name isn't cached yet or the categorization call hasn't resolved/failed.
  const cachedCategories = useSkillCategories(provisionalSkills.map(s => s.name));
  const calculatedSkills = provisionalSkills.map(skill => ({
    ...skill,
    category: cachedCategories[skill.name] || skill.category
  }));

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() =>
    getDefaultExpandedCategories(calculatedSkills)
  );

  const toggleExpand = (skillName: string) => {
    if (expandedSkill === skillName) {
      setExpandedSkill(null);
    } else {
      setExpandedSkill(skillName);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Desenvolvimento": return "bg-violet-950/20 text-violet-300 border-violet-900/30";
      case "Banco de Dados": return "bg-blue-950/20 text-blue-300 border-blue-900/30";
      case "Segurança & Redes": return "bg-red-950/20 text-red-300 border-red-900/30";
      case "Infraestrutura": return "bg-brand-violet/20 text-brand-cyan border-brand-violet/30";
      case "Automação": return "bg-amber-950/20 text-amber-300 border-amber-900/30";
      default: return "bg-slate-850 text-slate-300 border-slate-800";
    }
  };

  // Group skills by category, then filter/sort within each group
  const isSearching = searchTerm.trim().length > 0;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const groupedByCategory = new Map<string, SkillStats[]>();
  calculatedSkills.forEach(skill => {
    const list = groupedByCategory.get(skill.category) || [];
    list.push(skill);
    groupedByCategory.set(skill.category, list);
  });

  const categorySections: CategorySection[] = Array.from(groupedByCategory.entries())
    .map(([category, allSkills]) => {
      const filtered = isSearching
        ? allSkills.filter(s => s.name.toLowerCase().includes(normalizedSearch))
        : allSkills;
      return {
        category,
        allSkills,
        skills: [...filtered].sort((a, b) => compareSkills(a, b, sortBy))
      };
    })
    .filter(section => !isSearching || section.skills.length > 0);

  categorySections.sort((a, b) => {
    if (sortBy === "alpha") return a.category.localeCompare(b.category);
    return categoryNumericValue(b.allSkills, sortBy) - categoryNumericValue(a.allSkills, sortBy);
  });

  return (
    <div className="space-y-6">
      {/* Top Description Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 to-zinc-900 border border-slate-850 space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-brand-cyan" />
          Mapa de Habilidades Orgânicas
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Sua maturidade técnica não é estática. O motor de inteligência do <strong>Evolv</strong> consolida o nível de suas competências cruzando a frequência de seus registros, a relevância das tecnologias descritas e o tempo decorrido desde o último log.
        </p>
      </div>

      {calculatedSkills.length === 0 ? (
        <div className="p-10 rounded-xl bg-slate-900/40 border border-slate-850 text-center space-y-3">
          <Award className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Nenhuma habilidade registrada ainda.</p>
          <p className="text-xs text-slate-500">Suas competências aparecem aqui conforme você registra experiências.</p>
        </div>
      ) : (
        <>
          {/* Toolbar: search + sort */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar habilidade por nome..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg pl-9 pr-3 py-2 text-slate-200 text-xs focus:outline-none transition-all placeholder-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                className="w-full md:w-auto bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
              >
                <option value="level">Nível (maior primeiro)</option>
                <option value="recent">Mais recente</option>
                <option value="alpha">Alfabética</option>
              </select>
            </div>
          </div>

          {categorySections.length === 0 ? (
            <div className="p-10 rounded-xl bg-slate-900/40 border border-slate-850 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Nenhuma habilidade encontrada para "{searchTerm.trim()}".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySections.map(section => {
                const isExpanded = isSearching || expandedCategories.has(section.category);

                return (
                  <div key={section.category} className="rounded-xl bg-slate-900/40 border border-slate-850 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(section.category)}
                      disabled={isSearching}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-900/60 transition-colors disabled:cursor-default"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border rounded-md shrink-0 ${getCategoryTheme(section.category)}`}>
                          {section.category}
                        </span>
                        <span className="text-sm font-bold text-white truncate">
                          {section.category} ({section.skills.length}{isSearching && section.skills.length !== section.allSkills.length ? ` de ${section.allSkills.length}` : ""})
                        </span>
                      </div>
                      {!isSearching && (
                        isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-5 pb-5 pt-1">
                            {section.skills.map(skill => {
                              const isCardExpanded = expandedSkill === skill.name;
                              const expCount = skill.associatedExperiences.length;

                              return (
                                <div
                                  key={skill.name}
                                  className={`p-5 rounded-xl bg-slate-900/60 border ${
                                    isCardExpanded ? "border-violet-650 ring-1 ring-violet-900/30" : "border-slate-850"
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
                                        <div className="text-sm font-extrabold text-brand-cyan">{skill.level}</div>
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
                                          className="h-full bg-gradient-to-r from-brand-blue to-teal-400 rounded-full transition-all duration-500"
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
                                        isCardExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />
                                      )}
                                    </button>

                                    {/* Expanded Experience logs timeline */}
                                    <AnimatePresence>
                                      {isCardExpanded && expCount > 0 && (
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
                                                <div className="text-[10px] text-brand-cyan leading-snug font-medium border-t border-slate-850/40 pt-1 flex items-start gap-1">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}

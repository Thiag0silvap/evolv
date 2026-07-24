import React from "react";
import { Experience, Project } from "../types";
import { 
  Briefcase,
  Layers,
  Award,
  ArrowRight,
  TrendingUp, 
  Sparkles, 
  Terminal, 
  Code, 
  Database, 
  Shield, 
  Zap 
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  experiences: Experience[];
  projects: Project[];
  userName: string;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ experiences, projects, userName, onNavigate }: DashboardProps) {
  // Calculate career statistics
  const totalExperiences = experiences.length;
  const activeProjects = projects.filter(p => p.status === "Em produção" || p.status === "Em desenvolvimento").length;
  
  // Calculate unique competencies
  const allCompetencies = Array.from(
    new Set(experiences.flatMap(e => e.competencies || []))
  );
  const totalCompetencies = allCompetencies.length;

  // Calculate Evolv Score based on experiences
  // Categories scores base calculation
  const categoryScores: { [key: string]: { points: number; count: number } } = {
    "Infraestrutura": { points: 0, count: 0 },
    "Automação": { points: 0, count: 0 },
    "Desenvolvimento": { points: 0, count: 0 },
    "Banco de Dados": { points: 0, count: 0 },
    "Segurança": { points: 0, count: 0 },
  };

  experiences.forEach(exp => {
    const cat = exp.category;
    let points = 10; // base score per experience
    // boost score based on technology diversity
    points += (exp.technologies?.length || 0) * 2;
    // boost based on result length/impact
    if (exp.result && exp.result.length > 20) {
      points += 5;
    }

    if (categoryScores[cat] !== undefined) {
      categoryScores[cat].points += points;
      categoryScores[cat].count += 1;
    } else {
      // mapping others or developmental sub-categories
      if (cat === "Outros") {
        categoryScores["Automação"].points += points * 0.5;
        categoryScores["Automação"].count += 0.5;
      }
    }
  });

  // Normalize scores between 30 and 98 for realistic visual display.
  // Categories with no real experiences yet are omitted instead of showing a fake baseline.
  const finalCategoryScores = Object.keys(categoryScores)
    .filter(name => categoryScores[name].count > 0)
    .map(name => {
      const raw = categoryScores[name];
      const score = 40 + Math.min(raw.points * 1.5, 55); // base 40 + growth
      return {
        name,
        score: Math.round(score),
        count: Math.ceil(raw.count),
        icon: getCategoryIcon(name)
      };
    }).sort((a, b) => b.score - a.score);

  function getCategoryIcon(cat: string) {
    switch (cat) {
      case "Infraestrutura": return <Terminal className="w-4 h-4 text-emerald-400" />;
      case "Automação": return <Zap className="w-4 h-4 text-amber-400" />;
      case "Desenvolvimento": return <Code className="w-4 h-4 text-violet-400" />;
      case "Banco de Dados": return <Database className="w-4 h-4 text-blue-400" />;
      case "Segurança": return <Shield className="w-4 h-4 text-red-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  }

  // Get recent logs (top 3)
  const recentExperiences = [...experiences]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-5 md:p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-850 to-zinc-900 border border-slate-850 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-650/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-600/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Olá, {userName || "bem-vindo"} 👋
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Seja bem-vindo de volta ao seu cérebro de carreira. Hoje é o momento perfeito para consolidar sua evolução profissional diária.
            </p>
          </div>
          <button 
            onClick={() => onNavigate("experiences")}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 group hover:scale-[1.02]"
          >
            <span>Registrar Experiência</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Projetos Ativos",
            value: `${activeProjects}`, 
            desc: "Registrados no Evolv", 
            icon: <Briefcase className="w-5 h-5 text-violet-400" />,
            color: "border-violet-500/10 hover:border-violet-500/30 bg-violet-950/5"
          },
          { 
            label: "Competências", 
            value: `${totalCompetencies}`, 
            desc: "Identificadas por IA", 
            icon: <Award className="w-5 h-5 text-amber-400" />,
            color: "border-amber-500/10 hover:border-amber-500/30 bg-amber-950/5"
          },
          { 
            label: "Experiências", 
            value: `${totalExperiences}`, 
            desc: "Atividades registradas", 
            icon: <Layers className="w-5 h-5 text-blue-400" />,
            color: "border-blue-500/10 hover:border-blue-500/30 bg-blue-950/5"
          }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl bg-slate-900/60 border ${stat.color} transition-all duration-300 flex flex-col justify-between h-32`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
              <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-0.5">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections: Evolv Score + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Evolv Score Bar Charts */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/60 border border-slate-850 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Evolv Score
              </h2>
              <p className="text-xs text-slate-400">Pontuação de competência baseada em logs reais</p>
            </div>
            <button 
              onClick={() => onNavigate("skills")} 
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <span>Ver Habilidades</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {finalCategoryScores.length === 0 && (
              <p className="text-xs text-slate-500 py-2">
                Registre experiências para começar a construir seu Evolv Score.
              </p>
            )}
            {finalCategoryScores.map((cat, index) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300 flex items-center gap-2">
                    {cat.icon}
                    {cat.name}
                  </span>
                  <span className="text-white font-semibold">
                    {cat.score} <span className="text-slate-500 font-normal">/ 100</span>
                  </span>
                </div>
                
                {/* Score Progress Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 1, delay: index * 0.15 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      cat.name === "Automação" ? "from-amber-500 to-yellow-400" :
                      cat.name === "Infraestrutura" ? "from-emerald-500 to-teal-400" :
                      cat.name === "Desenvolvimento" ? "from-violet-500 to-indigo-400" :
                      cat.name === "Banco de Dados" ? "from-blue-500 to-cyan-400" :
                      "from-red-500 to-orange-400"
                    }`}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{cat.count} {cat.count === 1 ? "experiência registrada" : "experiências registradas"}</span>
                  <span>Pontuação Dinâmica</span>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Suggestion Card */}
          <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Inteligência de Aplicação
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O Evolv mapeia seu score dinamicamente. Cada experiência técnica registrada gera maturidade em tópicos como <strong>Python</strong>, <strong>Firewall</strong> ou <strong>SQL Server</strong> automaticamente, sem custos redundantes de IA.
            </p>
          </div>
        </div>

        {/* Right: Recent Experiences Activity feed */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  Últimos Registros
                </h2>
                <p className="text-xs text-slate-400">Seu histórico recente de crescimento profissional</p>
              </div>
              <button 
                onClick={() => onNavigate("experiences")} 
                className="text-xs font-medium text-violet-400 hover:text-violet-350 transition-colors flex items-center gap-1"
              >
                <span>Ver Todos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {recentExperiences.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm text-slate-400">Nenhuma experiência registrada.</p>
                  <p className="text-xs text-slate-500">Comece registrando o que você fez hoje!</p>
                </div>
              ) : (
                recentExperiences.map((exp, index) => (
                  <div key={exp.id} className="relative pl-6 pb-2 last:pb-0 group">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-slate-800 group-last:bg-transparent" />
                    {/* Dot */}
                    <div className="absolute left-[3px] top-[7px] w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-violet-500 transition-colors" />

                    <div className="p-4 rounded-xl bg-slate-850/30 hover:bg-slate-850/50 border border-slate-800/60 transition-all space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{exp.date}</span>
                        <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-750">{exp.category}</span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-violet-300 transition-colors">{exp.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{exp.description}</p>
                      
                      {exp.result && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/10 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 leading-relaxed">
                          <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span><strong>Métrica de Impacto:</strong> {exp.result}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.technologies?.map(tech => (
                          <span key={tech} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Última atualização: Hoje</span>
            <span>Total de {experiences.length} conquistas acumuladas</span>
          </div>
        </div>

      </div>

      {/* Bottom: AI Insights / Quick Actions */}
      {experiences.length > 0 && (
        <div className="bg-emerald-950/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(79,70,229,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0">
               <span className="text-white text-[10px] font-bold">AI</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Evolutionary Insight</p>
              {experiences.length > 2 && (
                <p className="text-sm text-slate-200 mt-0.5">
                  Continue registrando experiências para desbloquear insights personalizados.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate("resume")}
              className="flex-1 md:flex-none px-4 py-2 border border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider"
            >
              Gerar Currículo
            </button>
            <button
              onClick={() => onNavigate("linkedin")}
              className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-shadow shadow-lg uppercase tracking-wider"
            >
              Atualizar LinkedIn
            </button>
          </div>
        </div>
      )}

      {/* Daily Reflection prompt block */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-violet-900/60 text-violet-300"><Terminal className="w-4 h-4" /></span>
            <h3 className="text-base font-bold text-white">Daily Reflection • O que você aprendeu hoje?</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Adicione uma reflexão rápida do seu dia e deixe o Evolv sugerir tecnologias, categorias e impactos automaticamente. Nunca mais esqueça o seu crescimento.
          </p>
        </div>
        <button 
          onClick={() => onNavigate("experiences")}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <span>Abrir Log Diário</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

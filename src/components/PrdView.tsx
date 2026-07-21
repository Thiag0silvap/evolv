import React, { useState } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  Compass, 
  Database,
  Rocket,
  ShieldAlert,
  Award
} from "lucide-react";
import { initialPrdText } from "../data";
import { motion } from "motion/react";

export default function PrdView() {
  const [isSigned, setIsSigned] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    vision: true,
    problem: true,
    solution: true,
    arch: true,
    score: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-zinc-900 border border-slate-850 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-xs font-semibold rounded-full w-max">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sprint 0 • Concluída</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
              Product Requirements Document (PRD)
            </h1>
            <p className="text-slate-400 text-sm">
              Documento oficial de visão de produto e requisitos de engenharia para o Evolv.
            </p>
          </div>

          <button
            onClick={() => setIsSigned(!isSigned)}
            className={`px-4 py-2 text-xs font-extrabold tracking-wider uppercase rounded-xl border transition-all ${
              isSigned 
                ? "bg-emerald-950/30 text-emerald-400 border-emerald-800" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent hover:scale-[1.02] shadow-lg shadow-emerald-950/20"
            }`}
          >
            {isSigned ? "✓ PRD Aprovado" : "Assinar & Aprovar PRD"}
          </button>
        </div>
      </div>

      {/* Notion Style Document Container */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/40 border border-slate-850 text-slate-300 space-y-8 font-sans shadow-xl">
        
        {/* Title metadata block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Autor:</span>
            <strong className="text-white">Thiago & Parceiro</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Data de Criação:</span>
            <strong className="text-white">Julho, 2026</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Status:</span>
            <strong className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Aprovado para MVP
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Arquitetura:</span>
            <strong className="text-white">Modular Monolith</strong>
          </div>
        </div>

        {/* 1. Visão Geral */}
        <div className="space-y-3">
          <button 
            onClick={() => toggleSection("vision")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              1. Visão Geral do Produto
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.vision ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.vision && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                O <strong className="text-white">Evolv</strong> é uma plataforma inteligente que ajuda desenvolvedores e analistas de tecnologia a acompanhar e documentar sua evolução de forma simplificada, contínua e orientada a dados reais.
              </p>
              <p>
                Diferente de geradores de currículos tradicionais, o Evolv é um "cérebro profissional" que consolida as experiências acumuladas diariamente. Ele analisa os logs em linguagem natural para identificar competências, mensurar impactos de faturamento e infraestrutura, e automatizar a construção de currículos personalizados.
              </p>
            </div>
          )}
        </div>

        {/* 2. O Problema */}
        <div className="space-y-3">
          <button 
            onClick={() => toggleSection("problem")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              2. O Problema
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.problem ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.problem && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                Profissionais de tecnologia realizam dezenas de tarefas essenciais todos os meses: implementações de regras de firewall PFSense, isolamento de sub-redes, configurações de VPN, modelagem de banco de dados SQL Server e automatização de faturamentos de folha.
              </p>
              <p className="border-l-2 border-red-500/40 pl-3 italic bg-red-950/5 p-2 rounded-r-lg text-slate-400">
                "No fim do ano, ao atualizar o currículo ou preparar-se para uma entrevista, o profissional esquece a maioria dos detalhes das realizações e tecnologias secundárias empregadas. Sua experiência real acaba sendo subestimada."
              </p>
            </div>
          )}
        </div>

        {/* 3. A Solução */}
        <div className="space-y-3">
          <button 
            onClick={() => toggleSection("solution")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              3. A Solução Proposta
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.solution ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.solution && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                O Evolv centraliza a carreira a partir do conceito de <strong className="text-white">Experiências</strong> (em vez de simples "atividades"), que representam amadurecimento e conquistas reais.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Daily Reflection:</strong> Induz o registro técnico humanizado por reflexão rápida ao fim do dia.</li>
                <li><strong className="text-white">Preenchimento Inteligente:</strong> A IA entra apenas para otimizar textos, extrair tags e sugerir categorizações de TI.</li>
                <li><strong className="text-white">Módulos Independentes:</strong> Dashboard, Logs, Projetos, Habilidades, Timeline, Currículo e LinkedIn.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 4. Arquitetura Modular */}
        <div className="space-y-3">
          <button 
            onClick={() => toggleSection("arch")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              4. Decisão de Arquitetura: Monólito Modular
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.arch ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.arch && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                Para simplificar o desenvolvimento e garantir isolamento, adotamos o padrão de <strong className="text-white">Monólito Modular</strong>. Cada funcionalidade reside em um módulo independente, facilitando testes e permitindo escalar para serviços distribuídos no futuro.
              </p>
              
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px] leading-relaxed">
                <div>src/modules/</div>
                <div className="pl-4">├── auth/        <span className="text-slate-500"># Identidade corporativa</span></div>
                <div className="pl-4">├── dashboard/   <span className="text-slate-500"># Bento metrics e scores</span></div>
                <div className="pl-4">├── experiences/ <span className="text-slate-500"># Logs assistidos por IA</span></div>
                <div className="pl-4">├── projects/    <span className="text-slate-500"># Cadastro de projetos corporativos</span></div>
                <div className="pl-4">├── skills/      <span className="text-slate-500"># Motor automático de score</span></div>
                <div className="pl-4">├── resume/      <span className="text-slate-500"># Compilador de currículo ATS</span></div>
                <div className="pl-4">└── linkedin/    <span className="text-slate-500"># Gerador de storytelling de rede</span></div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Evolv Score */}
        <div className="space-y-3">
          <button 
            onClick={() => toggleSection("score")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              5. O Motor Evolv Score
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.score ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.score && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                As competências nunca são declaradas manualmente pelo usuário para evitar viés opinativo. Elas nascem e escalam organicamente:
              </p>
              <p>
                Cada experiência registrada com tecnologia "Python" ou habilidade "Automação" adiciona pontos XP de maturidade. Um log com métrica de resultado de alto impacto concede multiplicadores adicionais. O sistema então compila o score global de cada setor em tempo real.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Checklist box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-emerald-400 animate-bounce" />
          Roteiro de Validação da Startup (Sprint 0)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Documento de Visão de Produto", status: true },
            { label: "Mapeamento e Levantamento de Requisitos", status: true },
            { label: "Arquitetura Modular Desenhada", status: true },
            { label: "Definição do Evolv Score Dinâmico", status: true },
            { label: "Protótipo e Design System Implementados", status: true },
            { label: "Configuração do Copiloto Gemini IA", status: true }
          ].map(task => (
            <div key={task.label} className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex items-center gap-3">
              <span className="text-emerald-400"><CheckCircle2 className="w-5 h-5" /></span>
              <span className="text-xs font-bold text-slate-300">{task.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

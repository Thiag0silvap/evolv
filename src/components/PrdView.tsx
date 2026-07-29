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
  Award,
  Boxes,
  Table2,
  LayoutGrid
} from "lucide-react";
import { motion } from "motion/react";

export default function PrdView() {
  const [isSigned, setIsSigned] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    vision: true,
    problem: true,
    solution: true,
    arch: true,
    stack: true,
    data: true,
    modules: true,
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
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-brand-cyan" />
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
                ? "bg-brand-violet/30 text-brand-cyan border-brand-violet" 
                : "bg-brand-blue hover:bg-brand-blue text-white border-transparent hover:scale-[1.02] shadow-lg shadow-brand-violet/20"
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
            <strong className="text-brand-cyan flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
              Em desenvolvimento ativo — MVP expandido
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
              <Compass className="w-5 h-5 text-brand-cyan" />
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
                <li><strong className="text-white">Módulos Independentes:</strong> Dashboard, Experiências, Projetos, Habilidades, Linha do Tempo, Currículo e LinkedIn.</li>
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
              <p>
                Na prática, isso hoje se traduz em componentes organizados por domínio em <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">src/components/</span> (Dashboard, Experiências, Projetos, Habilidades, Linha do Tempo, Currículo, LinkedIn, Auth), lógica compartilhada extraída para hooks dedicados em <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">src/hooks/</span>, e um backend unificado em <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">server.ts</span>, que expõe as rotas de IA (Gemini) e serve o próprio frontend via Vite no mesmo processo.
              </p>
            </div>
          )}
        </div>

        {/* 5. Stack Técnica */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("stack")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-brand-blue" />
              5. Stack Técnica
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.stack ? "rotate-90" : ""}`} />
          </button>

          {expandedSections.stack && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Frontend:</strong> React 19 + TypeScript, Vite 6, Tailwind CSS 4, Motion para animações e lucide-react para ícones.</li>
                <li><strong className="text-white">Backend:</strong> Express 4 num único processo Node que também serve o Vite (porta 3000 em dev e produção), expondo apenas as rotas de IA e geração de documentos — todo o CRUD de dados do usuário vai direto do frontend ao Supabase.</li>
                <li><strong className="text-white">IA:</strong> @google/genai (Gemini) para preenchimento inteligente de formulários, geração e importação de currículo, publicação para LinkedIn e categorização de habilidades.</li>
                <li><strong className="text-white">Dados & Autenticação:</strong> Supabase — Postgres com Row Level Security e Auth nativo, acessado diretamente do frontend via @supabase/supabase-js.</li>
                <li><strong className="text-white">Documentos:</strong> mammoth e pdf-parse para leitura de currículos importados (.docx/.pdf); pdfmake e docx para exportar o currículo gerado.</li>
              </ul>
              <p className="border-l-2 border-brand-blue/40 pl-3 italic bg-brand-blue/5 p-2 rounded-r-lg text-slate-400">
                O Evolv chegou a ter uma API própria em Python (FastAPI + SQLAlchemy) fazendo a ponte com o banco. Ela foi arquivada em julho de 2026 e substituída por acesso direto ao Supabase (Auth + Postgres + RLS) a partir do frontend, eliminando uma camada inteira de backend para CRUD.
              </p>
              <p className="text-white font-semibold pt-1">Infraestrutura de UI</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Rebranding visual:</strong> identidade "Evolv" aplicada ao título da aba e ao favicon do produto.</li>
                <li><strong className="text-white">Sidebar redimensionável e colapsável:</strong> arraste na borda direita entre 80px e 380px, duplo clique alterna entre colapsada e expandida, largura e estado persistidos em localStorage, tooltips dos itens de navegação exibidos via portal quando colapsada, e visual de cartão flutuante.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 6. Modelo de Dados */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("data")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Table2 className="w-5 h-5 text-emerald-400" />
              6. Modelo de Dados
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.data ? "rotate-90" : ""}`} />
          </button>

          {expandedSections.data && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                O esquema vive em <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</span>, com Row Level Security garantindo que cada usuário só leia e escreva seus próprios dados.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">profiles:</strong> id, name, title — criado automaticamente por trigger ao registrar um novo usuário no Supabase Auth.</li>
                <li><strong className="text-white">projects:</strong> name, category, status (Planejado/Em desenvolvimento/Em produção), technologies, description, origem (corporativo/pessoal).</li>
                <li><strong className="text-white">experiences:</strong> title, description, project (texto livre, opcionalmente casado por nome com um registro de projects), category, technologies, date, result, competencies.</li>
                <li><strong className="text-white">skill_categories:</strong> skill_name, category — cache por usuário da categorização de habilidades sugerida pela IA, chave única em (user_id, skill_name).</li>
              </ul>
            </div>
          )}
        </div>

        {/* 7. Funcionalidades por Módulo */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("modules")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-violet-400" />
              7. Funcionalidades por Módulo
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.modules ? "rotate-90" : ""}`} />
          </button>

          {expandedSections.modules && (
            <div className="space-y-4 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <div className="space-y-1.5">
                <p className="text-white font-semibold">Habilidades</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Categorização por IA com cache:</strong> ao abrir a tela, o hook <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">useSkillCategories</span> carrega do Supabase (tabela skill_categories) as categorias já resolvidas para o usuário e envia em lote apenas as habilidades ainda sem cache para <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">/api/gemini/categorize-skills</span>, salvando o resultado por upsert. Se a IA falhar ou ainda não tiver respondido, a tela usa como fallback uma categorização provisória por palavras-chave.</li>
                  <li><strong className="text-white">Agrupamento, ordenação e busca:</strong> habilidades organizadas em seções colapsáveis por categoria, com toolbar para ordenar por Nível, Mais recente ou Alfabética, e busca por nome que expande automaticamente as seções com resultado.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Projetos</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Origem do projeto:</strong> campo Corporativo/Pessoal definido por toggle no formulário, exibido como badge no card e disponível como filtro na listagem (Todos/Corporativo/Pessoal).</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Experiências</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Vínculo com Projeto:</strong> o campo de projeto no formulário de experiência é um select alimentado pelos projetos cadastrados (mais recentes primeiro), com opção "Nenhum projeto / outro" que volta a um campo de texto livre quando não há match. Selecionar um projeto faz merge aditivo das tecnologias do projeto nas já preenchidas (sem duplicar, case-insensitive) e copia a descrição do projeto apenas se a descrição da experiência ainda estiver vazia.</li>
                  <li><strong className="text-white">Contexto no Preenchimento Mágico:</strong> com um projeto vinculado, nome, descrição e tecnologias do projeto são enviados como contexto de fundo para a IA ao sugerir título, categoria, tecnologias, competências e resultado da experiência.</li>
                  <li><strong className="text-white">Importação de currículo:</strong> embutida nesta aba (não na aba Currículo), envia um PDF ou DOCX para <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">/api/gemini/import-resume</span> e apresenta as experiências extraídas pela IA como candidatas editáveis para revisão individual antes de salvar em lote.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Currículo</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Compilação assistida por IA:</strong> o usuário define cargo alvo e instruções customizadas, escolhe quais experiências entram via checklist, e a IA compila um currículo em Markdown através de <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">/api/gemini/resume</span>.</li>
                  <li><strong className="text-white">Exportação:</strong> a partir do currículo compilado, é possível copiar o Markdown, baixá-lo diretamente como .md no navegador, ou exportar como PDF/DOCX via <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">/api/gemini/export-resume-pdf</span> e <span className="font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-xs">/api/gemini/export-resume-docx</span>, que geram o arquivo no backend e o retornam para download.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 8. Evolv Score */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("score")}
            className="w-full flex items-center justify-between text-lg font-bold text-white border-b border-slate-800/60 pb-1.5 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              8. O Motor Evolv Score
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedSections.score ? "rotate-90" : ""}`} />
          </button>
          
          {expandedSections.score && (
            <div className="space-y-3 text-sm leading-relaxed text-slate-400 font-sans pl-1">
              <p>
                As competências nunca são declaradas manualmente pelo usuário para evitar viés opinativo. Elas nascem e escalam organicamente:
              </p>
              <p>
                Cada experiência registrada com tecnologia "Python" ou habilidade "Automação" adiciona pontos XP de maturidade. Um log com métrica de resultado de alto impacto concede alguns pontos extras de XP. O sistema então compila o score global de cada setor em tempo real.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Progress box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-cyan" />
            Fundamentos do Projeto
          </h3>
          <p className="text-xs text-slate-400">
            Estes itens marcam a base sobre a qual o Evolv foi construído. O desenvolvimento segue ativo e iterativo — novas features e integrações de IA continuam sendo adicionadas além deste baseline inicial.
          </p>
        </div>

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
              <span className="text-brand-cyan"><CheckCircle2 className="w-5 h-5" /></span>
              <span className="text-xs font-bold text-slate-300">{task.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

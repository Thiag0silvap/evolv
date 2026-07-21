import React, { useState } from "react";
import { Experience, Project } from "../types";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  CheckSquare, 
  Square, 
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResumeProps {
  experiences: Experience[];
  projects: Project[];
}

export default function Resume({ experiences, projects }: ResumeProps) {
  // Input settings
  const [targetRole, setTargetRole] = useState("Analista de TI & Automações");
  const [customInstructions, setCustomInstructions] = useState(
    "Destaque minhas capacidades de otimizar rotinas com Python, configurar segurança com PFSense e projetar soluções de banco de dados robustas."
  );
  
  // Selection checklist state
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(
    experiences.map(e => e.id)
  );

  // Output states
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Toggle selection
  const handleToggleSelectExp = (id: string) => {
    if (selectedExpIds.includes(id)) {
      setSelectedExpIds(selectedExpIds.filter(item => item !== id));
    } else {
      setSelectedExpIds([...selectedExpIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedExpIds(experiences.map(e => e.id));
  };

  const handleClearAll = () => {
    setSelectedExpIds([]);
  };

  // Compile Resume API call
  const handleCompileResume = async () => {
    if (!targetRole.trim()) {
      setError("Por favor, informe o cargo alvo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopySuccess(false);

    // Filter only selected experiences to send to Gemini
    const filteredExperiences = experiences.filter(e => selectedExpIds.includes(e.id));
    
    try {
      const response = await fetch("/api/gemini/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          customInstructions,
          experiences: filteredExperiences,
          projects: projects
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro no servidor ao compilar currículo.");
      }

      const data = await response.json();
      setGeneratedMarkdown(data.markdown || "");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "Não foi possível conectar à IA para compilar. Verifique se seu segredo GEMINI_API_KEY está ativo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper copy to clipboard
  const handleCopy = () => {
    if (!generatedMarkdown) return;
    navigator.clipboard.writeText(generatedMarkdown);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Helper download file
  const handleDownload = () => {
    if (!generatedMarkdown) return;
    const element = document.createElement("a");
    const file = new Blob([generatedMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `curriculo_${targetRole.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Configuration Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-850 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Compilador de Currículo Inteligente
            </h2>
            <p className="text-xs text-slate-400">
              Selecione quais conquistas e dados injetar no compilador de currículo da IA.
            </p>
          </div>

          <div className="space-y-4">
            {/* Cargo Alvo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Cargo Alvo / Vaga de Destino</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Ex: Engenheiro de Software Python, Analista DevOps"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Instruções para a IA (Opcional)</label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ex: Foque bastante em projetos de automação e minimize suporte operacional corporativo básico."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Selection Checklist of logged experiences */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Selecionar Conquistas ({selectedExpIds.length} de {experiences.length})
                </label>
                <div className="flex gap-2 text-[10px] font-semibold uppercase">
                  <button onClick={handleSelectAll} className="text-emerald-400 hover:text-emerald-300 transition-colors">Todos</button>
                  <span className="text-slate-700">|</span>
                  <button onClick={handleClearAll} className="text-slate-500 hover:text-slate-400 transition-colors">Nenhum</button>
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto bg-slate-950/60 border border-slate-850 rounded-xl divide-y divide-slate-850/60 p-1.5 space-y-1">
                {experiences.map(exp => {
                  const isChecked = selectedExpIds.includes(exp.id);
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => handleToggleSelectExp(exp.id)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900 flex items-start gap-2.5 transition-colors group"
                    >
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {exp.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                          <span>{exp.date}</span>
                          <span>•</span>
                          <span className="truncate">{exp.project}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <button
              onClick={handleCompileResume}
              disabled={isLoading || experiences.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/30 group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Currículo sob Medida...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform animate-pulse" />
                  <span>Compilar com Gemini IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Simulated A4 Page Preview */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Controls */}
        {generatedMarkdown && (
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-850">
            <span className="text-xs text-slate-400">Currículo formatado para impressão</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? "Copiado!" : "Copiar MD"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        )}

        {/* Paper Sheet wrapper */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-350 shadow-2xl relative min-h-[600px] text-slate-800 font-sans">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col justify-center items-center p-10 text-center space-y-4 z-10"
              >
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Analisando suas conquistas...</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    A IA está mapeando estatísticas de faturamento, regras de firewall e arquiteturas de software para consolidar o currículo perfeito.
                  </p>
                </div>
              </motion.div>
            ) : !generatedMarkdown ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center text-center py-24 space-y-4 px-6"
              >
                <FileText className="w-16 h-16 text-slate-300 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Nenhum currículo gerado ainda</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Selecione o cargo desejado no painel ao lado, confira suas realizações selecionadas e clique em <strong>Compilar com Gemini IA</strong> para ver a mágica acontecer.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="markdown-preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose prose-sm prose-slate max-w-none text-slate-900"
              >
                {/* Visual rendering of Markdown using simplified clean block formatting */}
                <div className="space-y-6 whitespace-pre-wrap text-sm leading-relaxed text-justify font-sans">
                  {generatedMarkdown}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>

    </div>
  );
}

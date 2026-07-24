import React, { useState } from "react";
import { Experience } from "../types";
import { 
  Linkedin, 
  Sparkles, 
  Copy, 
  AlertCircle, 
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  User,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LinkedInProps {
  experiences: Experience[];
  userName: string;
  userTitle?: string | null;
}

export default function LinkedIn({ experiences, userName, userTitle }: LinkedInProps) {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    experiences[0]?.id || ""
  );
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "technical" | "insightful">("professional");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGeneratePost = async () => {
    if (!selectedExpId) {
      setError("Por favor, selecione uma experiência para basear a publicação.");
      return;
    }

    const exp = experiences.find(e => e.id === selectedExpId);
    if (!exp) return;

    setIsLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      const response = await fetch("/api/gemini/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience: exp, tone })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro no servidor ao gerar publicação.");
      }

      const data = await response.json();
      setGeneratedPost(data.post || "");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "Não foi possível conectar ao Gemini. Garanta que a sua GEMINI_API_KEY esteja ativa nas Secrets."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Post Settings Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-400" />
              Copiloto LinkedIn
            </h2>
            <p className="text-xs text-slate-400">
              Converta suas realizações técnicas reais em publicações profissionais de alto alcance.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Experience Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Selecione uma Conquista</label>
              <select
                value={selectedExpId}
                onChange={(e) => setSelectedExpId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
              >
                <option value="" disabled>Escolha um log do seu histórico...</option>
                {experiences.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    [{exp.category}] {exp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone selector chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Tom da Publicação</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "professional", label: "Profissional", desc: "Sério e focado em resultados" },
                  { id: "enthusiastic", label: "Entusiasmado", desc: "Energético e motivador" },
                  { id: "technical", label: "Técnico", desc: "Focado na pilha tecnológica" },
                  { id: "insightful", label: "Reflexivo", desc: "Aprendizado e lições" }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as any)}
                    className={`p-2.5 border rounded-lg text-left transition-all ${
                      tone === t.id
                        ? "bg-blue-950/20 text-blue-400 border-blue-800"
                        : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[9px] text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleGeneratePost}
              disabled={isLoading || !selectedExpId}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/30 group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Construindo Storytelling...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform animate-pulse" />
                  <span>Gerar Post com Gemini IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Simulated LinkedIn Card */}
      <div className="lg:col-span-7 space-y-4">
        
        {generatedPost && (
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-850">
            <span className="text-xs text-slate-400">Pronto para copiar e publicar!</span>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 bg-blue-900/35 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copySuccess ? "Copiado para Área de Transferência!" : "Copiar Texto"}</span>
            </button>
          </div>
        )}

        {/* LinkedIn Post Card Preview */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-850 overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-850 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white flex items-center gap-1">
                <span>{userName}</span>
                <span className="text-[10px] bg-blue-950/50 text-blue-400 border border-blue-900/20 px-1 rounded">1º</span>
              </div>
              {userTitle && (
                <div className="text-[10px] text-slate-400 truncate">{userTitle}</div>
              )}
              <div className="text-[9px] text-slate-500">Agora mesmo • editado</div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 md:p-5 relative min-h-[220px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 flex flex-col justify-center items-center text-center p-10 space-y-3 z-10"
                >
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-sm font-bold text-white">Refinando texto e hashtags...</h3>
                  <p className="text-xs text-slate-400 max-w-xs">Estruturando gancho de atenção para atrair recrutadores.</p>
                </motion.div>
              ) : !generatedPost ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center space-y-4 px-6"
                >
                  <Linkedin className="w-12 h-12 text-slate-700 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Nenhum post gerado ainda.</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Escolha uma de suas conquistas listadas e clique em <strong>Gerar Post com Gemini IA</strong>.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans"
                >
                  {generatedPost}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Metrics (Simulated) */}
          {generatedPost && (
            <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-850/60 flex justify-between items-center text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <span className="p-0.5 rounded-full bg-blue-600 text-white flex items-center justify-center"><ThumbsUp className="w-2.5 h-2.5" /></span>
                <span className="p-0.5 rounded-full bg-red-500 text-white flex items-center justify-center"><Heart className="w-2.5 h-2.5" /></span>
                <span>Você e outras 42 pessoas</span>
              </div>
              <div>6 comentários • 2 compartilhamentos</div>
            </div>
          )}

          {/* Actions Bar (Simulated) */}
          <div className="p-2 bg-slate-900/40 border-t border-slate-850/60 grid grid-cols-4 gap-1 text-slate-400 text-xs font-semibold">
            <button className="py-2.5 rounded hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 focus:outline-none">
              <ThumbsUp className="w-4 h-4 text-slate-500" />
              <span>Gostei</span>
            </button>
            <button className="py-2.5 rounded hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 focus:outline-none">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Comentar</span>
            </button>
            <button className="py-2.5 rounded hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 focus:outline-none">
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Compartilhar</span>
            </button>
            <button className="py-2.5 rounded hover:bg-slate-850 transition-colors flex items-center justify-center gap-1.5 focus:outline-none">
              <Send className="w-4 h-4 text-slate-500" />
              <span>Enviar</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { Experience, CategoryType } from "../types";
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2, X, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImportResumeProps {
  onAddExperience: (exp: Omit<Experience, "id">) => void;
}

const CATEGORIES: CategoryType[] = [
  "Automação",
  "Infraestrutura",
  "Desenvolvimento",
  "Banco de Dados",
  "Segurança",
  "Gestão/Agile",
  "Outros",
];

type CandidateExperience = Omit<Experience, "id"> & { _tempId: string };

export default function ImportResume({ onAddExperience }: ImportResumeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateExperience[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Selecione um arquivo PDF ou DOCX primeiro.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setCandidates(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/gemini/import-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao importar o currículo.");
      }

      const data = await response.json();
      const withIds: CandidateExperience[] = (data.experiences || []).map((exp: Omit<Experience, "id">) => ({
        ...exp,
        _tempId: crypto.randomUUID(),
      }));
      setCandidates(withIds);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
        "Não foi possível importar o currículo. Verifique se o Gemini está disponível."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCandidateChange = (tempId: string, field: keyof Omit<Experience, "id">, value: any) => {
    setCandidates((prev) => (prev || []).map((c) => (c._tempId === tempId ? { ...c, [field]: value } : c)));
  };

  const handleDiscardCandidate = (tempId: string) => {
    setCandidates((prev) => (prev || []).filter((c) => c._tempId !== tempId));
  };

  const handleSaveAll = () => {
    if (!candidates || candidates.length === 0) return;
    candidates.forEach(({ _tempId, ...exp }) => onAddExperience(exp));
    setCandidates(null);
    setFile(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-cyan" />
          Importar Currículo Existente
        </h2>
        <p className="text-xs text-slate-400">
          Envie um PDF ou DOCX e a IA vai sugerir experiências estruturadas para você revisar antes de salvar.
        </p>
      </div>

      {!candidates && (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-800 hover:border-brand-blue rounded-xl p-6 cursor-pointer transition-colors">
            <FileText className="w-8 h-8 text-slate-600" />
            <span className="text-xs text-slate-400 text-center">
              {file ? file.name : "Clique para selecionar um arquivo .pdf ou .docx"}
            </span>
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
          </label>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="w-full py-3 bg-brand-blue hover:bg-brand-blue disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando currículo com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                <span>Importar e Analisar com IA</span>
              </>
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {candidates && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300">
                {candidates.length} experiência(s) encontrada(s) — revise antes de salvar
              </span>
              <button
                onClick={() => {
                  setCandidates(null);
                  setFile(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
              {candidates.map((cand) => (
                <div key={cand._tempId} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <input
                      type="text"
                      value={cand.title}
                      onChange={(e) => handleCandidateChange(cand._tempId, "title", e.target.value)}
                      className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-brand-blue"
                    />
                    <button
                      onClick={() => handleDiscardCandidate(cand._tempId)}
                      className="p-1.5 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 rounded-md border border-slate-750 transition-colors shrink-0"
                      title="Descartar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    value={cand.description}
                    onChange={(e) => handleCandidateChange(cand._tempId, "description", e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-blue"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={cand.category}
                      onChange={(e) => handleCandidateChange(cand._tempId, "category", e.target.value as CategoryType)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-brand-blue"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={cand.date}
                      onChange={(e) => handleCandidateChange(cand._tempId, "date", e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-brand-blue"
                    />
                    <input
                      type="text"
                      value={cand.project}
                      onChange={(e) => handleCandidateChange(cand._tempId, "project", e.target.value)}
                      placeholder="Projeto"
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  {cand.technologies && cand.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {cand.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-850"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAll}
              disabled={candidates.length === 0}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e Salvar {candidates.length} Experiência(s)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

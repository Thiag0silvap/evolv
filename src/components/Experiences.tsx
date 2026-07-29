import React, { useState } from "react";
import { Experience, Project, CategoryType } from "../types";
import ImportResume from "./ImportResume";
import { 
  Sparkles, 
  Trash2, 
  Save, 
  Search, 
  Plus, 
  Filter, 
  Tag, 
  Calendar, 
  CheckCircle, 
  BrainCircuit, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  X,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExperiencesProps {
  experiences: Experience[];
  projects: Project[];
  onAddExperience: (exp: Omit<Experience, "id">) => void;
  onDeleteExperience: (id: string) => void;
  onUpdateExperience: (exp: Experience) => void;
}

const CATEGORIES: CategoryType[] = [
  "Automação",
  "Infraestrutura",
  "Desenvolvimento",
  "Banco de Dados",
  "Segurança",
  "Gestão/Agile",
  "Outros"
];

const CUSTOM_PROJECT_OPTION = "__custom__";

export default function Experiences({ 
  experiences, 
  projects, 
  onAddExperience, 
  onDeleteExperience, 
  onUpdateExperience 
}: ExperiencesProps) {
  // Form State
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryType>("Desenvolvimento");
  const [project, setProject] = useState("");
  const [showCustomProjectInput, setShowCustomProjectInput] = useState(true);
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [competencyInput, setCompetencyInput] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Projects available for linking, most recently created first
  const sortedProjects = [...projects].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  // UI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Todas");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI assistant integration
  const handleAiSuggest = async () => {
    if (!description.trim()) {
      setAiError("Por favor, digite uma descrição curta de sua atividade primeiro.");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ocorreu um erro no servidor ao processar a IA.");
      }

      const data = await response.json();

      // Set suggested values with fancy visual impact
      setTitle(data.title || "");
      if (CATEGORIES.includes(data.category)) {
        setCategory(data.category as CategoryType);
      } else {
        setCategory("Outros");
      }
      const suggestedProject = data.project || "";
      const matchedProject = projects.find(p => p.name === suggestedProject);
      if (matchedProject) {
        setProject(matchedProject.name);
        setShowCustomProjectInput(false);
      } else {
        setProject(suggestedProject);
        setShowCustomProjectInput(true);
      }
      setTechnologies(data.technologies || []);
      setResult(data.result || "");
      setCompetencies(data.competencies || []);
      
      setIsFormExpanded(true);
    } catch (err: any) {
      console.error(err);
      setAiError(
        err.message || 
        "Não foi possível conectar ao Gemini. Verifique se o GEMINI_API_KEY está configurado em Secrets ou preencha manualmente."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const handleAddCompetency = () => {
    if (competencyInput.trim() && !competencies.includes(competencyInput.trim())) {
      setCompetencies([...competencies, competencyInput.trim()]);
      setCompetencyInput("");
    }
  };

  const handleRemoveCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setDescription("");
    setTitle("");
    setCategory("Desenvolvimento");
    setProject("");
    setShowCustomProjectInput(true);
    setTechInput("");
    setTechnologies([]);
    setResult("");
    setCompetencies([]);
    setCompetencyInput("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsFormExpanded(false);
    setEditingId(null);
    setAiError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Título e Descrição são obrigatórios.");
      return;
    }

    const expData = {
      title: title.trim(),
      description: description.trim(),
      project: project.trim() || "Geral / Pessoal",
      category,
      technologies,
      date,
      result: result.trim(),
      competencies
    };

    if (editingId) {
      onUpdateExperience({ id: editingId, ...expData });
    } else {
      onAddExperience(expData);
    }

    resetForm();
  };

  const handleEditClick = (exp: Experience) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setDescription(exp.description);
    const matchedProject = projects.find(p => p.name === exp.project);
    if (matchedProject) {
      setProject(matchedProject.name);
      setShowCustomProjectInput(false);
    } else {
      setProject(exp.project);
      setShowCustomProjectInput(true);
    }
    setCategory(exp.category);
    setTechnologies(exp.technologies || []);
    setResult(exp.result || "");
    setCompetencies(exp.competencies || []);
    setDate(exp.date);
    setIsFormExpanded(true);
    
    // Scroll to form nicely
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtering list
  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.technologies && exp.technologies.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      exp.project.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategoryFilter === "Todas" || 
      exp.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Log Daily Experience Form */}
      <div className="xl:col-span-5 space-y-6">
        <ImportResume onAddExperience={onAddExperience} />

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-brand-cyan" />
                {editingId ? "Editar Registro" : "Reflexão Diária"}
              </h2>
              <p className="text-xs text-slate-400">
                {editingId ? "Atualize as informações do seu log profissional." : "O que você aprendeu, otimizou ou resolveu hoje?"}
              </p>
            </div>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Raw Input Textarea (Prompt format) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Conte sua experiência em poucas palavras:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Criei um script em Python que consulta o SQL Server, extrai dados de faturamento e gera automaticamente uma planilha usando OpenPyXL para o setor financeiro."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-colors leading-relaxed"
              />
              
              {!editingId && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-500">Escreva em linguagem natural</span>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    className="px-3.5 py-1.5 bg-violet-900/40 hover:bg-violet-900/60 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-800 border border-violet-800/40 text-violet-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md group shrink-0"
                  >
                    {isAiLoading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></span>
                        <span>Analisando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                        <span>Preenchimento Mágico (IA)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {aiError && (
              <div className="p-3 bg-red-950/20 border border-red-900/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Expander Trigger */}
            {!isFormExpanded && !editingId && (
              <button
                type="button"
                onClick={() => setIsFormExpanded(true)}
                className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Preencher Detalhes Manualmente</span>
              </button>
            )}

            {/* Rest of the form, animated */}
            <AnimatePresence>
              {(isFormExpanded || editingId) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden pt-2 border-t border-slate-850"
                >
                  {/* Title field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Título da Experiência</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Automação de Relatório Financeiro"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  {/* Date and Category Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Data</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Categoria</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryType)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project link */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Projeto Corporativo / Contexto</label>
                    <select
                      value={showCustomProjectInput ? CUSTOM_PROJECT_OPTION : project}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === CUSTOM_PROJECT_OPTION) {
                          setShowCustomProjectInput(true);
                          setProject("");
                        } else {
                          setShowCustomProjectInput(false);
                          setProject(val);

                          const selectedProject = projects.find(p => p.name === val);
                          if (selectedProject?.technologies && selectedProject.technologies.length > 0) {
                            setTechnologies(prev => {
                              const existingLower = new Set(prev.map(t => t.toLowerCase()));
                              const toAdd = selectedProject.technologies.filter(
                                t => !existingLower.has(t.toLowerCase())
                              );
                              return [...prev, ...toAdd];
                            });
                          }
                          if (selectedProject?.description?.trim()) {
                            setDescription(prev => (prev.trim() ? prev : selectedProject.description));
                          }
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                    >
                      <option value={CUSTOM_PROJECT_OPTION}>Nenhum projeto / outro</option>
                      {sortedProjects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>

                    {showCustomProjectInput && (
                      <input
                        type="text"
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        placeholder="Ex: Plataforma Financeira ou Geral"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                      />
                    )}
                  </div>

                  {/* Technologies tags input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Tecnologias Utilizadas</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                        placeholder="Ex: Python (Enter)"
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddTech}
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      >
                        Adicionar
                      </button>
                    </div>
                    
                    {/* Render current tech list */}
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {technologies.map((tech, index) => (
                          <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-850 text-slate-300 border border-slate-800">
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleRemoveTech(index)}
                              className="text-slate-500 hover:text-red-400 focus:outline-none transition-colors"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Competencies list */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Habilidades Adquiridas (Competências)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={competencyInput}
                        onChange={(e) => setCompetencyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCompetency())}
                        placeholder="Ex: Automação (Enter)"
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddCompetency}
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      >
                        Adicionar
                      </button>
                    </div>
                    
                    {/* Render current competencies list */}
                    {competencies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {competencies.map((comp, index) => (
                          <span key={comp} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-950/40 text-violet-300 border border-violet-900/30">
                            {comp}
                            <button
                              type="button"
                              onClick={() => handleRemoveCompetency(index)}
                              className="text-violet-500 hover:text-violet-300 focus:outline-none transition-colors"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Impact Result field */}
                  <div className="space-y-1.5 font-sans">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Métrica de Impacto ou Resultado Otimizado</label>
                    <input
                      type="text"
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      placeholder="Ex: Economia de 4h de faturamento semanal ou 100% de conexões seguras."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                    />
                    <span className="block text-[10px] text-slate-500">Crucial para que a IA gere seu currículo baseado em conquistas reais.</span>
                  </div>

                  {/* Form Submission buttons */}
                  <div className="pt-3 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-blue hover:bg-brand-blue text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-violet/25"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingId ? "Salvar Alterações" : "Salvar Registro"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Limpar
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </form>
        </div>
      </div>

      {/* Right Column: Historical Logs Display */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Filters and Search Bar */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, tecnologias, projeto..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-blue rounded-lg pl-9 pr-3 py-2 text-slate-200 text-xs focus:outline-none transition-all placeholder-slate-600"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center justify-end w-full md:w-auto">
            <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por:
            </span>
            {["Todas", ...CATEGORIES.slice(0, 5)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase border transition-all ${
                  selectedCategoryFilter === cat
                    ? "bg-brand-violet/30 text-brand-cyan border-brand-violet"
                    : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Cards Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredExperiences.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-850 text-center space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">Nenhum registro encontrado para a busca atual.</p>
                <p className="text-xs text-slate-500">Tente buscar por outras palavras-chave ou categorias.</p>
              </div>
            ) : (
              filteredExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.date}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] bg-slate-950 text-slate-300 rounded border border-slate-850 font-semibold tracking-wide uppercase">
                          {exp.category}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] bg-violet-950/20 text-violet-300 rounded border border-violet-900/20 font-semibold">
                          Projeto: {exp.project || "Geral"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-brand-cyan transition-colors pt-1">
                        {exp.title}
                      </h3>
                    </div>

                    <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEditClick(exp)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-750 transition-colors"
                        title="Editar registro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExperience(exp.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 rounded-md border border-slate-750 transition-colors"
                        title="Deletar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed text-justify font-sans">{exp.description}</p>

                  {exp.result && (
                    <div className="p-3 bg-brand-violet/20 border border-brand-violet/20 rounded-xl flex items-start gap-2.5 text-brand-cyan leading-relaxed text-xs">
                      <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Impacto:</strong> {exp.result}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Render technologies */}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <Tag className="w-3 h-3 text-slate-600 mr-1" />
                        {exp.technologies.map(tech => (
                          <span key={tech} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-400 rounded border border-slate-850">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Render competencies */}
                    {exp.competencies && exp.competencies.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {exp.competencies.map(comp => (
                          <span key={comp} className="px-1.5 py-0.5 text-[9px] bg-violet-950/40 text-violet-300 rounded-full border border-violet-900/20 font-semibold tracking-tight">
                            {comp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

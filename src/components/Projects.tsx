import React, { useState } from "react";
import { Project } from "../types";
import { Briefcase, ToggleLeft, Save, Plus, Trash2, Edit2, Code, Hammer, Rocket, Layout, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectsProps {
  projects: Project[];
  onAddProject: (proj: Omit<Project, "id">) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (proj: Project) => void;
}

export default function Projects({ projects, onAddProject, onDeleteProject, onUpdateProject }: ProjectsProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"Em produção" | "Em desenvolvimento" | "Planejado">("Em desenvolvimento");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setStatus("Em desenvolvimento");
    setTechInput("");
    setTechnologies([]);
    setDescription("");
    setIsFormExpanded(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nome do projeto é obrigatório.");
      return;
    }

    const projData = {
      name: name.trim(),
      category: category.trim() || "Geral",
      status,
      technologies,
      description: description.trim()
    };

    if (editingId) {
      onUpdateProject({ id: editingId, ...projData });
    } else {
      onAddProject(projData);
    }

    resetForm();
  };

  const handleEditClick = (proj: Project) => {
    setEditingId(proj.id);
    setName(proj.name);
    setCategory(proj.category);
    setStatus(proj.status);
    setTechnologies(proj.technologies || []);
    setDescription(proj.description || "");
    setIsFormExpanded(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case "Em produção":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-violet/40 text-brand-cyan border border-brand-violet/20">
            <Rocket className="w-3.5 h-3.5" />
            Em produção
          </span>
        );
      case "Em desenvolvimento":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-400 border border-amber-900/20">
            <Hammer className="w-3.5 h-3.5 animate-pulse" />
            Em desenvolvimento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Layout className="w-3.5 h-3.5" />
            Planejado
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Register Project Form */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-650/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-400" />
                {editingId ? "Editar Projeto" : "Cadastrar Projeto"}
              </h2>
              <p className="text-xs text-slate-400">Adicione os projetos corporativos nos quais atuou.</p>
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
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Nome do Projeto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Comissys"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg px-3 py-2.5 text-slate-200 text-xs focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Categoria do Projeto</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Sistema Corporativo, Web App, Infra"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg px-3 py-2.5 text-slate-200 text-xs focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Planejado", "Em desenvolvimento", "Em produção"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`min-h-[2.75rem] px-1 py-1.5 flex items-center justify-center text-center border text-[9px] font-bold tracking-tight uppercase leading-tight rounded-md transition-all ${
                      status === s
                        ? "bg-violet-900/30 text-violet-400 border-violet-800"
                        : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Tecnologias Envolvidas</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                  placeholder="Ex: PySide6 (Enter)"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                >
                  Add
                </button>
              </div>

              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {technologies.map((tech, index) => (
                    <span key={tech} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-850 text-slate-300 border border-slate-800">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(index)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva resumidamente os objetivos e impacto deste projeto na empresa..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg px-3 py-2.5 text-slate-200 text-xs focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-violet-950/25"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? "Salvar Alterações" : "Salvar Projeto"}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Limpar
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Right Column: Projects List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Catálogo de Projetos ({projects.length})</h2>
          <span className="text-[11px] text-slate-500 font-mono">Status em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {projects.map((proj, index) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between min-h-64 group relative"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{proj.category}</span>
                      <h3 className="text-base font-extrabold text-white group-hover:text-violet-400 transition-colors leading-snug">
                        {proj.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(proj)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-750 rounded-md transition-colors"
                        title="Editar projeto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-350 border border-slate-750 rounded-md transition-colors"
                        title="Deletar projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {getStatusBadge(proj.status)}

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">{proj.description}</p>
                </div>

                {/* Footer stack */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 border-t border-slate-850/60 pt-3 mt-3">
                    {proj.technologies.map(tech => (
                      <span key={tech} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-400 rounded border border-slate-850">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

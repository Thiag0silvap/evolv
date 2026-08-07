export type CategoryType = 
  | "Automação" 
  | "Infraestrutura" 
  | "Desenvolvimento" 
  | "Banco de Dados" 
  | "Segurança" 
  | "Gestão/Agile" 
  | "Outros";

export interface Experience {
  id: string;
  title: string;
  description: string;
  project: string;
  category: CategoryType;
  technologies: string[];
  date: string; // YYYY-MM-DD
  result: string; // Impact/achievement
  competencies: string[]; // derived automatic professional skills
}

export interface Project {
  id: string;
  name: string;
  category: string;
  status: "Em produção" | "Em desenvolvimento" | "Planejado";
  technologies: string[];
  description: string;
  origem: "corporativo" | "pessoal";
  created_at?: string;
}

// Batched write instructions produced by the resume-import review screen —
// processed sequentially so the local `experiences` state is updated once,
// from a single source of truth, instead of racing on stale closures.
export type ImportExperienceAction =
  | { type: "insert"; data: Omit<Experience, "id"> }
  | { type: "update"; id: string; data: Omit<Experience, "id"> };

export interface CareerStats {
  careerDays: number;
  activeProjects: number;
  competenciesCount: number;
  experiencesCount: number;
}

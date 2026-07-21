import { Experience, Project } from "./types";

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    name: "Comissys",
    category: "Desenvolvimento Corporativo",
    status: "Em produção",
    technologies: ["Python", "SQL Server", "PySide6", "Git"],
    description: "Sistema para gerenciamento e cálculo automatizado de comissões de vendas, integrando dados do ERP corporativo e gerando relatórios precisos."
  },
  {
    id: "proj-2",
    name: "Sistema de Academia",
    category: "Desenvolvimento Web",
    status: "Em produção",
    technologies: ["Python", "SQLite", "Tkinter", "Git"],
    description: "Plataforma de gestão de alunos, planos de treino, controle de acesso e fluxo financeiro para academias de médio porte."
  },
  {
    id: "proj-3",
    name: "Automações Corporativas",
    category: "Automação",
    status: "Em produção",
    technologies: ["Python", "SQL Server", "OpenPyXL", "Task Scheduler"],
    description: "Série de scripts e rotinas integradas que automatizam a extração de dados do banco de dados, geração de planilhas e disparo de e-mails para setores financeiro e de TI."
  },
  {
    id: "proj-4",
    name: "Infra & Redes",
    category: "Infraestrutura",
    status: "Em produção",
    technologies: ["Firewall", "PFSense", "VPN", "Switch Cisco"],
    description: "Projetos de estruturação, isolamento de sub-redes corporativas, configurações de VPNs seguras para integração de filiais e políticas de firewall restritas."
  }
];

export const initialExperiences: Experience[] = [
  {
    id: "exp-1",
    title: "Automação de Relatório Financeiro",
    description: "Criei um script robusto em Python que se conecta de forma segura ao SQL Server corporativo, extrai os faturamentos consolidados e gera automaticamente uma planilha formatada usando OpenPyXL para a diretoria financeira.",
    project: "Automações Corporativas",
    category: "Automação",
    technologies: ["Python", "SQL Server", "OpenPyXL"],
    date: "2026-07-15",
    result: "Redução do tempo de geração do relatório mensal de 4 horas para apenas 12 segundos, eliminando erros manuais.",
    competencies: ["Automação", "Banco de Dados", "Python Scripting"]
  },
  {
    id: "exp-2",
    title: "Implementação de Regras de Firewall e VPN",
    description: "Configurei e implantei regras rigorosas de segurança de tráfego no PFSense, além de estruturar uma conexão VPN IPsec estável para interligar as máquinas de duas filiais com o banco de dados central.",
    project: "Infra & Redes",
    category: "Infraestrutura",
    technologies: ["PFSense", "VPN", "Firewall", "Redes"],
    date: "2026-06-28",
    result: "Garantia de 100% de tráfego criptografado entre filiais e isolamento seguro de sub-redes de TI e administrativo.",
    competencies: ["Cibersegurança", "Infraestrutura", "Arquitetura de Redes"]
  },
  {
    id: "exp-3",
    title: "Desenvolvimento do Sistema Comissys",
    description: "Participei do design, modelagem e desenvolvimento do Comissys, uma aplicação desktop em Python e PySide6 com banco SQL Server para otimizar os fluxos de pagamento de comissões da empresa.",
    project: "Comissys",
    category: "Desenvolvimento",
    technologies: ["Python", "PySide6", "SQL Server", "Git"],
    date: "2026-05-10",
    result: "Substituição completa de planilhas instáveis por um sistema integrado, agilizando em 80% o fechamento de folha de comissão.",
    competencies: ["Desenvolvimento de Software", "Modelagem SQL", "Python Desktop"]
  },
  {
    id: "exp-4",
    title: "Otimização de Consultas SQL",
    description: "Analisei e reescrevi queries complexas no SQL Server que geravam relatórios de faturamento demorados. Criei índices não-clusterizados específicos para as colunas mais filtradas nas junções.",
    project: "Comissys",
    category: "Banco de Dados",
    technologies: ["SQL Server", "Performance Tuning"],
    date: "2026-04-18",
    result: "Melhoria de mais de 70% no tempo de resposta das consultas do painel administrativo (de 45 segundos para 3 segundos).",
    competencies: ["Banco de Dados", "Performance Tuning", "SQL"]
  },
  {
    id: "exp-5",
    title: "Estruturação de Ambiente de Homologação",
    description: "Criei um ambiente de testes local isolado no servidor corporativo usando virtualização, permitindo que a equipe valide novas funcionalidades do sistema de Academia sem afetar os dados reais dos alunos.",
    project: "Sistema de Academia",
    category: "Infraestrutura",
    technologies: ["Virtualbox", "Linux Server", "Docker"],
    date: "2026-02-22",
    result: "Redução de bugs críticos em produção a zero nos últimos lançamentos do sistema de academia.",
    competencies: ["DevOps", "Virtualização", "Administração Linux"]
  },
  {
    id: "exp-6",
    title: "Criação de Painel de Treinos Responsivo",
    description: "Desenvolvi uma interface interativa web mobile-first para exibição de treinos diários dos alunos do Sistema de Academia, facilitando a visualização em smartphones dentro da própria academia.",
    project: "Sistema de Academia",
    category: "Desenvolvimento",
    technologies: ["HTML5", "Tailwind CSS", "JavaScript"],
    date: "2025-11-05",
    result: "Aumento do engajamento dos alunos no app em 65%, com excelente feedback de usabilidade tátil.",
    competencies: ["Acessibilidade", "Frontend UI", "Responsividade"]
  },
  {
    id: "exp-7",
    title: "Suporte Avançado e Migração de Ativos",
    description: "Atuei como responsável pela transição completa de servidores de arquivos antigos para um storage NAS centralizado, definindo permissões granulares baseadas em grupos de usuários do Active Directory.",
    project: "Infra & Redes",
    category: "Infraestrutura",
    technologies: ["Active Directory", "NAS Storage", "Windows Server"],
    date: "2025-08-14",
    result: "Migração de 2TB de dados com zero tempo de inatividade para a equipe operacional durante o horário comercial.",
    competencies: ["Gerenciamento de Ativos", "Segurança da Informação", "Windows Server"]
  }
];

export const initialPrdText = `
# DOCUMENTO DE REQUISITOS DO PRODUTO (PRD)
## Projeto: Evolv (Track your professional evolution)

---

### 1. Visão Geral
O **Evolv** é uma plataforma inteligente de inteligência de carreira que ajuda desenvolvedores e profissionais de tecnologia a registrar suas experiências diárias de maneira humanizada, monitorar suas competências automaticamente e converter essa trajetória consolidada em ativos profissionais (como currículos sob medida para vagas e conteúdos para redes sociais como LinkedIn) com auxílio pontual de Inteligência Artificial.

**Slogan:** *Track your professional evolution.* ou *Build your professional story.*

---

### 2. O Problema
Atualmente, profissionais realizam dezenas de tarefas complexas, automações e resoluções de incidentes durante o ano. No entanto, ao atualizar o currículo ou preparar-se para uma entrevista, esquecem da maioria dos detalhes de impacto, das tecnologias secundárias empregadas e de métricas de resultado. Isso subestima a real qualificação do profissional de software.

---

### 3. A Solução
O Evolv atua como o **cérebro de carreira** do profissional.
1. **Registro Contextual:** Em vez de CRUDs tradicionais, o usuário é instigado a responder "Conte uma experiência do seu dia" em formato de reflexão diária.
2. **Inteligência Própria:** Identifica automaticamente competências, tecnologias e categorias sem a necessidade de IA para tudo (economizando custos de tokens).
3. **IA como Assistente:** Entra em cena apenas para melhorar a redação técnica, resumir impactos, estruturar tags e gerar currículos formatados/cartas de apresentação.
4. **Competências Orgânicas:** As habilidades nascem e evoluem com base no volume e recência de registros de experiências.

---

### 4. Arquitetura Proposta: Monólito Modular
O sistema é organizado em módulos independentes e desacoplados na pasta \`src/modules/\` (ou \`src/components/\` para escopo de applet unificado), integrados por tipos e estados compartilhados.
- **Módulo Auth (Simulado/Local):** Perfil do usuário atual.
- **Módulo Dashboard:** Visão de métricas consolidadas e Evolv Score.
- **Módulo Experiences:** Log diário assistido por IA.
- **Módulo Projects:** Catálogo de projetos corporativos e pessoais.
- **Módulo Skills:** Motor de cálculo automático de pontuação por competência.
- **Módulo Timeline:** Navegador histórico anual.
- **Módulo Resume:** Compilador de PDFs/Markdown direcionado a cargos específicos.
- **Módulo LinkedIn:** Gerador de posts e resumos.

---

### 5. O Evolv Score
As competências do profissional não são declaradas de forma opinativa. Elas são calculadas com base nas experiências registradas:
- Cada experiência adiciona pontos às tecnologias listadas.
- O score de uma categoria (ex: Infraestrutura, Automação, Python) é derivado de uma média ponderada do volume de logs de experiência, complexidade relatada e data do último log (recência).
`;

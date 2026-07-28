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

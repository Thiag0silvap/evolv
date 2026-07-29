import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import pdfMake from "pdfmake";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
} from "docx";
import type { CategoryType, Experience } from "./src/types";

dotenv.config();

// Categorias válidas de experiência (mesmo enum de src/types.ts) e cores de badge para export
const CATEGORY_COLORS: Record<CategoryType, string> = {
  "Automação": "0EA5E9",
  "Infraestrutura": "6366F1",
  "Desenvolvimento": "22C55E",
  "Banco de Dados": "F59E0B",
  "Segurança": "EF4444",
  "Gestão/Agile": "A855F7",
  "Outros": "64748B",
};
const VALID_CATEGORIES = Object.keys(CATEGORY_COLORS) as CategoryType[];

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: AI Suggestions for experience details
app.post("/api/gemini/suggest", async (req, res) => {
  try {
    const { description, projectContext } = req.body;
    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Descrição é obrigatória." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é o assistente de inteligência de carreira Evolv.
Analise a experiência/atividade diária descrita pelo usuário e sugira detalhes profissionais estruturados de alta qualidade.
Identifique tecnologias reais comuns de TI mencionadas ou implícitas (por exemplo, se mencionar "regra de firewall" e "redes", pode sugerir "PFSense", "Fortinet", "Cisco", "TCP/IP" ou "Infraestrutura").
Categorias válidas: "Automação", "Infraestrutura", "Desenvolvimento", "Banco de Dados", "Segurança", "Gestão/Agile", "Outros".`;

    let prompt = `Analise a seguinte experiência relatada:
"${description}"

Gere as seguintes sugestões estruturadas baseadas nela. Seja preciso e evite respostas vagas.`;

    if (projectContext && typeof projectContext === "object") {
      const { name, description: projectDescription, technologies: projectTechnologies } = projectContext;
      const contextLines: string[] = [];
      if (typeof name === "string" && name.trim()) {
        contextLines.push(`Nome do projeto: ${name.trim()}`);
      }
      if (typeof projectDescription === "string" && projectDescription.trim()) {
        contextLines.push(`Descrição geral do projeto: ${projectDescription.trim()}`);
      }
      if (Array.isArray(projectTechnologies) && projectTechnologies.length > 0) {
        contextLines.push(`Tecnologias do projeto: ${projectTechnologies.join(", ")}`);
      }

      if (contextLines.length > 0) {
        prompt += `

CONTEXTO DE FUNDO DO PROJETO (informação geral sobre o projeto como um todo, NÃO é o que foi feito especificamente hoje — use apenas como pano de fundo):
${contextLines.join("\n")}

IMPORTANTE: o relato do usuário acima é o que efetivamente aconteceu e deve ser priorizado nas sugestões de título e de métrica de impacto/resultado. As tecnologias do projeto podem reforçar as sugestões de tecnologias e competências, mas não invente conquistas, métricas ou resultados que não estejam no relato do usuário.`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Um título profissional curto e elegante com verbo de ação para a experiência. Ex: 'Implantação de Firewall de Redes Corporativas' ou 'Automação de Relatórios com Python'.",
            },
            category: {
              type: Type.STRING,
              description: "A categoria que melhor se encaixa: 'Automação', 'Infraestrutura', 'Desenvolvimento', 'Banco de Dados', 'Segurança', 'Gestão/Agile', ou 'Outros'.",
            },
            project: {
              type: Type.STRING,
              description: "O nome provável do projeto ou sistema relacionado. Se não mencionado, invente um nome corporativo curto e plausível. Ex: 'Security Shield' ou 'ReportAutomator'.",
            },
            technologies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 1 a 6 tecnologias, frameworks ou conceitos de TI associados a esta tarefa (ex: 'Python', 'SQL Server', 'Firewall', 'VPN').",
            },
            result: {
              type: Type.STRING,
              description: "Uma frase profissional descrevendo o impacto, resultado ou benefício dessa ação. Ex: 'Aumento de 50% na segurança de rede e isolamento de dados sensíveis'.",
            },
            competencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 2 a 5 competências/skills profissionais demonstradas (ex: 'Scripting', 'Cibersegurança', 'Resolução de Problemas', 'Arquitetura de Redes').",
            },
          },
          required: ["title", "category", "project", "technologies", "result", "competencies"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Não foi possível gerar sugestões do modelo Gemini.");
    }

    const suggestions = JSON.parse(resultText);
    res.json(suggestions);
  } catch (error: any) {
    console.error("Erro na API /api/gemini/suggest:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao consultar a IA." });
  }
});

// Endpoint: AI Resume generation
app.post("/api/gemini/resume", async (req, res) => {
  try {
    const { targetRole, experiences, projects, customInstructions } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "Cargo alvo é obrigatório." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é o especialista em RH e recrutamento de tecnologia da Evolv.
Seu objetivo é gerar um currículo extremamente profissional, moderno, focado em resultados e totalmente otimizado para ATS (Applicant Tracking Systems), formatado em Markdown impecável.
Use o perfil do profissional Thiago da Silva Pereira (ou os dados fornecidos) e filtre as experiências para destacar o cargo alvo solicitado pelo usuário.`;

    const prompt = `Gere um currículo em formato Markdown profissional de acordo com as seguintes especificações:

**Cargo Alvo:** ${targetRole}
**Instruções Adicionais:** ${customInstructions || "Nenhuma específica."}

**Lista de Experiências Disponíveis no Banco:**
${JSON.stringify(experiences, null, 2)}

**Projetos Relevantes Disponíveis:**
${JSON.stringify(projects, null, 2)}

**Diretrizes do Currículo:**
1. Crie uma estrutura elegante com Seções claras: "Perfil Profissional", "Competências", "Experiência Profissional" (com datas, impacto e tecnologias usadas de forma visível), "Projetos Principais" e "Educação/Certificações".
2. Melhore as descrições e títulos usando termos de forte impacto (como "Otimizei", "Liderei", "Automatizei", "Implementei").
3. Inclua estatísticas de impacto realistas se as experiências tiverem resultados (ex: "redução de tempo", "aumento de performance").
4. Liste de forma visível as tecnologias dominadas ao final de cada experiência e em uma seção de competências separada.
5. Retorne SOMENTE o currículo formatado em Markdown pronto para ser exibido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ markdown: response.text });
  } catch (error: any) {
    console.error("Erro na API /api/gemini/resume:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar currículo com a IA." });
  }
});

// Endpoint: AI LinkedIn Post generation
app.post("/api/gemini/linkedin", async (req, res) => {
  try {
    const { experience, tone } = req.body;
    if (!experience) {
      return res.status(400).json({ error: "Os dados da experiência são obrigatórios." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é um produtor de conteúdo de tecnologia para o LinkedIn extremamente influente e profissional.
Crie um post engajador, fluido, com gancho atrativo no início, bom espaçamento para leitura (bullet points), uso moderado de emojis funcionais e hashtags relevantes sobre tecnologia de carreira.`;

    const prompt = `Crie uma publicação de alta conversão para o LinkedIn baseada nesta experiência profissional recente:

**Título:** ${experience.title}
**Descrição:** ${experience.description}
**Projeto:** ${experience.project}
**Tecnologias:** ${experience.technologies ? experience.technologies.join(", ") : ""}
**Resultado obtido:** ${experience.result}

**Tom desejado:** ${tone || "professional"} (pode ser "professional", "enthusiastic", "technical" ou "insightful")

Diretrizes:
- Use uma estrutura de narrativa profissional (Hook -> Desafio -> Como resolvi -> Aprendizado/Resultado -> Call to Action).
- Escreva em português do Brasil de maneira natural, inspiradora e sem exageros artificiais.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ post: response.text });
  } catch (error: any) {
    console.error("Erro na API /api/gemini/linkedin:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar publicação com a IA." });
  }
});

// Categorias de habilidade exibidas na tela de Habilidades, com uma frase-guia
// para orientar a classificação do modelo (distintas das categorias de Experience)
const SKILL_CATEGORIES = [
  "Desenvolvimento",
  "Banco de Dados",
  "Segurança & Redes",
  "Infraestrutura",
  "Automação",
  "Habilidade Geral",
] as const;
type SkillCategory = (typeof SKILL_CATEGORIES)[number];

const SKILL_CATEGORY_HINTS: Record<SkillCategory, string> = {
  "Desenvolvimento": "linguagens de programação, frameworks e construção de software/apps",
  "Banco de Dados": "bancos de dados, SQL, modelagem de dados e performance de consultas",
  "Segurança & Redes": "firewalls, VPNs, redes corporativas e cibersegurança",
  "Infraestrutura": "servidores, virtualização, sistemas operacionais e gestão de infraestrutura de TI",
  "Automação": "scripts, automação de processos e ferramentas de produtividade",
  "Habilidade Geral": "competências transversais ou que não se encaixam claramente nas categorias técnicas acima",
};

// Endpoint: AI-assisted categorization of skill names into the fixed set of skill categories
app.post("/api/gemini/categorize-skills", async (req, res) => {
  try {
    const { skillNames } = req.body;
    if (!Array.isArray(skillNames) || skillNames.length === 0 || !skillNames.every(n => typeof n === "string")) {
      return res.status(400).json({ error: "skillNames deve ser uma lista não vazia de strings." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é o assistente de inteligência de carreira Evolv.
Classifique cada habilidade técnica ou competência informada em exatamente UMA das categorias abaixo, escolhendo sempre a que melhor descreve a habilidade:
${SKILL_CATEGORIES.map(cat => `- "${cat}": ${SKILL_CATEGORY_HINTS[cat]}.`).join("\n")}
Responda apenas com as categorias exatamente como escritas acima.`;

    const prompt = `Classifique as seguintes habilidades:
${skillNames.map(n => `- ${n}`).join("\n")}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categorizations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "O nome da habilidade exatamente como foi informado.",
                  },
                  category: {
                    type: Type.STRING,
                    description: `Uma destas categorias exatas: ${SKILL_CATEGORIES.join(", ")}.`,
                  },
                },
                required: ["name", "category"],
              },
            },
          },
          required: ["categorizations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Não foi possível categorizar as habilidades com o modelo Gemini.");
    }

    const parsed = JSON.parse(resultText);
    const categorizations: { name: string; category: string }[] = parsed.categorizations || [];

    // Defensive: only accept categories from the fixed set, otherwise fall back
    const categories: Record<string, string> = {};
    categorizations.forEach(({ name, category }) => {
      categories[name] = (SKILL_CATEGORIES as readonly string[]).includes(category)
        ? category
        : "Habilidade Geral";
    });

    res.json({ categories });
  } catch (error: any) {
    console.error("Erro na API /api/gemini/categorize-skills:", error);
    res.status(500).json({ error: error.message || "Erro ao categorizar habilidades com a IA." });
  }
});

// --- Importação de currículo (upload PDF/DOCX -> extração de texto -> estruturação via IA) ---

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || name.endsWith(".pdf");
    const isDocx =
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx");
    if (isPdf || isDocx) {
      cb(null, true);
    } else {
      cb(new Error("Formato de arquivo não suportado. Envie um PDF ou DOCX."));
    }
  },
});

// Middleware wrapper: converte erros do multer (arquivo grande demais, tipo inválido) em JSON, sem derrubar o servidor
function uploadResumeFile(req: express.Request, res: express.Response, next: express.NextFunction) {
  resumeUpload.single("file")(req, res, (err: any) => {
    if (err) {
      const message = err instanceof multer.MulterError ? err.message : err.message || "Erro ao processar o upload do arquivo.";
      return res.status(400).json({ error: message });
    }
    next();
  });
}

async function extractTextFromResumeFile(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();
  const isPdf = file.mimetype === "application/pdf" || name.endsWith(".pdf");

  if (isPdf) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      if (!result.text || !result.text.trim()) {
        throw new Error("Não foi possível extrair texto do PDF (arquivo vazio, corrompido ou baseado em imagem).");
      }
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  const { value } = await mammoth.extractRawText({ buffer: file.buffer });
  if (!value || !value.trim()) {
    throw new Error("Não foi possível extrair texto do DOCX (arquivo vazio ou corrompido).");
  }
  return value;
}

// Endpoint: Importar currículo existente (PDF/DOCX) e sugerir experiências estruturadas via IA
// Apenas retorna o JSON para revisão do usuário — não salva nada no Supabase.
app.post("/api/gemini/import-resume", uploadResumeFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado. Envie um PDF ou DOCX no campo 'file'." });
    }

    let extractedText: string;
    try {
      extractedText = await extractTextFromResumeFile(req.file);
    } catch (extractError: any) {
      return res.status(422).json({ error: extractError.message || "Falha ao extrair texto do arquivo enviado." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é o assistente de inteligência de carreira Evolv.
Analise o texto bruto extraído de um currículo existente e identifique experiências profissionais candidatas para importação.
Categorias válidas (use exatamente uma destas por experiência): ${VALID_CATEGORIES.join(", ")}.`;

    const prompt = `Texto extraído do currículo do usuário:
"""
${extractedText}
"""

Extraia cada experiência profissional relevante como um item estruturado.
Se a data completa não estiver disponível, use uma aproximação razoável (ex: apenas o ano, formatado como "AAAA-01-01").`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              experiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    project: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: `Uma destas categorias exatas: ${VALID_CATEGORIES.join(", ")}.`,
                    },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    date: { type: Type.STRING, description: "Data aproximada no formato AAAA-MM-DD" },
                    result: { type: Type.STRING },
                    competencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["title", "description", "project", "category", "technologies", "date", "result", "competencies"],
                },
              },
            },
            required: ["experiences"],
          },
        },
      });
    } catch (aiError: any) {
      return res.status(502).json({ error: aiError.message || "Erro ao consultar a IA para estruturar o currículo." });
    }

    const resultText = response.text;
    if (!resultText) {
      return res.status(502).json({ error: "A IA não retornou conteúdo estruturado." });
    }

    let parsed: { experiences?: any[] };
    try {
      parsed = JSON.parse(resultText);
    } catch {
      return res.status(502).json({ error: "A IA retornou um JSON inválido ao estruturar o currículo. Tente novamente." });
    }

    const candidateExperiences = (parsed.experiences || []).map((exp) => ({
      title: exp.title || "",
      description: exp.description || "",
      project: exp.project || "",
      category: VALID_CATEGORIES.includes(exp.category) ? exp.category : "Outros",
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      date: exp.date || new Date().toISOString().slice(0, 10),
      result: exp.result || "",
      competencies: Array.isArray(exp.competencies) ? exp.competencies : [],
    }));

    res.json({ experiences: candidateExperiences });
  } catch (error: any) {
    console.error("Erro na API /api/gemini/import-resume:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao importar currículo." });
  }
});

// --- Exportação de currículo (markdown gerado -> PDF / DOCX) ---

type MdBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "li"; text: string };

function parseMarkdown(markdown: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("### ")) blocks.push({ type: "h3", text: line.slice(4) });
    else if (line.startsWith("## ")) blocks.push({ type: "h2", text: line.slice(3) });
    else if (line.startsWith("# ")) blocks.push({ type: "h1", text: line.slice(2) });
    else if (line.startsWith("- ") || line.startsWith("* ")) blocks.push({ type: "li", text: line.slice(2) });
    else blocks.push({ type: "p", text: line });
  }
  return blocks;
}

// Suporte apenas a **negrito**, o único destaque usado pelos prompts de geração de currículo
function parseInlineRuns(text: string): Array<{ text: string; bold: boolean }> {
  const runs: Array<{ text: string; bold: boolean }> = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) runs.push({ text: text.slice(lastIndex, match.index), bold: false });
    runs.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) runs.push({ text: text.slice(lastIndex), bold: false });
  return runs.length ? runs : [{ text, bold: false }];
}

function sanitizeFilename(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return clean || "curriculo";
}

async function generateResumePdfBuffer(markdown: string, targetRole: string, experiences?: Experience[]): Promise<Buffer> {
  (pdfMake as any).addFonts({
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  });

  const blocks = parseMarkdown(markdown);
  const content: any[] = [
    { text: targetRole ? `Currículo — ${targetRole}` : "Currículo", style: "docTitle", margin: [0, 0, 0, 12] },
  ];

  for (const block of blocks) {
    const runs = parseInlineRuns(block.text).map((r) => ({ text: r.text, bold: r.bold }));
    if (block.type === "h1") content.push({ text: runs, style: "h1", margin: [0, 14, 0, 4] });
    else if (block.type === "h2") content.push({ text: runs, style: "h2", margin: [0, 10, 0, 4] });
    else if (block.type === "h3") content.push({ text: runs, style: "h3", margin: [0, 8, 0, 2] });
    else if (block.type === "li") content.push({ ul: [{ text: runs }], margin: [0, 0, 0, 2] });
    else content.push({ text: runs, style: "p", margin: [0, 0, 0, 4] });
  }

  if (experiences && experiences.length) {
    content.push({ text: "Categorias de Competência", style: "h2", margin: [0, 16, 0, 6] });
    const categories = Array.from(new Set(experiences.map((e) => e.category)));
    content.push({
      columns: categories.map((cat) => ({
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: cat,
                color: "white",
                fillColor: `#${CATEGORY_COLORS[cat] || "64748B"}`,
                fontSize: 8,
                bold: true,
                margin: [4, 3, 4, 3],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 4, 4],
      })),
      columnGap: 4,
    });
  }

  const docDefinition = {
    content,
    defaultStyle: { font: "Roboto", fontSize: 10 },
    styles: {
      docTitle: { fontSize: 18, bold: true, color: "#1E293B" },
      h1: { fontSize: 14, bold: true, color: "#1E293B" },
      h2: { fontSize: 12, bold: true, color: "#334155" },
      h3: { fontSize: 11, bold: true, color: "#475569" },
      p: { fontSize: 10, color: "#334155" },
    },
  };

  const doc = (pdfMake as any).createPdf(docDefinition);
  return doc.getBuffer();
}

async function generateResumeDocxBuffer(markdown: string, targetRole: string, experiences?: Experience[]): Promise<Buffer> {
  const blocks = parseMarkdown(markdown);
  const children: Array<Paragraph | Table> = [
    new Paragraph({ text: targetRole ? `Currículo — ${targetRole}` : "Currículo", heading: HeadingLevel.TITLE }),
  ];

  for (const block of blocks) {
    const runs = parseInlineRuns(block.text).map((r) => new TextRun({ text: r.text, bold: r.bold }));
    if (block.type === "h1") children.push(new Paragraph({ children: runs, heading: HeadingLevel.HEADING_1 }));
    else if (block.type === "h2") children.push(new Paragraph({ children: runs, heading: HeadingLevel.HEADING_2 }));
    else if (block.type === "h3") children.push(new Paragraph({ children: runs, heading: HeadingLevel.HEADING_3 }));
    else if (block.type === "li") children.push(new Paragraph({ children: runs, bullet: { level: 0 } }));
    else children.push(new Paragraph({ children: runs }));
  }

  if (experiences && experiences.length) {
    children.push(
      new Paragraph({ text: "Categorias de Competência", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } })
    );
    const categories = Array.from(new Set(experiences.map((e) => e.category)));
    const badgeRow = new TableRow({
      children: categories.map(
        (cat) =>
          new TableCell({
            width: { size: 100 / categories.length, type: WidthType.PERCENTAGE },
            shading: { fill: CATEGORY_COLORS[cat] || "64748B", type: ShadingType.CLEAR, color: "auto" },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cat, color: "FFFFFF", bold: true })],
              }),
            ],
          })
      ),
    });
    children.push(new Table({ rows: [badgeRow], width: { size: 100, type: WidthType.PERCENTAGE } }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// Endpoint: Exportar currículo compilado (markdown) como PDF
app.post("/api/gemini/export-resume-pdf", async (req, res) => {
  try {
    const { markdown, targetRole, experiences } = req.body;
    if (!markdown || typeof markdown !== "string") {
      return res.status(400).json({ error: "O conteúdo em markdown do currículo é obrigatório." });
    }
    const buffer = await generateResumePdfBuffer(markdown, targetRole || "", experiences);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="curriculo_${sanitizeFilename(targetRole || "")}.pdf"`);
    res.send(buffer);
  } catch (error: any) {
    console.error("Erro na API /api/gemini/export-resume-pdf:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar PDF do currículo." });
  }
});

// Endpoint: Exportar currículo compilado (markdown) como DOCX
app.post("/api/gemini/export-resume-docx", async (req, res) => {
  try {
    const { markdown, targetRole, experiences } = req.body;
    if (!markdown || typeof markdown !== "string") {
      return res.status(400).json({ error: "O conteúdo em markdown do currículo é obrigatório." });
    }
    const buffer = await generateResumeDocxBuffer(markdown, targetRole || "", experiences);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="curriculo_${sanitizeFilename(targetRole || "")}.docx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error("Erro na API /api/gemini/export-resume-docx:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar DOCX do currículo." });
  }
});

// Configure Vite or production static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Evolv running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

setupServer();

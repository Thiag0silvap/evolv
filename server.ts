import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

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
    const { description } = req.body;
    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Descrição é obrigatória." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é o assistente de inteligência de carreira Evolv. 
Analise a experiência/atividade diária descrita pelo usuário e sugira detalhes profissionais estruturados de alta qualidade.
Identifique tecnologias reais comuns de TI mencionadas ou implícitas (por exemplo, se mencionar "regra de firewall" e "redes", pode sugerir "PFSense", "Fortinet", "Cisco", "TCP/IP" ou "Infraestrutura").
Categorias válidas: "Automação", "Infraestrutura", "Desenvolvimento", "Banco de Dados", "Segurança", "Gestão/Agile", "Outros".`;

    const prompt = `Analise a seguinte experiência relatada:
"${description}"

Gere as seguintes sugestões estruturadas baseadas nela. Seja preciso e evite respostas vagas.`;

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

// Endpoint: AI Cover Letter generation
app.post("/api/gemini/cover-letter", async (req, res) => {
  try {
    const { targetRole, company, experiences } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: "Cargo alvo é obrigatório." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Você é um redator profissional de carreiras da Evolv.
Escreva uma carta de apresentação elegante, persuasiva e personalizada para uma vaga de tecnologia.`;

    const prompt = `Escreva uma carta de apresentação em Markdown para a seguinte vaga:
**Cargo Alvo:** ${targetRole}
**Empresa Destino:** ${company || "Empresa de Tecnologia"}

Utilize o histórico de experiências resumido para criar conexões sólidas de valor:
${JSON.stringify(experiences, null, 2)}

Diretrizes:
- Escreva em tom profissional, respeitoso e confiante.
- Divida em: Saudação, Introdução atraente, Parágrafos de desenvolvimento destacando conquistas técnicas e resultados do histórico, Conclusão com chamada para conversa, e Assinatura.
- Mantenha o texto com cerca de 300 a 400 palavras.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ letter: response.text });
  } catch (error: any) {
    console.error("Erro na API /api/gemini/cover-letter:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar carta de apresentação." });
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

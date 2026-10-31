require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORTA = 3000;

app.use(express.json({ limit: "50kb" }));
app.use(express.static(__dirname, { dotfiles: "deny" }));

const chave = process.env.GEMINI_API_KEY;

const ai = chave ? new GoogleGenAI({ apiKey: chave }) : null;

app.get("/status", (req, res) => {
  res.json({
    funcionando: true,
    projeto: "Vitrola News"
  });
});

app.post("/api/analisar", async (req, res) => {
  try {
    const noticia = req.body.noticia;

    if (typeof noticia !== "string" || !noticia.trim()) {
      return res.status(400).json({
        erro: "Escreva uma notícia para analisar."
      });
    }

    if (noticia.length > 10000) {
      return res.status(400).json({
        erro: "A notícia é muito longa. Tente enviar um texto menor."
      });
    }

    if (!ai) {
      return res.status(500).json({
        erro: "A chave da inteligência artificial não foi configurada."
      });
    }

    const resposta = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `
Você é o assistente do Vitrola News, um projeto escolar de combate à desinformação.

Analise o texto abaixo com cuidado.

Explique:
1. O que a notícia afirma.
2. Quais evidências são apresentadas ou estão faltando.
3. Se há sinais de alerta, como ausência de fontes identificáveis.
4. O que seria necessário verificar para confirmar a informação.

Não invente fontes, estudos ou evidências. Não declare que algo é falso ou verdadeiro sem provas suficientes. Se o texto não permitir uma conclusão, diga claramente que não há informações suficientes.

Importante: analisar apenas o texto não confirma, por si só, se a notícia é verdadeira.

Responda em português brasileiro, com linguagem clara para estudantes.

NOTÍCIA:
${noticia.trim()}
      `
    });

    res.json({
      resultado: resposta.text || "A IA não retornou uma análise. Tente novamente."
    });

  } catch (erro) {
    console.error("Erro na análise:", erro.message);

    res.status(500).json({
      erro: "Não foi possível analisar a notícia. Verifique a conexão e a configuração da IA."
    });
  }
});

app.listen(PORTA, () => {
  console.log(`Vitrola News rodando em http://localhost:${PORTA}`);
});
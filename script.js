const caixaNoticia = document.getElementById("noticia");
const botaoVerificar = document.getElementById("verificar");
const resultado = document.getElementById("resultado");
const carregamento = document.getElementById("carregamento");
const avisoIA = document.getElementById("avisoIA");

botaoVerificar.addEventListener("click", async function() {
  const noticia = caixaNoticia.value.trim();

  if (noticia === "") {
    resultado.textContent = "Escreva uma notícia para analisar.";
    carregamento.classList.add("escondido");
    avisoIA.classList.add("escondido");
    return;
  }

  botaoVerificar.disabled = true;
  resultado.textContent = "";
  avisoIA.classList.add("escondido");
  carregamento.classList.remove("escondido");

  try {
    resultado.textContent = "A inteligência artificial está analisando...";

    const resposta = await fetch("/api/analisar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        noticia: noticia
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Não foi possível analisar a notícia.");
    }

    resultado.textContent = dados.resultado;
    avisoIA.classList.remove("escondido");

  } catch (erro) {
    console.error("Erro:", erro);

    resultado.textContent =
      erro.message === "Failed to fetch"
        ? "Não consegui conectar ao servidor. Verifique se ele está funcionando."
        : erro.message || "Não foi possível analisar a notícia. Tente novamente.";

  } finally {
    carregamento.classList.add("escondido");
    botaoVerificar.disabled = false;
  }
});
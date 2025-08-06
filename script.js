const apiKeyInput = document.getElementById('apiKey')
const filmSelect = document.getElementById('filmSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}
//AIzaSyAem6U2lZC7CAcPNHwK4OEnH0xyiilUdvo
const perguntarAI =async (question, film, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de meta para o filme ${film}

        ## Tarefa
        Responder o que foi pedido para sem linguagem difícil

        ## Regras 
        - Se voce não sabe a resposta, apenas fale que não sabe.
        - Se a pergunta for fora do contexto 'filme', fale 'Essa pergunta não está relacionada a filmes'.
        - Considere a data atual ${new Date().toLocaleDateString()}.
        - Faça pesquisas atualizadas.
        - Nunca responda sobre detalhes que você não tenha certeza se realmente acontecem no filme.
        - Dê avisos de spoiler apenas com "⚠️ **Aviso de spoiler** ⚠️", só coloque quando houver resumo do filme ou sinopse.
        - Sobre a sinopse: procure no próprio site do produtor do filme e resuma em  até 300 caracteres. 
        - Resuma os comentários da crítica do filme em até 200 caracteres.
        - Coloque o alerta de spoiler abaixo do nome do filme 
        - Sempre coloque o ano que o filme foi lançado
        - Cite se as continuações do filme, se houver.

        ## Respostas 
        - Busque responder de forma resumida e direito ao ponto. 
        - Sobre as críticas e classificações dos filmes: pegue do site "Rotten Tomatoes".
        - Simbolize a  classificação  com "⭐️" de acordo com a classificação do filme seguido do número da crítica de 0 a 5

        ## Exemplo de resposta
        Pergunta do usuário: Qual é a sinopse do filme?
        Resposta: **🎥Nome do filme: + Ano em que foi lançado**\n\n Aviso de spoiler\n\n **🍿Sinopse:**\n\n  **▶️Continuações: **✍️Crítica do filme:**\n\n **Classificação da crítica:**

        Pergunta do usuário: Quais são os principais atores do filme?
        Resposta:**🎥Nome do filme: + Ano em que foi lançado**\n\n **🎬Principais atores:**\n\n **✍️Resumo da crítica sobre os atores:**

        Pergunta do usuário: Qual a principal mensagem do filme? 
        Resposta: **🎥Nome do filme: + Ano em que foi lançado** **🎫Principal mensagem do filme:**
    
        ___
        Aqui está a pergunta do usuário: ${question}

    `
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamda API
    const response =await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const film = filmSelect.value
    const question = questionInput.value



    if (apiKey == '' || film == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        //Perguntar para IA
       const text = await perguntarAI(question, film, apiKey)
       aiResponse.querySelector('.reponse-content').innerHTML =markdownToHTML(text)
       aiResponse.classList.remove('hidden')

    } catch(error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)
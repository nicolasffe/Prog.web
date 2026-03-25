const formulario = document.querySelector("#formTarefa");
const campoNome = document.querySelector("#nomeTarefa");
const campoCategoria = document.querySelector("#categoriaTarefa");
const campoPrioridade = document.querySelector("#prioridadeTarefa");
const campoData = document.querySelector("#dataTarefa");
const mensagemFormulario = document.querySelector("#mensagemFormulario");
const listaTarefas = document.querySelector("#listaTarefas");
const filtroCategoria = document.querySelector("#filtroCategoria");
const ordenacaoTarefas = document.querySelector("#ordenacaoTarefas");
const totalPendentes = document.querySelector("#totalPendentes");
const totalConcluidas = document.querySelector("#totalConcluidas");
const botaoTema = document.querySelector("#alternarTema");

const chaveTarefas = "agenda_tarefas";
const chaveTema = "agenda_tarefas_tema";

const prioridadeTexto = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
};

const ordemPrioridade = {
    alta: 0,
    media: 1,
    baixa: 2
};

let tarefas = carregarTarefas();
let temaAtual = carregarTema();

// puxa do navegador as tarefas que já tinham sido salvas antes.
function carregarTarefas() {
    const dados = localStorage.getItem(chaveTarefas);

    if (!dados) {
        return [];
    }

    try {
        const tarefasSalvas = JSON.parse(dados);
        return Array.isArray(tarefasSalvas) ? tarefasSalvas.map(normalizarTarefaSalva) : [];
    } catch (erro) {
        return [];
    }
}

// ajusta alguns textos antigos que possam ter ficado salvos sem acento.
function normalizarTarefaSalva(tarefa) {
    const categorias = {
        Saude: "Saúde"
    };

    return {
        ...tarefa,
        categoria: categorias[tarefa.categoria] || tarefa.categoria
    };
}

// recupera o tema salvo pra página abrir do mesmo jeito da última vez.
function carregarTema() {
    return localStorage.getItem(chaveTema) || "claro";
}

// salva a lista inteira de tarefas no localStorage.
function salvarTarefas() {
    localStorage.setItem(chaveTarefas, JSON.stringify(tarefas));
}

// guarda o tema atual no navegador.
function salvarTema() {
    localStorage.setItem(chaveTema, temaAtual);
}

// converte a data do input para o formato brasileiro.
function formatarData(dataTexto) {
    if (!dataTexto) {
        return "";
    }

    const [ano, mes, dia] = dataTexto.split("-").map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));

    // aqui eu forcei pt-BR pra data sempre sair no nosso padrão e não variar pelo navegador.
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC"
    }).format(data);
}

// escapa caracteres especiais antes de montar html com texto digitado.
function escaparHtml(texto) {
    const mapa = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return texto.replace(/[&<>"']/g, (caractere) => mapa[caractere]);
}

// mostra uma mensagem rápida no formulário, com estilo de erro ou sucesso.
function mostrarMensagem(texto, tipo = "") {
    mensagemFormulario.textContent = texto;
    mensagemFormulario.className = "mensagem-formulario";

    if (tipo) {
        mensagemFormulario.classList.add(tipo);
    }
}

// confere se a tarefa foi preenchida direitinho antes de salvar.
function validarTarefa(tarefa) {
    if (!tarefa.nome.trim()) {
        return "Digite o nome da tarefa antes de adicionar.";
    }

    if (!tarefa.categoria) {
        return "Escolha uma categoria para a tarefa.";
    }

    if (!tarefa.prioridade) {
        return "Falta definir a prioridade.";
    }

    if (!tarefa.dataLimite) {
        return "Escolha a data limite para não deixar passar.";
    }

    return "";
}

// monta o objeto da nova tarefa com os dados do formulario.
function criarTarefa() {
    return {
        id: Date.now(),
        nome: campoNome.value.trim(),
        categoria: campoCategoria.value,
        prioridade: campoPrioridade.value,
        dataLimite: campoData.value,
        concluida: false,
        criadaEm: new Date().toISOString()
    };
}

// filtra a lista conforme a categoria selecionada.
function aplicarFiltros(lista) {
    const categoriaEscolhida = filtroCategoria.value;

    if (categoriaEscolhida === "todas") {
        return [...lista];
    }

    return lista.filter((tarefa) => tarefa.categoria === categoriaEscolhida);
}

// organiza as tarefas pela ordem escolhida no select.
function ordenarLista(lista) {
    const copia = [...lista];
    const tipoOrdenacao = ordenacaoTarefas.value;

    if (tipoOrdenacao === "prioridade") {
        return copia.sort((a, b) => {
            const prioridadeA = ordemPrioridade[a.prioridade];
            const prioridadeB = ordemPrioridade[b.prioridade];

            if (prioridadeA !== prioridadeB) {
                return prioridadeA - prioridadeB;
            }

            return new Date(a.dataLimite) - new Date(b.dataLimite);
        });
    }

    if (tipoOrdenacao === "data") {
        return copia.sort((a, b) => new Date(a.dataLimite) - new Date(b.dataLimite));
    }

    return copia.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm));
}

// cria o card visual de cada tarefa para jogar na tela.
function montarCard(tarefa) {
    const card = document.createElement("article");
    card.className = `caixa card-tarefa prioridade-${tarefa.prioridade}`;
    const statusTexto = tarefa.concluida ? "Concluída" : "Pendente";
    const classeStatus = tarefa.concluida ? "tag-status-concluida" : "tag-status-pendente";

    if (tarefa.concluida) {
        card.classList.add("concluida");
    }

    // isso aqui escapa o texto antes de jogar no card.
    card.innerHTML = `
        <div class="cabecalho-card">
            <div>
                <h3 class="titulo-tarefa">${escaparHtml(tarefa.nome)}</h3>
                <p class="linha-info">Prazo: ${formatarData(tarefa.dataLimite)}</p>
            </div>
            <span class="tag tag-categoria">${escaparHtml(tarefa.categoria)}</span>
        </div>
        <div class="metas-card">
            <span class="tag tag-prioridade-${tarefa.prioridade}">${prioridadeTexto[tarefa.prioridade]}</span>
            <span class="tag ${classeStatus}">${statusTexto}</span>
        </div>
        <div class="acoes-card">
            <button class="botao-acao botao-concluir" type="button" data-acao="concluir" data-id="${tarefa.id}">
                ${tarefa.concluida ? "Reabrir" : "Concluir"}
            </button>
            <button class="botao-acao botao-excluir" type="button" data-acao="excluir" data-id="${tarefa.id}">
                Excluir
            </button>
        </div>
    `;

    return card;
}

// mostra a mensagem quando não existir tarefa para renderizar.
function renderizarEstadoVazio() {
    const estadoVazio = document.createElement("article");
    estadoVazio.className = "caixa estado-vazio";
    estadoVazio.innerHTML = `
        <h3>Nenhuma tarefa encontrada</h3>
        <p>
            Se a lista estiver vazia, adicione uma nova tarefa. Se já houver itens cadastrados,
            tente mudar o filtro ou a ordenação.
        </p>
    `;

    listaTarefas.appendChild(estadoVazio);
}

// recalcula os totais de pendentes e concluídas.
function atualizarResumo() {
    const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
    const pendentes = tarefas.length - concluidas;

    totalPendentes.textContent = String(pendentes);
    totalConcluidas.textContent = String(concluidas);
}

// redesenha a lista inteira aplicando filtro, ordem e estado vazio.
function renderizarTarefas() {
    listaTarefas.innerHTML = "";

    const tarefasFiltradas = ordenarLista(aplicarFiltros(tarefas));

    if (!tarefasFiltradas.length) {
        renderizarEstadoVazio();
        atualizarResumo();
        return;
    }

    tarefasFiltradas.forEach((tarefa) => {
        listaTarefas.appendChild(montarCard(tarefa));
    });

    atualizarResumo();
}

// limpa o formulário depois do cadastro e devolve o foco para o primeiro campo.
function limparFormulario() {
    formulario.reset();
    campoNome.focus();
}

// pega os dados do formulário, valida e adiciona a tarefa na lista.
function adicionarTarefa(evento) {
    evento.preventDefault();

    const novaTarefa = criarTarefa();
    const erro = validarTarefa(novaTarefa);

    if (erro) {
        mostrarMensagem(erro, "erro");
        return;
    }

    tarefas.unshift(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
    limparFormulario();
    mostrarMensagem("Tarefa adicionada com sucesso.", "sucesso");
}

// troca o status da tarefa entre concluída e pendente.
function alternarConclusao(idTarefa) {
    tarefas = tarefas.map((tarefa) => {
        if (tarefa.id !== idTarefa) {
            return tarefa;
        }

        return {
            ...tarefa,
            concluida: !tarefa.concluida
        };
    });

    salvarTarefas();
    renderizarTarefas();
}

// remove uma tarefa da lista pelo id.
function excluirTarefa(idTarefa) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== idTarefa);
    salvarTarefas();
    renderizarTarefas();
}

// aplica visualmente o tema atual na página e no botão.
function aplicarTema() {
    document.body.classList.toggle("tema-escuro", temaAtual === "escuro");
    botaoTema.textContent = temaAtual === "escuro" ? "Voltar para o modo claro" : "Ativar modo escuro";
}

// alterna entre claro e escuro e salva essa escolha.
function trocarTema() {
    temaAtual = temaAtual === "escuro" ? "claro" : "escuro";
    salvarTema();
    aplicarTema();
}

// decide qual ação foi clicada dentro de um card da lista.
function lidarCliqueNaLista(evento) {
    const botao = evento.target.closest("button[data-acao]");

    if (!botao) {
        return;
    }

    const idTarefa = Number(botao.dataset.id);
    const acao = botao.dataset.acao;

    if (acao === "concluir") {
        alternarConclusao(idTarefa);
        return;
    }

    excluirTarefa(idTarefa);
}

// sobe a aplicação com tema, lista inicial e foco no formulário.
function iniciar() {
    // já deixo o foco no primeiro campo porque agiliza quando a pessoa quer sair cadastrando várias seguidas.
    aplicarTema();
    renderizarTarefas();
    campoNome.focus();
}

formulario.addEventListener("submit", adicionarTarefa);
filtroCategoria.addEventListener("change", renderizarTarefas);
ordenacaoTarefas.addEventListener("change", renderizarTarefas);
listaTarefas.addEventListener("click", lidarCliqueNaLista);
botaoTema.addEventListener("click", trocarTema);

iniciar();

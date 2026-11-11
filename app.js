
let vendas = WendyStorage.obterVendas();

const elementoProduto = document.getElementById("produto");
const elementoQuantidade = document.getElementById("quantidade");
const elementoFrete = document.getElementById("tem-frete");
const botaoRegistrar = document.getElementById("registrar-venda");

// Formatação de valores em reais
function moeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Preencher catálogo
function carregarProdutos() {
    elementoProduto.innerHTML = "";

    PRODUCTS.forEach(produto => {
        const option = document.createElement("option");

        option.value = produto.id;

        option.textContent =
            produto.preco === null
                ? `${produto.nome} (configurar)`
                : `${produto.nome} — ${moeda(produto.preco)}`;

        elementoProduto.appendChild(option);
    });
}

// Registrar venda
function registrarVenda() {
    const id = elementoProduto.value;
    const produto = PRODUCTS.find(p => p.id === id);

    const quantidade = Number(elementoQuantidade.value);

    if (!produto) return;

    if (produto.preco === null || produto.custo === null) {
        alert("Configure o preço e o custo deste produto primeiro!");
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        alert("Informe uma quantidade válida.");
        return;
    }

    const temFrete = elementoFrete.checked;

    const venda = {
        id: Date.now(),
        produto: produto.nome,
        quantidade: quantidade,

        preco: produto.preco,
        custo: produto.custo,

        total: produto.preco * quantidade,
        custoTotal: produto.custo * quantidade,
        lucro: (produto.preco - produto.custo) * quantidade,

        temFrete: temFrete,
        freteCobrado: temFrete ? FRETE.cobrado : 0,
        freteCusto: temFrete ? FRETE.custo : 0,
        lucroFrete: temFrete
            ? FRETE.cobrado - FRETE.custo
            : 0,

        data: new Date().toISOString()
    };

    vendas.push(venda);

    WendyStorage.salvarVendas(vendas);

    elementoQuantidade.value = 1;
    elementoFrete.checked = false;

    atualizarPainel();
}

// Atualizar indicadores financeiros
function atualizarPainel() {
    const totais = vendas.reduce((acc, venda) => {
        acc.vendas += venda.total + venda.freteCobrado;
        acc.custos += venda.custoTotal;
        acc.lucro += venda.lucro + venda.lucroFrete;
        acc.frete += venda.freteCusto;

        return acc;
    }, {
        vendas: 0,
        custos: 0,
        lucro: 0,
        frete: 0
    });

    document.getElementById("total-vendas").textContent =
        moeda(totais.vendas);

    document.getElementById("total-custos").textContent =
        moeda(totais.custos);

    document.getElementById("total-lucro").textContent =
        moeda(totais.lucro);

    document.getElementById("total-frete").textContent =
        moeda(totais.frete);

    atualizarHistorico();
}

// Mostrar histórico
function atualizarHistorico() {
    const historico = document.getElementById("historico");

    historico.innerHTML = "";

    if (vendas.length === 0) {
        historico.innerHTML =
            '<p class="empty">Nenhuma venda registrada ainda.</p>';
        return;
    }

    [...vendas].reverse().forEach(venda => {
        const item = document.createElement("div");
        item.className = "sale";

        const informacoes = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent =
            `${venda.quantidade}x ${venda.produto}`;

        const detalhes = document.createElement("small");
        detalhes.textContent =
            `${new Date(venda.data).toLocaleString("pt-BR")} • ${moeda(venda.total + venda.freteCobrado)}`;

        informacoes.append(nome, detalhes);

        const excluir = document.createElement("button");
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirVenda(venda.id));

        item.append(informacoes, excluir);
        historico.appendChild(item);
    });
}

// Excluir venda e recalcular tudo
function excluirVenda(id) {
    const confirmar = confirm("Deseja excluir esta venda?");

    if (!confirmar) return;

    vendas = vendas.filter(venda => venda.id !== id);

    WendyStorage.salvarVendas(vendas);

    atualizarPainel();
}

// Inicialização
botaoRegistrar.addEventListener("click", registrarVenda);

carregarProdutos();
atualizarPainel();

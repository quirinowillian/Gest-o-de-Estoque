// Função para carregar produtos do LocalStorage
function carregarProdutos() {
    return JSON.parse(localStorage.getItem("estoque")) || [];
}

// Função para salvar produtos no LocalStorage
function salvarProdutos(produtos) {
    localStorage.setItem("estoque", JSON.stringify(produtos));
}

// Função para adicionar um novo produto
function adicionarProduto(nome, quantidade, validade, lote) {
    let produtos = carregarProdutos();
    produtos.push({ nome, quantidade, validade, lote });
    salvarProdutos(produtos);
}

// Função para remover um produto
function removerProduto(index) {
    let produtos = carregarProdutos();
    produtos.splice(index, 1);
    salvarProdutos(produtos);
    exibirProdutos();
}

// Função para listar todos os produtos ordenados por validade e nome
function listarProdutos() {
    return carregarProdutos().sort((a, b) => {
        let validadeA = new Date(a.validade);
        let validadeB = new Date(b.validade);
        
        if (validadeA - validadeB !== 0) {
            return validadeA - validadeB; // Ordenação por validade
        }

        return a.nome.localeCompare(b.nome); // Ordenação por nome
    });
}

// Função para exibir produtos nos contêineres
function exibirProdutos() {
    let produtos = listarProdutos();
    let hoje = new Date();

    let listaValidos = document.getElementById("listaValidos");
    let listaProximoVencer = document.getElementById("listaProximoVencer");
    let listaVencidos = document.getElementById("listaVencidos");

    listaValidos.innerHTML = "";
    listaProximoVencer.innerHTML = "";
    listaVencidos.innerHTML = "";

    produtos.forEach((produto, index) => {
        let dataValidade = new Date(produto.validade);
        let diferencaDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
        let classe = "";
        let mensagem = "";

        if (diferencaDias < 0) {
            classe = "vencido";
            mensagem = "Produto vencido!";
        } else if (diferencaDias === 0) {
            classe = "proximo-vencer";
            mensagem = "Vence hoje!";
        } else if (diferencaDias <= 7) {
            classe = "proximo-vencer";
            mensagem = `Vence em ${diferencaDias} dias!`;
        } else {
            classe = "valido";
            mensagem = "Produto válido";
        }

        let row = `<div class="col-md-4 mb-3">
            <div class="card ${classe}">
                <div class="card-body">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p>Quantidade: ${produto.quantidade}</p>
                    <p>Validade: ${produto.validade} <br> <small class="text-danger">${mensagem}</small></p>
                    <p>Lote: ${produto.lote}</p>
                    <button class="btn btn-danger btn-sm" onclick="removerProduto(${index})"><i class="fas fa-trash-alt"></i> Remover</button>
                </div>
            </div>
        </div>`;

        // Distribuir os produtos nos contêineres correspondentes
        if (classe === "vencido") {
            listaVencidos.innerHTML += row;
        } else if (classe === "proximo-vencer") {
            listaProximoVencer.innerHTML += row;
        } else {
            listaValidos.innerHTML += row;
        }
    });
}

// Função para adicionar produto pela UI
function adicionarProdutoUI() {
    let nome = document.getElementById("nome").value;
    let quantidade = parseInt(document.getElementById("quantidade").value);
    let validade = document.getElementById("validade").value;
    let lote = document.getElementById("lote").value;

    let hoje = new Date().toISOString().split('T')[0];
    if (validade < hoje) {
        alert("Erro: Você não pode adicionar um produto já vencido!");
        return;
    }

    if (nome && quantidade > 0 && validade && lote) {
        adicionarProduto(nome, quantidade, validade, lote);
        exibirProdutos();
    }
}

// Exibir produtos ao carregar a página
document.addEventListener("DOMContentLoaded", exibirProdutos);

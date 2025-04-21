// Função para adicionar o produto via interface
function adicionarProdutoUI() {
    const codigo = document.getElementById("codigo").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const fabricacao = document.getElementById("fabricacao").value;
    const validade = document.getElementById("validade").value;
    const unidade = document.getElementById("unidade").value.trim();
    const lote = document.getElementById("lote").value.trim();

    // Validação para garantir que todos os campos sejam preenchidos
    if (!codigo || !nome || !quantidade || !fabricacao || !validade || !unidade || !lote) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const produto = { codigo, nome, quantidade: parseInt(quantidade), fabricacao, validade, unidade, lote };
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    produtos.push(produto);
    localStorage.setItem("produtos", JSON.stringify(produtos));

    atualizarListaProdutos();
    atualizarRelatorios();
    limparCampos();
}

// Função para atualizar a lista de produtos na interface
function atualizarListaProdutos() {
    const listaProdutos = document.getElementById("listaProdutos");
    listaProdutos.innerHTML = ""; // Limpa a lista de produtos
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    produtos.forEach((produto, index) => {
        // Atribui um valor padrão caso algum campo esteja vazio
        const codigo = produto.codigo || "N/A";
        const nome = produto.nome || "N/A";
        const quantidade = produto.quantidade || "0";
        const fabricacao = produto.fabricacao || "N/A";
        const validade = produto.validade || "N/A";
        const unidade = produto.unidade || "N/A";
        const lote = produto.lote || "N/A";
        
        // Cria a linha da tabela com os dados do produto
        const row = `<tr>
            <td>${codigo}</td>
            <td>${nome}</td>
            <td>${fabricacao}</td>
            <td>${validade}</td>
            <td>${lote}</td>
            <td>${unidade}</td>
            <td>${quantidade}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="removerProduto(${index})">Remover</button>
            </td>
        </tr>`;
        
        listaProdutos.innerHTML += row; // Adiciona a linha na tabela
    });
}

// Função para preparar a edição de um produto
function prepararEdicao(index) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    let produto = produtos[index];
    
    document.getElementById("codigo").value = produto.codigo;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("fabricacao").value = produto.fabricacao;
    document.getElementById("validade").value = produto.validade;
    document.getElementById("unidade").value = produto.unidade;
    document.getElementById("lote").value = produto.lote;
    
    document.getElementById("btnSalvar").onclick = function() {
        editarProduto(index);
    };
}

// Função para editar um produto existente
function editarProduto(index) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    
    produtos[index] = {
        codigo: document.getElementById("codigo").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        quantidade: parseInt(document.getElementById("quantidade").value.trim()),
        fabricacao: document.getElementById("fabricacao").value,
        validade: document.getElementById("validade").value,
        unidade: document.getElementById("unidade").value.trim(),
        lote: document.getElementById("lote").value.trim()
    };
    
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarListaProdutos();
    atualizarRelatorios();
    limparCampos();
}

// Função para remover um produto da lista
function removerProduto(index) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarListaProdutos();
   

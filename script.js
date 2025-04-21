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

    // Ordenar produtos por nome
    produtos.sort((a, b) => a.nome.localeCompare(b.nome));

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
    atualizarRelatorios();
}

// Função para limpar os campos após adicionar/editar um produto
function limparCampos() {
    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("fabricacao").value = "";
    document.getElementById("validade").value = "";
    document.getElementById("unidade").value = "";
    document.getElementById("lote").value = "";
}

// Função para atualizar relatórios de produtos
function atualizarRelatorios() {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    let totalProdutos = produtos.length;
    let produtosVencidos = produtos.filter(produto => new Date(produto.validade) < new Date()).length;
    let produtosProximos = produtos.filter(produto => new Date(produto.validade) <= new Date(new Date().setDate(new Date().getDate() + 30))).length;

    document.getElementById("totalProdutos").textContent = totalProdutos;
    document.getElementById("produtosVencidos").textContent = produtosVencidos;
    document.getElementById("produtosProximos").textContent = produtosProximos;
}

// Função para importar planilha Excel
function importarPlanilha(event) {
    let file = event.target.files[0];
    if (!file) return;
    
    let reader = new FileReader();
    reader.onload = function(e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet);
        
        rows.forEach(row => {
            let produto = {
                codigo: row["Código"],
                nome: row["Nome"],
                quantidade: row["Quantidade"],
                fabricacao: row["Fabricação"],
                validade: row["Validade"],
                unidade: row["Unidade"],
                lote: row["Lote"]
            };
            adicionarProduto(produto);
        });
    };
    reader.readAsBinaryString(file);
}

// Função para exportar os produtos para Excel
function exportarParaExcel() {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    let ws = XLSX.utils.json_to_sheet(produtos);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    XLSX.writeFile(wb, "produtos.xlsx");
}

// Função para exportar os produtos para Word
function exportarParaWord() {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    let doc = new Document();
    
    let table = new Table({
        rows: produtos.map(produto => [
            new TableCell({ children: [new TextRun(produto.codigo)] }),
            new TableCell({ children: [new TextRun(produto.nome)] }),
            new TableCell({ children: [new TextRun(produto.fabricacao)] }),
            new TableCell({ children: [new TextRun(produto.validade)] }),
            new TableCell({ children: [new TextRun(produto.lote)] }),
            new TableCell({ children: [new TextRun(produto.unidade)] }),
            new TableCell({ children: [new TextRun(produto.quantidade.toString())] })
        ])
    });
    
    doc.addSection({
        children: [table]
    });
    
    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "produtos.docx");
    });
}

// Função para buscar um produto na lista
function buscarProduto() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const filteredProdutos = produtos.filter(produto => produto.nome.toLowerCase().includes(searchTerm));
    
    const listaProdutos = document.getElementById("listaProdutos");
    listaProdutos.innerHTML = "";
    
    filteredProdutos.forEach(produto => {
        const row = `<tr>
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.fabricacao}</td>
            <td>${produto.validade}</td>
            <td>${produto.lote}</td>
            <td>${produto.unidade}</td>
            <td>${produto.quantidade}</td>
        </tr>`;
        listaProdutos.innerHTML += row;
    });
}

// Carregar produtos ao inicializar
document.addEventListener("DOMContentLoaded", () => {
    atualizarListaProdutos();
    atualizarRelatorios();
});

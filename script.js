function adicionarProdutoUI() {
    const codigo = document.getElementById("codigo").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const fabricacao = document.getElementById("fabricacao").value;
    const validade = document.getElementById("validade").value;
    const unidade = document.getElementById("unidade").value.trim();
    const lote = document.getElementById("lote").value.trim();

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

function atualizarListaProdutos() {
    const listaProdutos = document.getElementById("listaProdutos");
    listaProdutos.innerHTML = "";
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    produtos.forEach((produto, index) => {
        const row = `<tr>
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.fabricacao}</td>
            <td>${produto.validade}</td>
            <td>${produto.unidade}</td>
            <td>${produto.lote}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="removerProduto(${index})">Remover</button>
            </td>
        </tr>`;
        listaProdutos.innerHTML += row;
    });
}

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

function removerProduto(index) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarListaProdutos();
    atualizarRelatorios();
}

function atualizarRelatorios() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    document.getElementById("totalProdutos").innerText = produtos.length;
    const hoje = new Date().toISOString().split("T")[0];
    const vencidos = produtos.filter(p => p.validade < hoje).length;
    const proximos = produtos.filter(p => p.validade >= hoje && new Date(p.validade) <= new Date(hoje).setDate(new Date(hoje).getDate() + 30)).length;
    document.getElementById("produtosVencidos").innerText = vencidos;
    document.getElementById("produtosProximos").innerText = proximos;
}

function limparCampos() {
    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("fabricacao").value = "";
    document.getElementById("validade").value = "";
    document.getElementById("unidade").value = "";
    document.getElementById("lote").value = "";
}
function exportarParaExcel() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    if (produtos.length === 0) {
        alert("Nenhum produto para exportar.");
        return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(produtos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
    
    XLSX.writeFile(workbook, "relatorio_estoque.xlsx");
}

function exportarParaWord() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    if (produtos.length === 0) {
        alert("Nenhum produto para exportar.");
        return;
    }
    
    let conteudo = "RELATÓRIO DE ESTOQUE\n\n";
    conteudo += "Código\tNome\tQuantidade\tFabricação\tValidade\tUN\tLote\n";
    produtos.forEach(produto => {
        conteudo += `${produto.codigo}\t${produto.nome}\t${produto.quantidade}\t${produto.fabricacao}\t${produto.validade}\t${produto.unidade}\t${produto.lote}\n`;
    });
    
    const blob = new Blob([conteudo], { type: "application/msword" });
    saveAs(blob, "relatorio_estoque.doc");
}

function importarPlanilha(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        json.forEach(item => {
            produtos.push({
                codigo: item.Código || "",
                nome: item["Nome do Produto"] || "",
                quantidade: parseInt(item.Quantidade) || 0,
                fabricacao: item.Fabricação || "",
                validade: item.Validade || "",
                unidade: item.UN || "",
                lote: item.Lote || ""
            });
        });
        
        localStorage.setItem("produtos", JSON.stringify(produtos));
        atualizarListaProdutos();
        atualizarRelatorios();
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById("uploadExcel").addEventListener("change", importarPlanilha);

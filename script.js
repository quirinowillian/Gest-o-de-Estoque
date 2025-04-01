// Função para adicionar o produto na lista
function adicionarProdutoUI() {
    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const quantidade = document.getElementById('quantidade').value;
    const fabricacao = document.getElementById('fabricacao').value;
    const validade = document.getElementById('validade').value;
    const unidade = document.getElementById('unidade').value;
    const lote = document.getElementById('lote').value;

    if (!codigo || !nome || !quantidade || !fabricacao || !validade || !unidade || !lote) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${codigo}</td>
        <td>${nome}</td>
        <td>${quantidade}</td>
        <td>${fabricacao}</td>
        <td>${validade}</td>
        <td>${unidade}</td>
        <td>${lote}</td>
    `;

    document.getElementById('listaProdutos').appendChild(novaLinha);

    // Atualizar os relatórios
    atualizarRelatorios();

    // Limpar os campos
    document.getElementById('codigo').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('fabricacao').value = '';
    document.getElementById('validade').value = '';
    document.getElementById('unidade').value = '';
    document.getElementById('lote').value = '';
}

// Função para atualizar os relatórios
function atualizarRelatorios() {
    let total = 0;
    let vencidos = 0;
    let proximos = 0;

    const produtos = document.querySelectorAll('#listaProdutos tr');

    produtos.forEach(produto => {
        const tdValidade = produto.cells[4];
        const validade = new Date(tdValidade.innerText);

        total++;

        // Verificar vencidos e próximos de vencer
        if (validade < new Date()) {
            vencidos++;
            produto.classList.add('vencido');
        } else if (validade < new Date(new Date().setDate(new Date().getDate() + 30))) {
            proximos++;
            produto.classList.add('proximo');
        }
    });

    document.getElementById('totalProdutos').textContent = total;
    document.getElementById('produtosVencidos').textContent = vencidos;
    document.getElementById('produtosProximos').textContent = proximos;
}

// Função de busca de produto
function buscarProduto() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const produtos = document.querySelectorAll('#listaProdutos tr');

    produtos.forEach(produto => {
        const nomeProduto = produto.cells[1].innerText.toLowerCase();
        if (nomeProduto.includes(searchTerm)) {
            produto.style.display = '';
        } else {
            produto.style.display = 'none';
        }
    });
}

// Função para exportar para Excel
function exportarParaExcel() {
    let tabela = document.querySelector("table");
    let wb = XLSX.utils.table_to_book(tabela, {sheet:"Relatório"});
    XLSX.writeFile(wb, "Relatorio_Estoque.xlsx");
}

// Função para exportar para Word
function exportarParaWord() {
    let tabela = document.querySelector("table").outerHTML;
    let logo = '<img src="download.png" style="max-width: 150px;">';
    let conteudo = `
        <html>
        <head><meta charset='UTF-8'></head>
        <body>
            ${logo}
            <h2>Relatório de Controle de Estoque</h2>
            ${tabela}
        </body>
        </html>
    `;
    let blob = new Blob(['\ufeff', conteudo], {type: 'application/msword'});
    saveAs(blob, "Relatorio_Estoque.doc");
}


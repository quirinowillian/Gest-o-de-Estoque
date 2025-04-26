// Array para armazenar os produtos
let produtos = [];

// Função para carregar a página
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    atualizarEstatisticas();
});

// Função para importar planilha
function importarPlanilha() {
    const fileInput = document.getElementById('uploadExcel');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um arquivo primeiro!');
        return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        alert('Por favor, selecione um arquivo Excel (.xlsx) ou CSV.');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (jsonData.length === 0 || !verificarColunas(jsonData)) {
                alert('Planilha vazia ou com formato incorreto!');
                return;
            }

            produtos = [];
            jsonData.forEach(item => {
                const produto = processarProduto(item);
                if (produto) produtos.push(produto);
            });

            // Ordenação alfabética por nome do produto
            produtos.sort((a, b) => a.nome.localeCompare(b.nome));

            salvarProdutos();
            carregarProdutos();
            atualizarEstatisticas();
            alert(`Importados ${produtos.length} produtos com sucesso!`);
            
        } catch (error) {
            console.error('Erro na importação:', error);
            alert('Erro ao importar o arquivo. Verifique o formato e tente novamente.');
        }
    };
    
    reader.onerror = function() {
        alert('Erro ao ler o arquivo. Tente novamente.');
    };
    
    reader.readAsArrayBuffer(file);
}

// Função para formatar datas
function formatarData(data) {
    if (!data) return '';
    
    // Se for um objeto Date
    if (data instanceof Date) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    
    // Se for string no formato ISO (2024-05-01)
    if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [ano, mes, dia] = data.split(' ')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    // Se for número serial do Excel
    if (!isNaN(data) && data > 0) {
        const date = new Date((data - 25569) * 86400 * 1000);
        return formatarData(date);
    }
    
    // Se já estiver no formato brasileiro
    if (typeof data === 'string' && data.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        return data;
    }
    
    return '';
}

// Processa os dados de cada produto
function processarProduto(item) {
    const codigo = item['Código'] || '';
    const nome = item['Nome'] || '';
    const fabricacao = item['Fabricação'] || '';
    const validade = item['Validade'] || '';
    const lote = item['Lote'] || '';
    const unidade = item['Unidade'] || 'UN';
    const quantidade = item['Quantidade'] || 0;

    if (!codigo || !nome) {
        console.warn('Produto sem código ou nome:', item);
        return null;
    }

    return {
        codigo: codigo.toString().trim(),
        nome: nome.toString().trim(),
        fabricacao: formatarData(fabricacao),
        validade: formatarData(validade),
        lote: lote.toString().trim(),
        unidade: unidade.toString().trim(),
        quantidade: parseInt(quantidade) || 0
    };
}

// Verifica colunas obrigatórias
function verificarColunas(planilha) {
    if (!planilha || planilha.length === 0) return false;
    
    const colunasEsperadas = ['Código', 'Nome', 'Fabricação', 'Validade', 'Lote', 'Unidade', 'Quantidade'];
    const colunasPresentes = Object.keys(planilha[0]);
    const faltando = colunasEsperadas.filter(coluna => !colunasPresentes.includes(coluna));

    if (faltando.length > 0) {
        alert('A planilha está faltando as seguintes colunas: ' + faltando.join(', '));
        return false;
    }
    return true;
}

// Salvar produtos no localStorage
function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
}

// Carregar produtos do localStorage
function carregarProdutos() {
    const dados = localStorage.getItem('produtos');
    if (dados) {
        produtos = JSON.parse(dados);
        atualizarTabela();
    }
}

// Atualizar tabela na interface
function atualizarTabela() {
    const tbody = document.getElementById('listaProdutos');
    tbody.innerHTML = '';
    
    produtos.forEach((produto, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.fabricacao || '-'}</td>
            <td>${produto.validade || '-'}</td>
            <td>${produto.lote}</td>
            <td>${produto.unidade}</td>
            <td>${produto.quantidade}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removerProduto(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    document.getElementById('totalProdutos').textContent = produtos.length;
    
    const hoje = new Date();
    const produtosVencidos = produtos.filter(p => {
        if (!p.validade) return false;
        const [dia, mes, ano] = p.validade.split('/');
        const dataValidade = new Date(ano, mes-1, dia);
        return dataValidade < hoje;
    });
    
    document.getElementById('produtosVencidos').textContent = produtosVencidos.length;
    
    const daqui30Dias = new Date();
    daqui30Dias.setDate(hoje.getDate() + 30);
    
    const produtosProximos = produtos.filter(p => {
        if (!p.validade) return false;
        const [dia, mes, ano] = p.validade.split('/');
        const dataValidade = new Date(ano, mes-1, dia);
        return dataValidade > hoje && dataValidade <= daqui30Dias;
    });
    
    document.getElementById('produtosProximos').textContent = produtosProximos.length;
}

// Função para adicionar produto via interface
function adicionarProdutoUI() {
    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    
    if (!codigo || !nome) {
        alert('Código e Nome são obrigatórios!');
        return;
    }

    const produto = {
        codigo: codigo.toString().trim(),
        nome: nome.toString().trim(),
        fabricacao: document.getElementById('fabricacao').value,
        validade: document.getElementById('validade').value,
        lote: document.getElementById('lote').value.toString().trim(),
        unidade: document.getElementById('unidade').value.toString().trim() || 'UN',
        quantidade: parseInt(document.getElementById('quantidade').value) || 0
    };

    produtos.push(produto);
    produtos.sort((a, b) => a.nome.localeCompare(b.nome));
    salvarProdutos();
    carregarProdutos();
    atualizarEstatisticas();
    
    // Limpar campos
    document.querySelectorAll('#codigo, #nome, #fabricacao, #validade, #lote, #unidade, #quantidade')
        .forEach(input => input.value = '');
}

// Função para remover produto
function removerProduto(index) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
        produtos.splice(index, 1);
        salvarProdutos();
        carregarProdutos();
        atualizarEstatisticas();
    }
}

// Função para buscar produto
function buscarProduto() {
    const termo = document.getElementById('search').value.toLowerCase();
    const linhas = document.getElementById('listaProdutos').getElementsByTagName('tr');
    
    Array.from(linhas).forEach(linha => {
        const textoLinha = linha.textContent.toLowerCase();
        linha.style.display = textoLinha.includes(termo) ? '' : 'none';
    });
}

// Funções para exportação
function exportarParaExcel() {
    if (produtos.length === 0) {
        alert('Não há produtos para exportar!');
        return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(produtos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
    XLSX.writeFile(workbook, "estoque.xlsx");
}

function exportarParaWord() {
    if (produtos.length === 0) {
        alert('Não há produtos para exportar!');
        return;
    }
    
    alert('Exportação para Word ainda não implementada');
}

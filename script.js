// Array para armazenar os produtos
let produtos = [];

// Função para carregar a página
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    atualizarEstatisticas();
});

// Função para importar planilha (VERSÃO CORRIGIDA)
function importarPlanilha() {
    const fileInput = document.getElementById('uploadExcel');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um arquivo primeiro!');
        return;
    }

    // Verifica se o arquivo tem a extensão .xlsx ou .csv
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

            if (!verificarColunas(jsonData)) return; // Verifica se as colunas esperadas estão presentes

            // Processa os dados da planilha
            produtos = [];
            jsonData.forEach(item => {
                const produto = processarProduto(item);
                if (produto) produtos.push(produto);
            });

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

// Função para formatar data (VERSÃO MELHORADA)
function formatarData(data) {
    if (!data) return '';
    
    if (data instanceof Date) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    
    if (typeof data === 'string') {
        if (data.match(/^\d{4}-\d{2}-\d{2}/)) {
            const [ano, mes, dia] = data.split(' ')[0].split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        if (!isNaN(data) && data > 0) {
            const date = new Date((data - 25569) * 86400 * 1000);
            return formatarData(date);
        }
        
        if (data.match(/^\d{2}\/\d{2}\/\d{4}/)) {
            return data;
        }
    }
    
    return '';
}

// Função para processar dados do produto
function processarProduto(item) {
    const codigo = item['Código'] || '';
    const nome = item['Nome'] || '';
    const fabricacao = item['Fabricação'] || '';
    const validade = item['Validade'] || '';
    const lote = item['Lote'] || '';
    const unidade = item['Unidade'] || '';
    const quantidade = item['Quantidade'] || 0;

    if (!codigo || !nome) {
        console.warn('Produto sem código ou nome:', item);
        return null; // Ignora produtos sem código ou nome
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

// Função para verificar se as colunas da planilha estão presentes
function verificarColunas(planilha) {
    const colunasEsperadas = ['Código', 'Nome', 'Fabricação', 'Validade', 'Lote', 'Unidade', 'Quantidade'];
    const colunasPresentes = Object.keys(planilha[0]);
    const faltaColunas = colunasEsperadas.filter(coluna => !colunasPresentes.includes(coluna));

    if (faltaColunas.length > 0) {
        alert('A planilha está faltando as seguintes colunas: ' + faltaColunas.join(', '));
        return false;
    }
    return true;
}

// Função para carregar produtos na tabela

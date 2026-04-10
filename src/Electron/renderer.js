// =============================================
// ARQUIVO: principal.js (ou app.js)
// =============================================

//const API_URL = window.api?.API_URL || ''; usar api depois aquiii

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const taxaEntrega = 5.50;
let desconto = 0;

// ==================== LOGIN ====================
const formLogin = document.getElementById('FormularioLogin');
const formCadastro = document.getElementById('FormularioCadastro');
const btnEntrarAba = document.getElementById('BtnEntrarAba');
const btnCadastroAba = document.getElementById('BtnCadastro');

if (btnCadastroAba && btnEntrarAba) {
    btnCadastroAba.addEventListener('click', () => {
        formLogin.style.display = 'none';
        formCadastro.style.display = 'flex';
        btnCadastroAba.classList.add('active');
        btnEntrarAba.classList.remove('active');
    });

    btnEntrarAba.addEventListener('click', () => {
        formCadastro.style.display = 'none';
        formLogin.style.display = 'flex';
        btnEntrarAba.classList.add('active');
        btnCadastroAba.classList.remove('active');
    });
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Falha na resposta do servidor');
        return await response.json();
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return null;
    }
}

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('EmailLogin').value;
        const password = document.getElementById('SenhaLogin').value;

        const response = await login(email, password);
        if (response) {
            console.log('Login bem-sucedido:', response);
            // Aqui você pode salvar token e redirecionar
        } else {
            alert('Erro ao fazer login. Verifique seu e-mail e senha.');
        }
    });
}

// ==================== CARRINHO ====================
function carregarEndereco() {
    const end = localStorage.getItem('usuario_endereco');
    if (end) {
        const obj = JSON.parse(end);
        const elementoEndereco = document.getElementById('enderecoEntrega');
        if (elementoEndereco) {
            elementoEndereco.textContent = `${obj.rua}, ${obj.numero}`;
        }
    }
}

function renderizarItensCarrinho() {
    const container = document.getElementById('carrinho-itens');
    const vazio = document.getElementById('carrinho-vazio');

    if (!container || !vazio) return;

    if (carrinho.length === 0) {
        vazio.style.display = 'block';
        container.innerHTML = '';
        atualizarTotais();
        return;
    }

    vazio.style.display = 'none';
    container.innerHTML = carrinho.map((item, index) => `
    <div class="item-checkout">
            <img src="${item.imagem || '../img/default.png'}" 
                 width="50" height="50" 
                 style="object-fit: contain; margin-right: 15px;" 
                 alt="${item.nome}">
            <div style="flex: 1;">
                <strong>${item.nome}</strong>
                <span style="color: #2563eb;">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onclick="removerItem(${index})" class="btn-remover">✕</button>
        </div>
    `).join('');
    
     
    atualizarTotais();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarItensCarrinho();
}

function atualizarTotais() {
    const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0);
    const valorDesconto = subtotal * desconto;
    const total = (subtotal + taxaEntrega) - valorDesconto;

    const els = {
        subtotal: document.getElementById('subtotal'),
        desconto: document.getElementById('desconto'),
        total: document.getElementById('total'),
        totalRodape: document.getElementById('total-rodape'),
        btnFinalizar: document.getElementById('btnFinalizar')
    };

    if (els.subtotal) els.subtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (els.desconto) els.desconto.textContent = `- R$ ${valorDesconto.toFixed(2).replace('.', ',')}`;
    if (els.total) els.total.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (els.totalRodape) els.totalRodape.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    if (els.btnFinalizar) {
        els.btnFinalizar.disabled = carrinho.length === 0;
        els.btnFinalizar.style.opacity = carrinho.length === 0 ? "0.5" : "1";
    }
}

function aplicarCupom() {
    const cupom = document.getElementById('inputCupom')?.value.toUpperCase();
    if (cupom === 'GRAGAS10') {
        desconto = 0.10;
        document.getElementById('Cupom-sucedido').style.display = 'block';
        document.getElementById('descontoResumo').style.display = 'flex';
        atualizarTotais();
    } else {
        alert("Cupom inválido");
    }
}

// ==================== FORNECEDOR ====================
const listaProdutos = [
    { id: 1, nome: 'Botijão P13', preco: 129.90, imagem: '../img/botijaop13.png' },
    { id: 2, nome: 'Botijão P45', preco: 389.00, imagem: '../img/botijaop45.png' },
    { id: 3, nome: 'Válvula Gás', preco: 45.00, imagem: '../img/valvula.png' },
    { id: 4, nome: 'Mangueira', preco: 25.00, imagem: '../img/mangueira.png' }
];

function renderizarProdutosFornecedor() {
    const container = document.getElementById('ProdutosLista');
    if (!container) return;

    container.innerHTML = listaProdutos.map(p => `
        <div class="produto-card-item">
            <img src="${p.imagem}" alt="${p.nome}" width="60" height="60">
            <div class="info-produto">
                <strong>${p.nome}</strong>
                <span>R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onclick="add(${p.id})" class="btn-add">+ Adicionar</button>
        </div>
    `).join('');
}

// ==================== LOCALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('cep');
    const enderecoForm = document.getElementById('enderecoForm');

    if (!cepInput) return;

    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.substring(0, 5) + '-' + value.substring(5, 8);
        e.target.value = value;

        if (value.length === 9) {
            buscarEndereco(value.replace('-', ''));
        }
    });

    async function buscarEndereco(cep) {
        const carregarCep = document.getElementById('CarregarCep');
        const erroCep = document.getElementById('ErroCep');
        if (carregarCep) carregarCep.style.display = 'block';
        if (erroCep) erroCep.textContent = '';

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                if (erroCep) erroCep.textContent = 'CEP não encontrado.';
                limparCamposEndereco();
            } else {
                document.getElementById('rua').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
                document.getElementById('numero').focus();
            }
        } catch (error) {
            if (erroCep) erroCep.textContent = 'Erro ao buscar CEP.';
        } finally {
            if (carregarCep) carregarCep.style.display = 'none';
        }
    }

    function limparCamposEndereco() {
        ['rua', 'bairro', 'cidade', 'uf'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }

    if (enderecoForm) {
        enderecoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enderecoCompleto = {
                cep: cepInput.value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                uf: document.getElementById('uf').value
            };

            const textoFormatado = `${enderecoCompleto.rua}, ${enderecoCompleto.numero}`;

            localStorage.setItem('usuario_endereco', JSON.stringify(enderecoCompleto));
            localStorage.setItem('endereco_resumido', textoFormatado);

            const btn = document.getElementById('btnConfirmar');
            if (btn) {
                btn.textContent = 'Salvando...';
                btn.disabled = true;
            }

            setTimeout(() => {
                window.location.href = 'principal.html';
            }, 800);
        });
    }
});

// ==================== PÁGINA PRINCIPAL ====================
let produtos = [];

document.addEventListener('DOMContentLoaded', () => {
    configurarSaudacao();
    carregarEnderecoPrincipal();
    carregarProdutos();
    configurarEventosDrawer();
    renderizarProdutosFornecedor(); // caso esteja na página fornecedor
    renderizarItensCarrinho();      // caso esteja na página carrinho
});

function configurarSaudacao() {
    const saudacaoEl = document.getElementById('saudacao');
    if (!saudacaoEl) return;

    const hora = new Date().getHours();
    if (hora < 12) saudacaoEl.textContent = 'Bom dia! ☀️';
    else if (hora < 18) saudacaoEl.textContent = 'Boa tarde! 👋';
    else saudacaoEl.textContent = 'Boa noite! 🌙';
}

function carregarEnderecoPrincipal() {
    const textoEnd = document.getElementById('');
    if (!textoEnd) return;   // Protege se a página não tiver esse elemento

    const endRaw = localStorage.getItem('usuario_endereco');

    if (endRaw) {
        try {
            const end = JSON.parse(endRaw);
            
            if (end && end.rua && end.numero) {
                textoEnd.textContent = `${end.rua}, ${end.numero}`;
            } else {
                textoEnd.textContent = 'Toque para definir endereço';
                // Opcional: limpa automaticamente se estiver inválido
                // localStorage.removeItem('usuario_endereco');
            }
        } catch (error) {
            console.warn('Endereço corrompido no localStorage. Limpando...');
            localStorage.removeItem('usuario_endereco');
            textoEnd.textContent = 'Toque para definir endereço';
        }
    } else {
        textoEnd.textContent = 'Toque para definir endereço';
    }
}

async function carregarProdutos() {
    produtos = [
        { id: 1, nome: 'Botijão P13', preco: 129.90, imagem: '../img/botijaop13.png' },
        { id: 2, nome: 'Botijão P45', preco: 389.00, imagem: '../img/botijaop45.png' },
        { id: 3, nome: 'Válvula Gás', preco: 45.00, imagem: '../img/valvula.png' },
        { id: 4, nome: 'Mangueira', preco: 25.00, imagem: '../img/mangueira.png' }
    ];
    renderizarProdutos();
}

function renderizarProdutos() {
    const grid = document.getElementById('gridProdutos');
    if (!grid) return;

    grid.innerHTML = produtos.map(p => `
        <div class="card-produto">
            <div class="produto-imagem">
                <img src="${p.imagem}" alt="${p.nome}">
            </div>
            <strong>${p.nome}</strong>
            <p class="preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
            <button class="btn-adicionar" onclick="add(${p.id})">Adicionar</button>
        </div>
    `).join('');
}

function add(id) {
    let prod = produtos.find(p => p.id === id) || listaProdutos.find(p => p.id === id);
    if (!prod) return;

    carrinho.push(prod);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    atualizarCarrinho();
    mostrarToast(`${prod.nome} adicionado!`);
}

function atualizarCarrinho() {
    const badge = document.getElementById('badgeCarrinho');
    const lista = document.getElementById('listaItens');
    const vazio = document.getElementById('carrinhoVazio');
    const totalEl = document.getElementById('valorTotal');
    const subtotalEl = document.getElementById('valorSubtotal');

    if (badge) badge.textContent = carrinho.length;

    if (!lista) return;

    if (carrinho.length === 0) {
        if (vazio) vazio.style.display = 'block';
        lista.innerHTML = '';
    } else {
        if (vazio) vazio.style.display = 'none';
        lista.innerHTML = carrinho.map((item, index) => `
            <div class="item-carrinho">
                <img src="${item.imagem}" width="40" height="40">
                <div style="flex: 1;">
                    <strong>${item.nome}</strong>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                </div>
                <button onclick="remover(${index})" class="btn-remover">✕</button>
            </div>
        `).join('');
    }

    const total = carrinho.reduce((acc, i) => acc + i.preco, 0);
    const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;

    if (subtotalEl) subtotalEl.textContent = totalFormatado;
    if (totalEl) totalEl.textContent = totalFormatado;
}

function remover(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

function configurarEventosDrawer() {
    const dr = document.getElementById('carrinhoDrawer');
    const ov = document.getElementById('overlay');
    const btnAbrir = document.getElementById('btnAbrirCarrinho');
    const btnFechar = document.getElementById('btnFecharCarrinho');

    if (!dr || !ov) return;

    if (btnAbrir) btnAbrir.onclick = () => { dr.classList.add('aberto'); ov.classList.add('ativo'); };
    if (btnFechar) btnFechar.onclick = () => { dr.classList.remove('aberto'); ov.classList.remove('ativo'); };
    ov.onclick = () => { dr.classList.remove('aberto'); ov.classList.remove('ativo'); };
}

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('visivel');
    setTimeout(() => t.classList.remove('visivel'), 2500);
}

//Adicionar função para ver se a itens no carrinho se sim button onclick deve funcionar 
//if (carrinho itens > 0) se nao button onclick deve ser desabilitado

// Tornar funções globais para os onclicks do HTML
window.add = add;
window.remover = remover;
window.removerItem = removerItem;
window.aplicarCupom = aplicarCupom;

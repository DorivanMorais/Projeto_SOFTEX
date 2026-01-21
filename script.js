// --- DADOS E INICIALIZAÇÃO ---
const DB_KEY = 'sistema_final_v17'; // Versão incrementada

const initialState = {
    registros: [
        { id: 1, material: "Papel", volume: 890, storage: "Seção A", frequency: "Semanal", date: "2025-12-03" },
        { id: 2, material: "Plástico", volume: 1200, storage: "Seção B", frequency: "Diária", date: "2025-11-29" }
    ],
    config: {
        materiais: ["Papel", "Plástico", "Vidro", "Metal", "Papelão"],
        frequencia: ["Diária", "Semanal", "Mensal", "Semestral", "Quinzenal"],
        armazenamento: ["Seção A", "Seção B", "Seção C", "Seção D", "Seção E"],
        capacidadeTotal: 10000
    },
    relatorios: [
        { id: 4, tipo: "Quinzenal", dataGeracao: "07/01/2026 15:01", usuario: "Marcos", categoria: "Semanal", arquivo: "relatorio_q1.pdf" },
        { id: 3, tipo: "Financeiro anual", dataGeracao: "01/01/2026 14:30", usuario: "Ana Ferreira", categoria: "Anual", arquivo: "finan_2025.pdf" }
    ],
    financeiro: []
};

let db = JSON.parse(localStorage.getItem(DB_KEY)) || initialState;

function salvarDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    atualizarTodaInterface();
}

document.addEventListener('DOMContentLoaded', () => {
    sistemaAuth.checkLogin(); // Verifica login ao carregar
    atualizarTodaInterface();
    atualizarCategoriasFin();
    sistemaCadastro.init();
    sistemaNotificacoes.init(); // Inicializa listeners de notificação
});

// --- SISTEMA DE AUTENTICAÇÃO (LOGIN E RECUPERAÇÃO) ---
const sistemaAuth = {
    fazerLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginPassword').value;
        
        const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        const user = usuarios.find(u => u.email === email && u.senha === senha);
        
        if (user || (email === 'admin@admin.com' && senha === 'admin123')) {
            localStorage.setItem('isLoggedIn', 'true');
            this.showMainApp();
        } else {
            this.showAlert('loginAlert', 'E-mail ou senha inválidos.', 'error');
        }
    },
    
    registrarUsuario(e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const senha = document.getElementById('registerPassword').value;
        const confirma = document.getElementById('registerConfirmPassword').value;
        
        if(senha !== confirma) {
            this.showAlert('registerAlert', 'Senhas não conferem.', 'error');
            return;
        }
        
        let usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        if(usuarios.find(u => u.email === email)) {
            this.showAlert('registerAlert', 'E-mail já cadastrado.', 'error');
            return;
        }
        
        usuarios.push({ email, senha });
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
        this.showAlert('registerAlert', 'Conta criada! Faça login.', 'success');
        setTimeout(() => this.showPage('login'), 1500);
    },
    
    // Novas funções para recuperação de senha (Integrado do Zip)
    mostrarRecuperacao() {
        document.getElementById('loginBox').style.display = "none";
        document.getElementById('recuperarSenhaBox').style.display = "block";
    },

    voltarLogin() {
        document.getElementById('loginBox').style.display = "block";
        document.getElementById('recuperarSenhaBox').style.display = "none";
    },

    enviarRecuperacao(e) {
        e.preventDefault();
        const email = document.getElementById("emailRecuperacao").value;

        if (!email) {
            alert("Informe um e-mail válido.");
            return;
        }

        // Simulação de envio conforme código do projeto integrador
        alert("Link de recuperação enviado para o e-mail!");
        
        // Retorna ao login após o "envio"
        this.voltarLogin();
    },
    
    checkLogin() {
        if(localStorage.getItem('isLoggedIn') === 'true') {
            this.showMainApp();
        }
    },
    
    logout() {
        localStorage.removeItem('isLoggedIn');
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('auth-app').style.display = 'block';
        this.showPage('login');
    },
    
    showMainApp() {
        document.getElementById('auth-app').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        navegarPara('controle'); // Tela inicial pós-login
    },
    
    showPage(pageId) {
        document.querySelectorAll('.auth-page').forEach(p => p.classList.remove('active'));
        if(pageId === 'login') {
            document.getElementById('loginPage').classList.add('active');
            this.voltarLogin(); // Garante que volta para o form de login, não recuperação
        }
        if(pageId === 'registerUser') document.getElementById('registerUserPage').classList.add('active');
    },
    
    showAlert(id, msg, type) {
        const div = document.getElementById(id);
        div.textContent = msg;
        div.className = `alert show ${type === 'error' ? 'alert-error' : 'alert-success'}`;
        div.style.display = 'block';
        setTimeout(() => div.style.display = 'none', 3000);
    },
    
    esqueciSenha() { 
        // Agora usa a nova lógica interna
        this.mostrarRecuperacao();
    },
    
    closeForgotPasswordModal() { 
        // Deprecated - mantido apenas para compatibilidade se algo chamar
        document.getElementById('forgotPasswordModal').style.display = 'none'; 
    },
    
    enviarRecuperacaoModal() { 
        // Deprecated
        alert('E-mail de recuperação enviado!'); 
        this.closeForgotPasswordModal(); 
    }
};

// --- NAVEGAÇÃO INTERNA ---
function navegarPara(tela) {
    document.querySelectorAll('.sidebar nav ul li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    
    if (tela === 'controle') {
        document.getElementById('menu-controle').classList.add('active');
        document.getElementById('view-controle').style.display = 'block';
    } else if (tela === 'financeiro') {
        document.getElementById('menu-financeiro').classList.add('active');
        document.getElementById('view-financeiro').style.display = 'block';
        atualizarTelaFinanceiro();
    } else if (tela === 'relatorios') {
        document.getElementById('menu-relatorios').classList.add('active');
        document.getElementById('view-relatorios').style.display = 'block';
    } else if (tela === 'cadastro') {
        document.getElementById('menu-cadastro').classList.add('active');
        document.getElementById('view-cadastro').style.display = 'block';
        sistemaCadastro.carregarLista();
    } else if (tela === 'notificacoes') {
        document.getElementById('menu-notificacoes').classList.add('active');
        document.getElementById('view-notificacoes').style.display = 'block';
    }
}

function atualizarTodaInterface() {
    renderizarTabelaControle();
    atualizarCardsControle();
    renderizarTabelaRelatorios();
    atualizarTelaFinanceiro();
}

// ===========================================
// MÓDULO CADASTRO
// ===========================================
const sistemaCadastro = {
    usuarios: [], empresas: [], editingId: null, tipoCadastro: 'PF',
    
    init() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        this.empresas = JSON.parse(localStorage.getItem('empresas')) || [];
        this.carregarUFs();
    },
    
    carregarLista() {
        const tbody = document.getElementById('tableBodyCadastro');
        if(!tbody) return;
        tbody.innerHTML = '';
        this.usuarios.forEach(u => tbody.innerHTML += this.criarLinha(u));
        this.empresas.forEach(e => tbody.innerHTML += this.criarLinha(e));
        document.getElementById('totalCadastros').innerText = this.usuarios.length + this.empresas.length;
        document.getElementById('totalPF').innerText = this.usuarios.length;
        document.getElementById('totalPJ').innerText = this.empresas.length;
    },
    
    criarLinha(item) {
        const nome = item.tipo === 'PF' ? item.nome : item.razaoSocial;
        const doc = item.tipo === 'PF' ? item.cpf : item.cnpj;
        return `<tr>
            <td>${nome}</td>
            <td><span class="badge">${item.tipo}</span></td>
            <td>${doc}</td>
            <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
            <td><span class="situacao adimplente">Adimplente</span></td>
            <td>
                <button class="btn-visualizar" onclick="sistemaCadastro.detalhes(${item.id}, '${item.tipo}')"><i class="fas fa-eye"></i></button>
                <button class="btn-editar" onclick="sistemaCadastro.editar(${item.id}, '${item.tipo}')"><i class="fas fa-pen"></i></button>
                <button class="btn-excluir" onclick="sistemaCadastro.excluir(${item.id}, '${item.tipo}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    },
    
    mostrarFormulario() {
        document.getElementById('cadastro-lista-screen').style.display = 'none';
        document.getElementById('cadastro-form-screen').style.display = 'block';
        this.editingId = null;
        this.setTipoCadastro('PF'); 
        this.limparForm();
    },
    
    voltarParaLista() {
        document.getElementById('cadastro-form-screen').style.display = 'none';
        document.getElementById('cadastro-lista-screen').style.display = 'block';
        this.carregarLista();
    },
    
    setTipoCadastro(tipo) {
        this.tipoCadastro = tipo;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab${tipo}`).classList.add('active');
        document.querySelectorAll('.form-cad-container').forEach(f => f.classList.remove('active'));
        document.getElementById(`form${tipo}`).classList.add('active');
        const titulo = this.editingId ? (tipo === 'PF' ? 'Editar Pessoa Física' : 'Editar Pessoa Jurídica') : (tipo === 'PF' ? 'Cadastro de Pessoa Física' : 'Cadastro de Pessoa Jurídica');
        document.getElementById('pageTitle').innerText = titulo;
    },
    
    salvarCadastro(e) {
        e.preventDefault();
        const dados = this.tipoCadastro === 'PF' ? this.capturarDadosPF() : this.capturarDadosPJ();
        let lista = this.tipoCadastro === 'PF' ? this.usuarios : this.empresas;
        if(this.editingId) {
            const idx = lista.findIndex(i => i.id === this.editingId);
            if(idx > -1) lista[idx] = dados;
        } else {
            lista.push(dados);
        }
        localStorage.setItem(this.tipoCadastro === 'PF' ? 'usuarios' : 'empresas', JSON.stringify(lista));
        alert('Cadastro salvo com sucesso!');
        this.voltarParaLista();
    },
    
    capturarDadosPF() {
        return {
            id: this.editingId || Date.now(), tipo: 'PF',
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            genero: document.getElementById('genero').value,
            email: document.getElementById('emailPF').value,
            whatsapp: document.getElementById('whatsapp').value,
            telefone: document.getElementById('telefone').value,
            uf: document.getElementById('uf').value,
            cidade: document.getElementById('cidade').value,
            bairro: document.getElementById('bairro').value,
            logradouro: document.getElementById('logradouro').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            status: document.getElementById('statusPF').value
        };
    },
    
    capturarDadosPJ() {
        return {
            id: this.editingId || Date.now(), tipo: 'PJ',
            razaoSocial: document.getElementById('razaoSocial').value,
            nomeFantasia: document.getElementById('nomeFantasia').value,
            cnpj: document.getElementById('cnpj').value,
            inscricaoEstadual: document.getElementById('inscricaoEstadual').value,
            ramoAtividade: document.getElementById('ramoAtividade').value,
            anoFundacao: document.getElementById('anoFundacao').value,
            email: document.getElementById('emailPJ').value,
            telefone: document.getElementById('telefonePJ').value,
            whatsapp: document.getElementById('whatsappPJ').value,
            site: document.getElementById('site').value,
            uf: document.getElementById('ufPJ').value,
            cidade: document.getElementById('cidadePJ').value,
            bairro: document.getElementById('bairroPJ').value,
            logradouro: document.getElementById('logradouroPJ').value,
            numero: document.getElementById('numeroPJ').value,
            complemento: document.getElementById('complementoPJ').value,
            responsavelNome: document.getElementById('responsavelNome').value,
            responsavelCPF: document.getElementById('responsavelCPF').value,
            responsavelCargo: document.getElementById('responsavelCargo').value,
            responsavelEmail: document.getElementById('responsavelEmail').value,
            status: document.getElementById('statusPJ').value
        };
    },
    
    editar(id, tipo) {
        this.editingId = id;
        document.getElementById('cadastro-lista-screen').style.display = 'none';
        document.getElementById('cadastro-form-screen').style.display = 'block';
        this.setTipoCadastro(tipo);
        
        const item = tipo === 'PF' ? this.usuarios.find(u=>u.id===id) : this.empresas.find(e=>e.id===id);
        if(!item) return;
        
        if(tipo === 'PF') {
            document.getElementById('nome').value = item.nome;
            document.getElementById('cpf').value = item.cpf;
            document.getElementById('rg').value = item.rg;
            document.getElementById('dataNascimento').value = item.dataNascimento;
            document.getElementById('genero').value = item.genero;
            document.getElementById('emailPF').value = item.email;
            document.getElementById('whatsapp').value = item.whatsapp;
            document.getElementById('telefone').value = item.telefone;
            document.getElementById('bairro').value = item.bairro;
            document.getElementById('logradouro').value = item.logradouro;
            document.getElementById('numero').value = item.numero;
            document.getElementById('complemento').value = item.complemento;
            document.getElementById('statusPF').value = item.status;
            document.getElementById('uf').value = item.uf;
            this.carregarCidadesPF();
            setTimeout(() => document.getElementById('cidade').value = item.cidade, 100);
        } else {
            document.getElementById('razaoSocial').value = item.razaoSocial;
            document.getElementById('nomeFantasia').value = item.nomeFantasia;
            document.getElementById('cnpj').value = item.cnpj;
            document.getElementById('inscricaoEstadual').value = item.inscricaoEstadual;
            document.getElementById('ramoAtividade').value = item.ramoAtividade;
            document.getElementById('anoFundacao').value = item.anoFundacao;
            document.getElementById('emailPJ').value = item.email;
            document.getElementById('telefonePJ').value = item.telefone;
            document.getElementById('whatsappPJ').value = item.whatsapp;
            document.getElementById('site').value = item.site;
            document.getElementById('bairroPJ').value = item.bairro;
            document.getElementById('logradouroPJ').value = item.logradouro;
            document.getElementById('numeroPJ').value = item.numero;
            document.getElementById('complementoPJ').value = item.complemento;
            document.getElementById('responsavelNome').value = item.responsavelNome;
            document.getElementById('responsavelCPF').value = item.responsavelCPF;
            document.getElementById('responsavelCargo').value = item.responsavelCargo;
            document.getElementById('responsavelEmail').value = item.responsavelEmail;
            document.getElementById('statusPJ').value = item.status;
            document.getElementById('ufPJ').value = item.uf;
            this.carregarCidadesPJ();
            setTimeout(() => document.getElementById('cidadePJ').value = item.cidade, 100);
        }
    },
    
    excluir(id, tipo) {
        if(confirm('Excluir este cadastro?')) {
            if(tipo === 'PF') this.usuarios = this.usuarios.filter(u => u.id !== id);
            else this.empresas = this.empresas.filter(e => e.id !== id);
            localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
            localStorage.setItem('empresas', JSON.stringify(this.empresas));
            this.carregarLista();
        }
    },
    
    detalhes(id, tipo) {
        const item = tipo === 'PF' ? this.usuarios.find(u=>u.id===id) : this.empresas.find(e=>e.id===id);
        const modal = document.getElementById('modalDetalhesCadastro');
        const body = document.getElementById('modalBodyCadastro');
        
        let html = '';
        if(tipo === 'PF') {
            html = `<p><strong>Nome:</strong> ${item.nome}</p>
                    <p><strong>CPF:</strong> ${item.cpf}</p>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>Endereço:</strong> ${item.logradouro}, ${item.numero} - ${item.bairro}</p>`;
        } else {
            html = `<p><strong>Razão Social:</strong> ${item.razaoSocial}</p>
                    <p><strong>CNPJ:</strong> ${item.cnpj}</p>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>Responsável:</strong> ${item.responsavelNome}</p>`;
        }
        body.innerHTML = html;
        modal.style.display = 'flex';
    },
    
    limparForm() {
        document.getElementById('formPF').reset();
        document.getElementById('formPJ').reset();
    },
    
    searchCadastros() {
        const termo = document.getElementById('searchCadastroInput').value.toLowerCase();
        document.querySelectorAll('#tableBodyCadastro tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(termo) ? '' : 'none';
        });
    },
    
    carregarUFs() {
        const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
        const populate = (id) => {
            const el = document.getElementById(id);
            if(el) {
                el.innerHTML = '<option value="">Selecione</option>';
                ufs.forEach(u => el.innerHTML += `<option value="${u}">${u}</option>`);
            }
        };
        populate('uf');
        populate('ufPJ');
    },
    
    carregarCidadesPF() {
        const sel = document.getElementById('cidade');
        sel.innerHTML = '<option>São Luís</option><option>Imperatriz</option><option>Caxias</option>';
    },
    carregarCidadesPJ() {
        const sel = document.getElementById('cidadePJ');
        sel.innerHTML = '<option>São Luís</option><option>Imperatriz</option><option>Caxias</option>';
    }
};

// ===========================================
// MÓDULO CONTROLE
// ===========================================
function atualizarCardsControle() {
    const totalVol = db.registros.reduce((acc, cur) => acc + Number(cur.volume), 0);
    document.getElementById('displayVolumeTotal').innerText = totalVol.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' Kg';
    document.getElementById('displayCapacidade').innerText = parseFloat(db.config.capacidadeTotal).toLocaleString('pt-BR') + ' Kg';
    document.getElementById('displayTipos').innerText = db.config.materiais.length;
}

function renderizarTabelaControle() {
    const tbody = document.getElementById('tabelaCorpo');
    tbody.innerHTML = '';
    const termo = document.getElementById('searchInput').value.toLowerCase();
    db.registros.forEach((item, index) => {
        if(item.material.toLowerCase().includes(termo)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.material}</td>
                <td>${parseFloat(item.volume).toLocaleString('pt-BR')} Kg</td>
                <td>${item.storage}</td>
                <td><span class="badge">${item.frequency}</span></td>
                <td>${formatarData(item.date)}</td>
                <td>
                    <i class="fas fa-edit action-btn" style="color:#062c43" onclick="editarRegistro(${index})"></i>
                    <i class="fas fa-trash-alt action-btn" style="color:#062c43" onclick="excluirRegistro(${index})"></i>
                </td>`;
            tbody.appendChild(tr);
        }
    });
}

function abrirModalRegistro() {
    document.getElementById('formRegistro').reset();
    document.getElementById('editIndex').value = '';
    preencherSelectsRegistro();
    document.getElementById('tituloModalRegistro').innerText = 'Novo Registro';
    document.getElementById('modalRegistro').style.display = 'flex';
}

function preencherSelectsRegistro() {
    const preencher = (id, lista) => {
        const sel = document.getElementById(id);
        sel.innerHTML = '<option value="">Selecione...</option>';
        lista.forEach(opt => sel.innerHTML += `<option value="${opt}">${opt}</option>`);
    };
    preencher('selMaterial', db.config.materiais);
    preencher('selFrequencia', db.config.frequencia);
    preencher('selArmazenamento', db.config.armazenamento);
}

document.getElementById('formRegistro').addEventListener('submit', (e) => {
    e.preventDefault();
    const index = document.getElementById('editIndex').value;
    const novo = {
        id: index ? db.registros[index].id : Date.now(),
        volume: document.getElementById('inVolume').value,
        material: document.getElementById('selMaterial').value,
        storage: document.getElementById('selArmazenamento').value,
        frequency: document.getElementById('selFrequencia').value,
        date: index ? db.registros[index].date : new Date().toISOString().split('T')[0]
    };
    if (index !== '') db.registros[index] = novo; else db.registros.push(novo);
    salvarDB();
    fecharModal('modalRegistro');
});

function editarRegistro(index) {
    const item = db.registros[index];
    document.getElementById('editIndex').value = index;
    preencherSelectsRegistro();
    document.getElementById('inVolume').value = item.volume;
    document.getElementById('selMaterial').value = item.material;
    document.getElementById('selArmazenamento').value = item.storage;
    document.getElementById('selFrequencia').value = item.frequency;
    document.getElementById('tituloModalRegistro').innerText = 'Editar Registro';
    document.getElementById('modalRegistro').style.display = 'flex';
}
function excluirRegistro(index) { if(confirm('Excluir?')) { db.registros.splice(index, 1); salvarDB(); } }

// --- CONFIGURAÇÕES ---
function abrirModalConfigPrincipal() {
    document.getElementById('modalConfigMain').style.display = 'flex';
    document.getElementById('inputCapacidadeTotal').value = db.config.capacidadeTotal;
}
function salvarCapacidade() {
    const valor = parseFloat(document.getElementById('inputCapacidadeTotal').value);
    if(valor && valor > 0) { db.config.capacidadeTotal = valor; salvarDB(); alert('Capacidade atualizada!'); fecharModal('modalConfigMain'); }
}
let configAtualTipo = ''; let configAtualAcao = '';
function abrirSubModal(tipo, acao) {
    configAtualTipo = tipo; configAtualAcao = acao;
    const tituloMap = { 'materiais': 'Material', 'frequencia': 'Frequência', 'armazenamento': 'Armazenamento' };
    document.getElementById('subModalTitulo').innerText = (acao === 'cadastrar' ? 'Cadastrar ' : 'Excluir ') + tituloMap[tipo];
    document.getElementById('areaCadastro').style.display = (acao === 'cadastrar') ? 'flex' : 'none';
    renderizarListaSubConfig();
    document.getElementById('modalSubConfig').style.display = 'flex';
}
function voltarParaConfigMain() { fecharModal('modalSubConfig'); }
function renderizarListaSubConfig() {
    const listaEl = document.getElementById('listaConfigItens');
    listaEl.innerHTML = '';
    db.config[configAtualTipo].forEach((item, idx) => {
        const li = document.createElement('li');
        li.innerHTML = configAtualAcao === 'excluir' ? `<span>${item}</span> <span class="delete-icon" onclick="removerItemConfig(${idx})">X</span>` : `<span>${item}</span>`;
        listaEl.appendChild(li);
    });
}
function adicionarItemConfig() {
    const input = document.getElementById('novoItemInput');
    const valor = input.value.trim();
    if(valor) { db.config[configAtualTipo].push(valor); input.value = ''; salvarDB(); renderizarListaSubConfig(); }
}
function removerItemConfig(idx) { if(confirm('Remover?')) { db.config[configAtualTipo].splice(idx, 1); salvarDB(); renderizarListaSubConfig(); } }

// ===========================================
// MÓDULO FINANCEIRO
// ===========================================
const categoryOptionsFin = {
    entrada: ["Mensalidade de Sócio", "Doação / Patrocínio", "Venda de Produtos", "Renda de Eventos", "PIX Recebido", "Outros"],
    saida: ["Conta de Água", "Conta de Energia", "Aluguel", "Internet", "Manutenção", "Limpeza", "Material de Escritório", "Lanche", "Pessoal", "Transporte", "Outros"]
};

function atualizarCategoriasFin() {
    const typeSelect = document.getElementById('typeFin');
    const categorySelect = document.getElementById('categoryFin');
    const selectedType = typeSelect.value;
    categorySelect.innerHTML = "";
    categoryOptionsFin[selectedType].forEach(opt => {
        const el = document.createElement('option');
        el.value = opt; el.textContent = opt;
        categorySelect.appendChild(el);
    });
}

function adicionarTransacao(e) {
    e.preventDefault();
    const desc = document.getElementById('descFin').value;
    const amount = parseFloat(document.getElementById('amountFin').value);
    const type = document.getElementById('typeFin').value;
    const category = document.getElementById('categoryFin').value;
    if (!desc || isNaN(amount) || amount <= 0) { alert('Preencha corretamente.'); return; }
    const transacao = { id: Date.now(), desc, amount, type, category };
    if(!db.financeiro) db.financeiro = [];
    db.financeiro.push(transacao);
    salvarDB();
    document.getElementById('financeForm').reset();
    atualizarCategoriasFin();
}

function atualizarTelaFinanceiro() {
    const list = document.getElementById('transactionsList');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const totalBalanceEl = document.getElementById('totalBalance');
    if(!list) return;
    list.innerHTML = "";
    let income = 0; let expense = 0;
    const transactions = db.financeiro || [];
    transactions.forEach(t => {
        if (t.type === 'entrada') income += t.amount; else expense += t.amount;
        const row = document.createElement('tr');
        const typeClass = t.type === 'entrada' ? 'entry-in' : 'entry-out';
        const typeLabel = t.type === 'entrada' ? 'Entrada' : 'Saída';
        row.innerHTML = `<td>${t.desc}</td><td>${t.category}</td><td class="${typeClass}">${typeLabel}</td><td>R$ ${t.amount.toFixed(2)}</td><td><button class="delete-btn" onclick="removerTransacao(${t.id})"><i class="fas fa-trash"></i></button></td>`;
        list.appendChild(row);
    });
    totalIncomeEl.innerText = `R$ ${income.toFixed(2)}`;
    totalExpenseEl.innerText = `R$ ${expense.toFixed(2)}`;
    const balance = income - expense;
    totalBalanceEl.innerText = `R$ ${balance.toFixed(2)}`;
    totalBalanceEl.style.color = balance < 0 ? '#e74c3c' : '#003049';
}
function removerTransacao(id) { if(confirm('Excluir lançamento?')) { db.financeiro = db.financeiro.filter(t => t.id !== id); salvarDB(); } }

// --- RELATÓRIOS ---
let filtroRelatorioAtual = 'todos';
function filtrarRelatorios(filtro, btn) {
    filtroRelatorioAtual = filtro;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderizarTabelaRelatorios();
}
function renderizarTabelaRelatorios() {
    const tbody = document.getElementById('tabelaRelatoriosCorpo');
    tbody.innerHTML = '';
    const dados = db.relatorios.filter(r => filtroRelatorioAtual === 'todos' || r.categoria.toLowerCase() === filtroRelatorioAtual);
    document.getElementById('contadorRelatorios').innerText = `${dados.length} relatórios encontrados`;
    dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.id}</td><td>${item.tipo}</td><td>${item.dataGeracao}</td><td>${item.usuario}</td><td><i class="fas fa-eye icon-action"></i><i class="fas fa-pen icon-action" onclick="editarRelatorio(${item.id})"></i><i class="fas fa-trash icon-action" onclick="excluirRelatorio(${item.id})"></i></td>`;
        tbody.appendChild(tr);
    });
}
function abrirModalRelatorio() { document.getElementById('formRelatorio').reset(); document.getElementById('editRelatorioId').value = ''; document.getElementById('fileNameDisplay').innerText = "Nenhum arquivo escolhido"; document.getElementById('modalRelatorio').style.display = 'flex'; }
function editarRelatorio(id) {
    const relatorio = db.relatorios.find(r => r.id === id); if (!relatorio) return;
    document.getElementById('editRelatorioId').value = id;
    document.getElementById('tipoRelatorioInput').value = relatorio.tipo;
    document.getElementById('usuarioRelatorioInput').value = relatorio.usuario;
    document.querySelector(`input[name="catRelatorio"][value="${relatorio.categoria}"]`).checked = true;
    document.getElementById('modalRelatorio').style.display = 'flex';
}
function atualizarNomeArquivo(input) { document.getElementById('fileNameDisplay').innerText = input.files.length > 0 ? input.files[0].name : "Nenhum arquivo escolhido"; }
function processarRelatorio(e) {
    e.preventDefault(); const editId = document.getElementById('editRelatorioId').value;
    const novo = { id: editId ? Number(editId) : Date.now(), tipo: document.getElementById('tipoRelatorioInput').value, usuario: document.getElementById('usuarioRelatorioInput').value, categoria: document.querySelector('input[name="catRelatorio"]:checked').value, arquivo: 'doc.pdf', dataGeracao: '20/01/2026' };
    if(editId) { const idx = db.relatorios.findIndex(r=>r.id==editId); db.relatorios[idx] = novo; } else db.relatorios.unshift(novo);
    salvarDB(); fecharModal('modalRelatorio');
}
function excluirRelatorio(id) { if(confirm('Excluir?')) { db.relatorios = db.relatorios.filter(r => r.id !== id); salvarDB(); } }
function buscaRelatorios(termo) { document.querySelectorAll('#tabelaRelatoriosCorpo tr').forEach(row => row.style.display = row.innerText.toLowerCase().includes(termo.toLowerCase()) ? '' : 'none'); }
function fecharModal(id) { document.getElementById(id).style.display = 'none'; }
function formatarData(iso) { if(!iso) return ''; const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; }
function filtrarTabela() { renderizarTabelaControle(); }
window.onclick = function(e) { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; }

// Utilitário para toggle password
window.togglePassword = function(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
};

// ===========================================
// MÓDULO NOTIFICAÇÕES (Integrado de avisospagamento)
// ===========================================
const sistemaNotificacoes = {
    init() {
        // Verifica se os elementos existem antes de adicionar listeners
        const select = document.getElementById("tipoNotificacao");
        const configuracao = document.getElementById("configuracaoNotificacao");
        const chkAtivar = document.getElementById("chkAtivarNotificacao");
        const canais = document.querySelectorAll(".canal");
        const btnSalvar = document.getElementById("btnSalvarNotificacao");
        const msgSucesso = document.getElementById("msgSucessoNotificacao");

        if(!select) return; // Se não estiver na tela, aborta

        // Resetar estado inicial ao carregar (opcional, ou carregar do DB)
        this.resetarFormulario();

        // Listener: Mostrar área de configuração
        select.addEventListener("change", () => {
            configuracao.style.display = select.value ? "block" : "none";
            this.resetarFormulario();
        });

        // Listener: Ativar/desativar canais
        chkAtivar.addEventListener("change", () => {
            canais.forEach((canal) => {
                canal.disabled = !chkAtivar.checked;
                canal.checked = false;
            });
            btnSalvar.disabled = true;
        });

        // Listener: Verifica se um canal está marcado para habilitar botão
        canais.forEach((canal) => {
            canal.addEventListener("change", () => {
                const algumSelecionado = [...canais].some((c) => c.checked);
                btnSalvar.disabled = !algumSelecionado;
            });
        });

        // Listener: Botão Salvar
        btnSalvar.addEventListener("click", () => {
            msgSucesso.style.display = "block";
            setTimeout(() => {
                msgSucesso.style.display = "none";
            }, 3000);
        });
    },

    resetarFormulario() {
        const chkAtivar = document.getElementById("chkAtivarNotificacao");
        const canais = document.querySelectorAll(".canal");
        const btnSalvar = document.getElementById("btnSalvarNotificacao");
        const msgSucesso = document.getElementById("msgSucessoNotificacao");

        if(chkAtivar) chkAtivar.checked = false;
        if(canais) {
            canais.forEach((canal) => {
                canal.checked = false;
                canal.disabled = true;
            });
        }
        if(btnSalvar) btnSalvar.disabled = true;
        if(msgSucesso) msgSucesso.style.display = "none";
    }
};

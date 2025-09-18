// Constantes de API
const BASE_URL = 'http://localhost:8082'
const API_BASE_CUSTOMER = BASE_URL + '/api/v1/customers/';
const API_BASE_PRODUCT =  BASE_URL +'/api/v1/products/';
const API_BASE_ORDER =  BASE_URL +'/api/v1/orders/';
const API_BASE_PAYMENT =  BASE_URL +'/api/v1/payment/';

// Variáveis globais
let orders = {
    cpfCustumer: '',
    products: []
};

let orderId = "";
let currentPage = 0;
const pageSize = 10;
let paymentTimer;
let paymentCheckInterval;

// Referências de elementos
const screens = {
    preregistration: document.getElementById('screen-preregistration'),
    menu: document.getElementById('screen-menu'),
    cart: document.getElementById('screen-cart'),
    payment: document.getElementById('screen-payment')
};

const forms = {
    findCpf: document.getElementById('form-find-cpf'),
    registerCustomer: document.getElementById('form-register-customer')
};

const buttons = {
    continueAsGuest: document.getElementById('button-continue-as-guest'),
    cartButton: document.getElementById('cart-button'),
    checkout: document.getElementById('button-checkout'),
    retryPayment: document.getElementById('button-retry-payment')
};

const elements = {
    cartCount: document.getElementById('cart-count'),
    menuContent: document.getElementById('menu-content'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    paymentQrcode: document.getElementById('payment-qrcode'),
    paymentSuccess: document.getElementById('payment-success'),
    paymentFailure: document.getElementById('payment-failure'),
    countdownTimer: document.getElementById('countdown-timer'),
    pagination: document.getElementById('pagination-buttons'),
    qrcodeContainer: document.getElementById('qrcode-container')
};

// Funções de utilidade
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.style.display = 'none');
    screens[screenId].style.display = 'block';
}

function updateCartDisplay() {
    const totalItems = orders.products.length;
    if (totalItems > 0) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = 'block';
        buttons.cartButton.classList.add('has-items');
        buttons.checkout.disabled = false;
        buttons.cartButton.disabled = false;
    } else {
        elements.cartCount.style.display = 'none';
        buttons.cartButton.classList.remove('has-items');
        buttons.checkout.disabled = true;
        buttons.cartButton.disabled = true;
    }
}

function addCpfMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d{3})$/, '$1.$2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d{3})$/, '$1');
        }
        e.target.value = value;
    });
}

// Lógica principal
document.addEventListener('DOMContentLoaded', () => {
    showScreen('preregistration');
    addCpfMask(document.getElementById('find-cpf'));
    addCpfMask(document.getElementById('register-cpf'));
    updateCartDisplay();
});

// Telas e Requisições

// Pré-Pedidos
forms.findCpf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cpf = document.getElementById('find-cpf').value.replace(/\D/g, '');
    try {
        const response = await fetch(`${API_BASE_CUSTOMER}find/${cpf}`, {
            method: 'GET'
        });
        const data = await response.json();
        if (data.code === 200) {
            localStorage.setItem('customerCpf', data.result.cpf);
            orders.cpfCustumer = data.result.cpf;
            showScreen('menu');
            await loadMenu();
        } else {
            alert('CPF não encontrado. Por favor, cadastre-se ou continue como visitante.');
        }
    } catch (error) {
        console.error('Erro ao buscar CPF:', error);
        alert('Erro ao buscar CPF. Tente novamente.');
    }
});

forms.registerCustomer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const cpf = document.getElementById('register-cpf').value.replace(/\D/g, '');
    const body = { name, email, cpf };

    try {
        const response = await fetch(`${API_BASE_CUSTOMER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.code === 200) {
            localStorage.setItem('customerCpf', data.result.cpf);
            orders.cpfCustumer = data.result.cpf;
            showScreen('menu');
            await loadMenu();
        } else {
            alert('Erro ao cadastrar. Verifique os dados e tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert('Erro ao cadastrar. Tente novamente.');
    }
});

buttons.continueAsGuest.addEventListener('click', async () => {
    localStorage.removeItem('customerCpf');
    orders.cpfCustumer = '';
    showScreen('menu');
    await loadMenu();
});

// Menu
async function loadMenu() {
    elements.menuContent.innerHTML = ''; // Limpa o conteúdo
    const categories = ['LANCHE', 'ACOMPANHAMENTO', 'BEBIDA'];

    for (const category of categories) {
        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'col-span-1 md:col-span-2 lg:col-span-3 text-2xl font-bold text-gray-700 mt-6 mb-4';
        categoryHeader.textContent = category.charAt(0) + category.slice(1).toLowerCase();
        elements.menuContent.appendChild(categoryHeader);

        try {
            const response = await fetch(`${API_BASE_PRODUCT}category/${category}?page=${currentPage}&size=${pageSize}`);
            const data = await response.json();
            console.log(data)
            if (data.code === 200 && data.result) {
                data.result.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'bg-white p-4 rounded-lg shadow-md product-card cursor-pointer';
                    card.innerHTML = `
                        <h4 class="text-xl font-bold text-gray-800">${product.title}</h4>
                        <p class="text-sm text-gray-500 mt-1">${product.description}</p>
                        <p class="text-lg font-bold text-red-600 mt-2">R$ ${product.price.toFixed(2)}</p>
                    `;
                    card.addEventListener('click', () => addProductToCart(product.sku));
                    elements.menuContent.appendChild(card);
                });
            }
        } catch (error) {
            console.error(`Erro ao carregar produtos da categoria ${category}:`, error);
        }
    }
}

function addProductToCart(productId) {
    orders.products.push(productId);
    updateCartDisplay();
    alert('Produto adicionado ao carrinho!');
}

// Carrinho de Compras
buttons.cartButton.addEventListener('click', async () => {
    if (orders.products.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    showScreen('cart');
    elements.cartItems.innerHTML = '';
    let total = 0;
    const productCounts = orders.products.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    for (const [productId, quantity] of Object.entries(productCounts)) {
        try {
            const response = await fetch(`${API_BASE_PRODUCT}find/${productId}`);
            const data = await response.json();
            if (data.code === 200) {
                const product = data.result;
                const itemTotal = product.price * quantity;
                total += itemTotal;
                const cartItem = document.createElement('div');
                cartItem.className = 'py-4 flex justify-between items-center';
                cartItem.innerHTML = `
                    <div>
                        <p class="font-bold text-gray-800">${product.title} (${quantity}x)</p>
                        <p class="text-sm text-gray-500">${product.description}</p>
                    </div>
                    <span class="font-semibold text-gray-700">R$ ${itemTotal.toFixed(2)}</span>
                `;
                elements.cartItems.appendChild(cartItem);
            }
        } catch (error) {
            console.error(`Erro ao carregar item do carrinho ${productId}:`, error);
        }
    }

    elements.cartTotal.textContent = `R$ ${total.toFixed(2)}`;
});

buttons.checkout.addEventListener('click', async () => {
    console.log(JSON.stringify(orders))
    try {
        const response = await fetch(`${API_BASE_ORDER}checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orders)
        });
        const data = await response.json();
        if (data.code === 201) {
            console.log(orderId)
            orderId = data.result.id;
            showScreen('payment');           
            setTimeout(() =>startPaymentProcess(), 500);
        } else {
            alert('Erro ao finalizar pedido. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao finalizar pedido. Tente novamente.');
    }
});

// Pagamento
async function startPaymentProcess() {
   
    elements.paymentQrcode.style.display = 'flex';
    elements.paymentSuccess.style.display = 'none';
    elements.paymentFailure.style.display = 'none';

    console.log({ externalReference: orderId })

    try {       
        const data = await fetch(`${API_BASE_PAYMENT}pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId })
        });

       
        if (data.ok) {
            const blob = await data.blob();
            displayQRCode(blob); // Supondo que a API retorna um campo 'qrCode' com a imagem ou URL
            startCountdown();
            startPaymentCheck();
        } else {
            alert('Erro ao gerar QR Code. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        alert('Erro ao gerar QR Code. Tente novamente.');
    }
}

function displayQRCode(qrCodeUrl) {
    const qrcodeImg = document.createElement('img');
    qrcodeImg.src = URL.createObjectURL(qrCodeUrl);
    elements.qrcodeContainer.innerHTML = '';
    elements.qrcodeContainer.appendChild(qrcodeImg);
}

function startCountdown() {
    clearInterval(paymentTimer);
    let timeLeft = 60; // 1 minuto
    elements.countdownTimer.textContent = `Tempo restante: ${timeLeft}s`;
    paymentTimer = setInterval(() => {
        timeLeft--;
        elements.countdownTimer.textContent = `Tempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(paymentTimer);
            clearInterval(paymentCheckInterval);
            elements.paymentQrcode.style.display = 'none';
            elements.paymentFailure.style.display = 'block';
        }
    }, 1000);
}

function startPaymentCheck() {
    clearInterval(paymentCheckInterval);
    paymentCheckInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_PAYMENT}find/order/${orderId}`);
            console.log(response)
            const data = await response.json();
            if (data.code === 200 && data.result.statusPayment == 'APROVADO') {
                clearInterval(paymentTimer);
                clearInterval(paymentCheckInterval);
                elements.paymentQrcode.style.display = 'none';
                elements.paymentSuccess.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao verificar status do pagamento:', error);
        }
    }, 5000); // A cada 5 segundos
}

buttons.retryPayment.addEventListener('click', startPaymentProcess);
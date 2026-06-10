// ============================================
// CONFIGURAÇÃO - COLE SUA CHAVE AQUI
// ============================================
const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // <--- COLE DENTRO DAS ASPAS

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
async function getWeatherData(city) {
    // Mostra loading
    document.getElementById('weatherResult').innerHTML = `
        <div style="text-align:center; padding:20px">
            ⏳ Buscando clima para ${city}...
        </div>
    `;
    
    try {
        // Monta a URL (SEM caracteres especiais)
        const encodedCity = encodeURIComponent(city);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric&lang=pt_br`;
        
        console.log('URL sendo chamada:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Resposta da API:', data);
        
        // Verifica erros específicos
        if (data.cod === '401') {
            throw new Error('❌ CHAVE INVÁLIDA! Vá no site openweathermap.org e pegue uma chave NOVA. Aguarde 2 horas se acabou de criar a conta.');
        }
        
        if (data.cod === '404') {
            throw new Error(`❌ Cidade "${city}" não encontrada. Verifique o nome e tente novamente.`);
        }
        
        if (data.cod !== 200 && data.cod !== '200') {
            throw new Error(`Erro: ${data.message || 'Erro desconhecido'}`);
        }
        
        // Se chegou aqui, deu certo!
        displayWeather(data);
        saveToRecentCities(city);
        
    } catch (error) {
        console.error('Erro capturado:', error);
        document.getElementById('weatherResult').innerHTML = `
            <div style="background: #ffebee; padding: 20px; border-radius: 15px; border-left: 4px solid #f44336;">
                <h3 style="color: #c62828; margin: 0 0 10px 0;">❌ ${error.message}</h3>
                <hr>
                <strong>🔧 SOLUÇÕES:</strong><br><br>
                <strong>1. Problema com a chave?</strong><br>
                - Acesse: <a href="https://home.openweathermap.org/api_keys" target="_blank">openweathermap.org/api_keys</a><br>
                - Gere uma chave NOVA (coloque qualquer nome)<br>
                - Copie e cole ela no código<br>
                - Aguarde 2-4 horas se acabou de criar a conta<br><br>
                
                <strong>2. Teste manual da chave:</strong><br>
                Cole este link no navegador (substitua SUA_CHAVE):<br>
                <code style="background:#eee; padding:5px; display:inline-block; font-size:12px;">
                https://api.openweathermap.org/data/2.5/weather?q=São Paulo&appid=SUA_CHAVE&units=metric
                </code><br><br>
                
                <strong>3. Tente com essas cidades:</strong><br>
                São Paulo, Rio de Janeiro, Londres, New York
            </div>
        `;
    }
}

// ============================================
// MOSTRA OS DADOS NA TELA
// ============================================
function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const condition = data.weather[0].description;
    const city = data.name;
    const icon = data.weather[0].icon;
    
    // Salvar última cidade
    localStorage.setItem('lastCity', city);
    
    // Recomendações baseadas na temperatura
    let roupa = '';
    if (temp < 15) {
        roupa = '🧥 Casaco pesado, gorro e cachecol';
    } else if (temp < 23) {
        roupa = '🧥 Jaqueta leve ou moletom';
    } else if (temp <= 28) {
        roupa = '👕 Camiseta e shorts/calça leve';
    } else {
        roupa = '🩳 Regata, bermuda e protetor solar';
    }
    
    let atividade = '';
    if (condition.includes('chuva') || condition.includes('drizzle')) {
        atividade = '🎬 Cinema, museu ou cafeteria';
    } else if (temp > 30) {
        atividade = '🏖️ Praia, piscina ou shopping';
    } else if (temp < 15) {
        atividade = '☕ Chocolate quente em casa';
    } else {
        atividade = '🌳 Caminhada ao ar livre';
    }
    
    const html = `
        <div style="animation: fadeIn 0.5s ease;">
            <div style="text-align: center;">
                <h2>📍 ${city}</h2>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}">
                <div style="font-size: 48px; font-weight: bold; margin: 10px 0;">${temp}°C</div>
                <div style="margin: 5px 0;">${condition}</div>
                <div>🌡️ Sensação: ${feelsLike}°C | 💧 Umidade: ${humidity}%</div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 15px; border-radius: 15px; margin: 20px 0;">
                <h3>👘 O que vestir</h3>
                <p>${roupa}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 15px; border-radius: 15px; margin: 20px 0;">
                <h3>📍 O que fazer</h3>
                <p>${atividade}</p>
            </div>
        </div>
    `;
    
    document.getElementById('weatherResult').innerHTML = html;
}

// ============================================
// SALVAR CIDADES RECENTES
// ============================================
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

function saveToRecentCities(city) {
    recentCities = recentCities.filter(c => c !== city);
    recentCities.unshift(city);
    recentCities = recentCities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    
    const container = document.getElementById('recentCities');
    if (container) {
        container.innerHTML = recentCities.map(c => 
            `<div style="background: #e0e0e0; padding: 5px 12px; border-radius: 20px; cursor: pointer; display: inline-block; margin: 5px;" onclick="getWeatherData('${c}')">${c}</div>`
        ).join('');
    }
}

// ============================================
// MODO ESCURO
// ============================================
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeBtn.textContent = '🌙 Modo Escuro';
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeBtn.textContent = '☀️ Modo Claro';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeBtn) themeBtn.textContent = '☀️ Modo Claro';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeBtn) themeBtn.textContent = '🌙 Modo Escuro';
    }
}

// ============================================
// EVENTOS E INICIALIZAÇÃO (CORRIGIDO)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar modo escuro (ADICIONADO)
    initTheme();
    
    // Botão do modo escuro (ADICIONADO)
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Carregar cidades recentes
    saveToRecentCities('');
    
    // Botão buscar
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const city = document.getElementById('cityInput').value;
            if (city) getWeatherData(city);
        });
    }
    
    // Enter no input
    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') getWeatherData(e.target.value);
        });
    }
    
    // Tentar carregar última cidade
    const lastCity = localStorage.getItem('lastCity') || 'São Paulo';
    if (cityInput) cityInput.value = lastCity;
    getWeatherData(lastCity);
});

// Animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
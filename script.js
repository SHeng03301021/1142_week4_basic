let currentChart = null;

const typeColors = {
    normal: { name: '一般', color: '#A8A878', icon: '⭐' },
    fire: { name: '火', color: '#F08030', icon: '🔥' },
    water: { name: '水', color: '#6890F0', icon: '💧' },
    electric: { name: '電', color: '#F8D030', icon: '⚡' },
    grass: { name: '草', color: '#78C850', icon: '🌿' },
    ice: { name: '冰', color: '#98D8D8', icon: '❄️' },
    fighting: { name: '格鬥', color: '#C03028', icon: '🥊' },
    poison: { name: '毒', color: '#A040A0', icon: '☠️' },
    ground: { name: '地面', color: '#E0C068', icon: '⛰️' },
    flying: { name: '飛行', color: '#A890F0', icon: '🕊️' },
    psychic: { name: '超能力', color: '#F85888', icon: '🔮' },
    bug: { name: '蟲', color: '#A8B820', icon: '🐛' },
    rock: { name: '岩石', color: '#B8A038', icon: '🪨' },
    ghost: { name: '幽靈', color: '#705898', icon: '👻' },
    dragon: { name: '龍', color: '#7038F8', icon: '🐉' },
    dark: { name: '惡', color: '#705848', icon: '🌙' },
    steel: { name: '鋼', color: '#B8B8D0', icon: '⚙️' },
    fairy: { name: '妖精', color: '#EE99AC', icon: '✨' }
};

async function getPokemon() {
    const nameInput = document.getElementById("pokemonName").value.toLowerCase();
    if (!nameInput) return;

    // 1. 抓取基本資料
    const url = `https://pokeapi.co/api/v2/pokemon/${nameInput}`;
    const response = await fetch(url);
    const data = await response.json();

    // 2. 抓取種類資料 (用來找中文名和進化鏈)
    const speciesUrl = data.species.url;
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    
    // 找出中文名
    let chineseName = data.name; 
    const zhNameObj = speciesData.names.find(n => n.language.name === "zh-Hant");
    if (zhNameObj) {
        chineseName = zhNameObj.name;
    }

    // 3. 處理屬性徽章
    let typesHtml = '';
    data.types.forEach(t => {
        const typeKey = t.type.name;
        const typeInfo = typeColors[typeKey];
        typesHtml += `<span class="type-badge" style="background-color: ${typeInfo.color};">
                        ${typeInfo.icon} ${typeInfo.name}
                      </span>`;
    });

    // === 4. 新增：抓取並生成進化路線 ===
    const evolutionUrl = speciesData.evolution_chain.url;
    const evoResponse = await fetch(evolutionUrl);
    const evoData = await evoResponse.json();

    let evoHtml = '<div class="evo-container"><h3 class="evo-title">進化路線</h3><div class="evo-row">';
    let currentEvo = evoData.chain;

    // 用迴圈剝開進化的洋蔥
    while (currentEvo) {
        // 從網址萃取出這隻寶可夢的 ID
        const currentSpeciesUrl = currentEvo.species.url;
        const pokeId = currentSpeciesUrl.split('/').filter(Boolean).pop();
        // 抓取小頭像
        const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;

        // 為了簡單起見，進化路線我們暫時顯示英文名字 (如果都要查中文會讓連線變慢一點)
        const evoName = currentEvo.species.name;

        // 製作可以點擊的小圖示
        evoHtml += `
            <div class="evo-item" onclick="document.getElementById('pokemonName').value='${pokeId}'; getPokemon();">
                <img src="${imgUrl}" alt="${evoName}">
                <p>${evoName}</p>
            </div>
        `;

        // 前往下一階進化
        currentEvo = currentEvo.evolves_to[0]; 
        if (currentEvo) {
            evoHtml += `<div class="evo-arrow">➡️</div>`;
        }
    }
    evoHtml += '</div></div>';
    // ===================================

    // 5. 顯示在網頁 (把進化路線也加進去)
    const img = data.sprites.other["official-artwork"].front_default || data.sprites.front_default; // 改用更高畫質的圖片
    
    document.getElementById("card").innerHTML = `
        <h2>${chineseName}</h2>
        <img src="${img}">
        <div class="types-container">
            ${typesHtml}
        </div>
        ${evoHtml} `;

    // 6. 畫雷達圖
    const stats = data.stats.map(s => s.base_stat);
    const labels = data.stats.map(s => s.stat.name);
    drawChart(labels, stats);
}

function drawChart(labels, data) {
    const ctx = document.getElementById("myChart");
    if (currentChart) {
        currentChart.destroy();
    }
    currentChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '能力值',
                data: data,
                backgroundColor: 'rgba(255, 77, 77, 0.2)',
                borderColor: '#ff4d4d',
                borderWidth: 2
            }]
        }
    });
}

function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    document.getElementById("pokemonName").value = randomId;
    getPokemon();
}
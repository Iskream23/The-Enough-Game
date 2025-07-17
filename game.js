// Game state variables
let gameState = {
    money: 0,
    isWorking: false,
    workProgress: 0,
    gameEnded: false,
    // Add your game state variables here
};

// Sample card data structure
const needsCards = [
    { id: 'apartment', name: 'Rented Apartment', cost: 200, owned: false, lost: false },
    { id: 'car', name: 'Reliable Car', cost: 400, owned: false, lost: false },
    { id: 'food', name: 'Stable Food Supply', cost: 150, owned: false, lost: false },
    { id: 'healthcare', name: 'Basic Healthcare', cost: 300, owned: false, lost: false }
];

const wantsCards = [
    { id: 'luxury-car', name: 'Luxury Car', cost: 800, owned: false, visible: false },
    { id: 'vacation-home', name: 'Vacation Home', cost: 1200, owned: false, visible: false },
    { id: 'designer-clothes', name: 'Designer Wardrobe', cost: 600, owned: false, visible: true },
    // Add more wants cards as needed
];

// Initialize the game
function initGame() {
    updateDisplay();
    attachEventListeners();
    showMessage('Welcome! Start by securing your essential needs through steady work.', 'info');
}

// Event listeners
function attachEventListeners() {
    document.getElementById('work-button').addEventListener('click', work);
    document.getElementById('fair-risk').addEventListener('click', takeFairRisk);
    document.getElementById('unwise-risk').addEventListener('click', takeUnwiseRisk);
    document.getElementById('end-game').addEventListener('click', endGame);
    document.getElementById('restart-game').addEventListener('click', restartGame);
    document.getElementById('play-again').addEventListener('click', restartGame);
}

// Display update functions
function updateDisplay() {
    document.getElementById('money').textContent = `$${gameState.money}`;
    
    // Update needs count
    const ownedNeeds = needsCards.filter(card => card.owned && !card.lost).length;
    document.getElementById('needs-count').textContent = `${ownedNeeds}/${needsCards.length}`;
    
    // Update wants count
    const ownedWants = wantsCards.filter(card => card.owned).length;
    document.getElementById('wants-count').textContent = ownedWants;
    
    // Render cards
    renderCards();
}

function renderCards() {
    renderNeedsCards();
    renderWantsCards();
}

function renderNeedsCards() {
    const container = document.getElementById('needs-cards');
    container.innerHTML = '';
    
    needsCards.forEach(card => {
        const cardElement = createCardElement(card, true);
        container.appendChild(cardElement);
    });
}

function renderWantsCards() {
    const container = document.getElementById('wants-cards');
    container.innerHTML = '';
    
    wantsCards.filter(card => card.visible).forEach(card => {
        const cardElement = createCardElement(card, false);
        container.appendChild(cardElement);
    });
}

function createCardElement(card, isNeed) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.owned ? 'owned' : ''} ${card.lost ? 'lost' : ''}`;
    
    cardDiv.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-cost">Cost: $${card.cost}</div>
        ${!card.owned && !card.lost ? `<button class="buy-button" onclick="buyCard('${card.id}', ${isNeed})" ${gameState.money < card.cost ? 'disabled' : ''}>Buy</button>` : ''}
        ${card.owned ? '<span style="color: #28a745;">✓ Owned</span>' : ''}
        ${card.lost ? '<span style="color: #dc3545;">✗ Lost</span>' : ''}
    `;
    
    return cardDiv;
}

function showMessage(text, type) {
    const messageArea = document.getElementById('message-area');
    messageArea.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
        messageArea.innerHTML = '';
    }, 5000);
}

function updateWorkProgress() {
    document.getElementById('work-progress').style.width = `${gameState.workProgress}%`;
}

function work() {
    if (gameState.isWorking) return; // Prevent spamming
    gameState.isWorking = true;
    gameState.workProgress = 0;
    updateWorkProgress();

    const interval = setInterval(() => {
        if (gameState.workProgress < 100) {
            gameState.workProgress += 5;
            updateWorkProgress();
        }
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        gameState.money += 50;
        gameState.workProgress = 0;
        gameState.isWorking = false;
        updateWorkProgress();
        updateDisplay();
    }, 2000);
}

function takeFairRisk() {
    // Implement fair risk logic here
    console.log('Fair risk button clicked');
}

function takeUnwiseRisk() {
    // Implement unwise risk logic here
    console.log('Unwise risk button clicked');
}

function buyCard(cardId, isNeed) {
    // Find the card in the appropriate array
    const cardArray = isNeed ? needsCards : wantsCards;
    const card = cardArray.find(c => c.id === cardId);

    if (!card || card.owned || card.lost) return;
    if (gameState.money < card.cost) return;

    gameState.money -= card.cost;
    card.owned = true;

    // Optionally, reveal next want card if buying a want
    if (!isNeed) {
        const nextWant = wantsCards.find(c => !c.visible && !c.owned);
        if (nextWant) nextWant.visible = true;
    }

    updateDisplay();
    showMessage(`You bought: ${card.name}`, 'success');
}

function endGame() {
    // Implement end game logic here
    console.log('End game button clicked');
}

function restartGame() {
    // Implement restart logic here
    console.log('Restart game button clicked');
    gameState = {
        money: 0,
        isWorking: false,
        workProgress: 0,
        gameEnded: false,
    };
    
    // Reset card states
    needsCards.forEach(card => {
        card.owned = false;
        card.lost = false;
    });
    
    wantsCards.forEach(card => {
        card.owned = false;
        card.visible = card.id === 'designer-clothes'; // Only first want visible initially
    });
    
    // Show game area, hide game over
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('risks-section').classList.add('hidden');
    
    updateDisplay();
}

// Start the game when page loads
window.addEventListener('load', initGame);
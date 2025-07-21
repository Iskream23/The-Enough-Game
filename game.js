// Game state variables
let gameState = {
    money: 0,
    billAmount: 0,
    isWorking: false,
    workProgress: 0,
    billingProgress: 0,
    gameEnded: false,
    unwiseRiskSuccesses: 0, // Track successful unwise risks
    totalUnwiseRisks: 0, // Track total unwise risks taken
};

// Sample card data structure
const needsCards = [
    { id: 'food', name: 'Basic Food Supply', cost: 500, owned: false, lost: false },
    { id: 'apartment', name: 'Rented Apartment', cost: 800, owned: false, lost: false },
    { id: 'healthcare', name: 'Health Insurance', cost: 600, owned: false, lost: false },
    { id: 'car', name: 'Reliable Used Car', cost: 1200, owned: false, lost: false },
    { id: 'emergency', name: 'Emergency Fund', cost: 1000, owned: false, lost: false },
    { id: 'clothes', name: 'Work Clothes', cost: 400, owned: false, lost: false }
];

const wantsCards = [
    { id: 'phone', name: 'Smartphone Upgrade', cost: 1000, owned: false, visible: true },
    { id: 'gym', name: 'Gym Membership', cost: 1500, owned: false, visible: true },
    { id: 'dining', name: 'Dining Out Budget', cost: 2000, owned: false, visible: true },
    { id: 'gaming', name: 'New Gaming Console', cost: 3000, owned: false, visible: false },
    { id: 'designer', name: 'Designer Wardrobe', cost: 5000, owned: false, visible: false },
    { id: 'luxury-car', name: 'Luxury Car', cost: 15000, owned: false, visible: false },
    { id: 'vacation', name: 'Dream Vacation', cost: 25000, owned: false, visible: false },
    { id: 'boat', name: 'Boat', cost: 50000, owned: false, visible: false },
    { id: 'vacation-home', name: 'Vacation Home', cost: 100000, owned: false, visible: false },
    { id: 'jet', name: 'Private Jet', cost: 500000, owned: false, visible: false },
];

// Risk variables
let unwiseRiskChance = 0.5;
let waitBeforeShowingRisks;
let risksWaitingTime = 30000;

const fairRiskBtn = document.getElementById('fair-risk');
const unwiseRiskBtn = document.getElementById('unwise-risk');

// Billing variables
let billInterval;
let billTime = 120; // seconds

// Initialize the game
function initGame() {
    gameState.billAmount = 500; // Initial bill amount

    updateDisplay();
    attachEventListeners();

    startBillTimer();
    
    showMessage('Welcome! Start by securing your essential needs.', 'info');

    // Wait before showing risks section
    if (waitBeforeShowingRisks) clearTimeout(waitBeforeShowingRisks);
    waitBeforeShowingRisks = setTimeout(() => {
        // Show the risks section
        document.getElementById('risks-section').classList.remove('hidden');
        // Disable the unwise risk button initially
        unwiseRiskBtn.disabled = true;
    }, risksWaitingTime);
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
    const totalNeeds = needsCards.length;
    document.getElementById('needs-count').textContent = `${ownedNeeds}/${totalNeeds}`;
    
    // Update wants count
    const ownedWants = wantsCards.filter(card => card.owned).length;
    const totalWants = wantsCards.length;
    document.getElementById('wants-count').textContent = `${ownedWants}/${totalWants}`;

    // Check if should enable unwise risk
    checkUnwiseRiskAvailability();
    
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
    
    /*wantsCards.filter(card => card.visible).forEach(card => {
        const cardElement = createCardElement(card, false);
        container.appendChild(cardElement);
    });*/

    // Show first 3 wants always, then reveal others as previous ones are bought
    let visibleCount = 3;
    const ownedCount = wantsCards.filter(card => card.owned).length;
    visibleCount = Math.min(visibleCount + ownedCount, wantsCards.length);
    
    wantsCards.slice(0, visibleCount).forEach(card => {
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
        ${!card.owned && !card.lost ? `<button class="buy-button" ${gameState.money < card.cost ? 'disabled' : ''}>Buy</button>` : ''}
        ${card.owned && !card.lost ? '<span style="color: #28a745;">✓ Owned</span>' : ''}
        ${card.lost ? '<span style="color: #dc3545;">✗ Lost</span>' : ''}
    `;

    // Attach event listener to Buy button
    if (!card.owned && !card.lost) {
        const buyBtn = cardDiv.querySelector('.buy-button');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => buyCard(card.id, isNeed));
        }
    }

    return cardDiv;
}

function showMessage(text, type) {
    const messageArea = document.getElementById('message-area');
    
    // Create message with appropriate styling
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    // Add to message area
    messageArea.prepend(messageDiv);
    
    // Remove old messages if too many
    while (messageArea.children.length > 3) {
        messageArea.removeChild(messageArea.lastChild);
    }
    
    // Auto-hide message after 5 seconds
    /*setTimeout(() => {
        if (messageArea.contains(messageDiv)) {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageArea.contains(messageDiv)) {
                    messageArea.removeChild(messageDiv);
                }
            }, 500);
        }
    }, 5000);*/
}

function updateWorkProgress() {
    const progressBar = document.getElementById('work-progress');
    progressBar.style.width = `${gameState.workProgress}%`;
}

function updateBillingProgress() {
    // Calculate billing progress as percentage of billTimeLeft
    if (typeof billTimeLeft !== 'undefined' && billTime > 0) {
        gameState.billingProgress = Math.round((billTimeLeft / billTime) * 100);
    } else {
        gameState.billingProgress = 0;
    }

    // Update the progress bar width
    const progressBar = document.getElementById('bills-progress');
    progressBar.style.width = `${gameState.billingProgress}%`;
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
        gameState.money += 100;
        gameState.workProgress = 0;
        gameState.isWorking = false;
        updateWorkProgress();
        updateDisplay();
    }, 2000);
}

function startBillTimer() {
    billTimeLeft = billTime;
    updateBillAmountDisplay();
    updateBillingProgress();

    if (billInterval) clearInterval(billInterval);
    billInterval = setInterval(() => {
        billTimeLeft--;
        updateBillAmountDisplay();
        updateBillingProgress();

        if (billTimeLeft <= 0) {
            payBill();
            billTimeLeft = billTime;
            updateBillAmountDisplay();
            updateBillingProgress();
        }
    }, 1000);
}

function updateBillAmountDisplay() {
    document.getElementById('bill-amount').textContent = `$${gameState.billAmount}`;
}

function payBill() {
    if (gameState.money >= gameState.billAmount) {
        gameState.money -= gameState.billAmount;
        showMessage(`Paid bills: $${gameState.billAmount}`, 'info');
        gameState.billAmount = Math.min(1000, gameState.billAmount + 50); // Cap at 1000
    } else {
        // Not enough money: take all remaining money and apply late penalty
        showMessage(`Couldn't pay full bills! Late payment penalty applied. (10%)`, 'error');
        gameState.money = 0;
        gameState.billAmount = Math.min(1000, Math.ceil(gameState.billAmount * 1.1)); // Increase by 10%, cap at 1000
    }
    updateDisplay();
}

function takeFairRisk() {
    if (gameState.gameEnded) return;

    const riskCost = 500;
    if (gameState.money < riskCost) {
        showMessage('Not enough money! You need $500.', 'error');
        return;
    }

    // Deduct the cost upfront
    gameState.money -= riskCost;

    // Disable both risk buttons temporarily
    fairRiskBtn.disabled = true;
    unwiseRiskBtn.disabled = true;

    setTimeout(() => {
        fairRiskBtn.disabled = false;
        // Only re-enable unwise risk if conditions allow
        checkUnwiseRiskAvailability();
    }, 5000);

    const chance = Math.random();

    if (chance < 0.6) {
        const payout = 1500; // 3x return
        gameState.money += payout;
        showMessage(`Success! You earned $${payout} from a calculated risk.`, 'success');
    } else {
        showMessage('It didn\'t pay off. You lost your $500 stake.', 'error');
    }
    updateDisplay();
}

function takeUnwiseRisk() {
    if (gameState.gameEnded) return;

    const riskCost = 1000;
    if (gameState.money < riskCost) {
        showMessage('Not enough money! You need $1000.', 'error');
        return;
    }

    // Deduct the cost upfront
    gameState.money -= riskCost;
    gameState.totalUnwiseRisks++;

    // Disable both risk buttons temporarily
    unwiseRiskBtn.disabled = true;
    fairRiskBtn.disabled = true;

    setTimeout(() => {
        fairRiskBtn.disabled = false;
        // Only re-enable unwise risk if conditions allow
        checkUnwiseRiskAvailability();
    }, 10000);

    const chance = Math.random();
    const currentChance = Math.max(0.1, unwiseRiskChance - (gameState.unwiseRiskSuccesses * 0.1));

    if (chance < currentChance) {
        const payout = 10000; // 10x return
        gameState.money += payout;
        gameState.unwiseRiskSuccesses++;
        showMessage(`Lucky! You earned $${payout} from a risky bet. (Success rate was ${Math.round(currentChance * 100)}%)`, 'success');
        
        // Make next risk harder
        unwiseRiskChance = Math.max(0.1, unwiseRiskChance - 0.1);
    } else {
        handleUnwiseRiskFailure();
    }

    updateDisplay();
}

function handleUnwiseRiskFailure() {
    const failureCount = gameState.totalUnwiseRisks - gameState.unwiseRiskSuccesses;
    
    if (failureCount === 1) {
        // First failure: lose $2000 total (already lost $1000)
        const additionalLoss = 1000;
        gameState.money = Math.max(0, gameState.money - additionalLoss);
        showMessage(`Bad luck! You lost an additional $${additionalLoss}.`, 'error');
    } else if (failureCount === 2) {
        // Second failure: lose $5000 + one want card
        const additionalLoss = 4000;
        gameState.money = Math.max(0, gameState.money - additionalLoss);
        
        const ownedWants = wantsCards.filter(c => c.owned && !c.lost);
        if (ownedWants.length > 0) {
            const lostCard = ownedWants[Math.floor(Math.random() * ownedWants.length)];
            lostCard.lost = true;
            showMessage(`Disaster! You lost $${additionalLoss} AND your "${lostCard.name}"!`, 'error');
        } else {
            showMessage(`Major loss! You lost $${additionalLoss}.`, 'error');
        }
    } else {
        // Third+ failure: lose $10000 + one need card (potential game over)
        const additionalLoss = 9000;
        gameState.money = Math.max(0, gameState.money - additionalLoss);
        
        const ownedNeeds = needsCards.filter(c => c.owned && !c.lost);
        if (ownedNeeds.length > 0) {
            const lostCard = ownedNeeds[Math.floor(Math.random() * ownedNeeds.length)];
            lostCard.lost = true;
            showMessage(`CATASTROPHE! You lost $${additionalLoss} AND your "${lostCard.name}"!`, 'error');
            
            // Check for game over
            setTimeout(() => {
                checkGameOver();
            }, 2000);
        } else {
            showMessage(`Massive loss! You lost $${additionalLoss}.`, 'error');
        }
    }
}

function checkUnwiseRiskAvailability() {
    // Only enable unwise risk if player has all needs cards
    const hasAllNeeds = needsCards.every(card => card.owned && !card.lost);
    unwiseRiskBtn.disabled = !hasAllNeeds;
    
    let showOnce = false;
    if (hasAllNeeds && !showOnce) {
        showMessage('You unlocked new opportunities!', 'success');
        showOnce = true;
    }
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

function checkGameOver() {
    const lostNeed = needsCards.some(card => card.lost);
    if (lostNeed) {
        gameState.gameEnded = true;
        clearInterval(billInterval);
        
        document.getElementById('game-area').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        // Update game over message
        const gameOverMsg = document.querySelector('#game-over h2');
        gameOverMsg.textContent = 'Game Over - You Lost What You Needed';
        
        const gameOverDetails = document.querySelector('#game-over p');
        gameOverDetails.textContent = 'You risked what you had and needed for what you didn\'t have and didn\'t need. The lesson: never gamble with necessities.';
    }
}

function endGame() {
    // Show first 3 wants always, then reveal others as previous ones are bought
    let visibleCount = 3;
    const ownedCount = wantsCards.filter(card => card.owned).length;
    visibleCount = Math.min(visibleCount + ownedCount, wantsCards.length);
    
    wantsCards.slice(0, visibleCount).forEach(card => {
        const cardElement = createCardElement(card, false);
        container.appendChild(cardElement);
    });
}

function restartGame() {
    gameState = {
        money: 0,
        billAmount: 500, // Reset initial bill amount
        isWorking: false,
        workProgress: 0,
        billingProgress: 0,
        gameEnded: false,
        unwiseRiskSuccesses: 0,
        totalUnwiseRisks: 0,
    };

    // Reset risk chance
    unwiseRiskChance = 0.5;

    // Reset card states
    needsCards.forEach(card => {
        card.owned = false;
        card.lost = false;
    });
    
    wantsCards.forEach(card => {
        card.owned = false;
        card.lost = false;
    });

    // Reset billing
    billTimeLeft = billTime;
    startBillTimer();

    // Show game area, hide game over
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('risks-section').classList.add('hidden');

    // Reset risk buttons
    fairRiskBtn.disabled = false;
    unwiseRiskBtn.disabled = true;

    // Reset the timer for showing risks
    if (waitBeforeShowingRisks) clearTimeout(waitBeforeShowingRisks);
    waitBeforeShowingRisks = setTimeout(() => {
        document.getElementById('risks-section').classList.remove('hidden');
        unwiseRiskBtn.disabled = true;
    }, risksWaitingTime);
    
    updateDisplay();

    showMessage('Welcome back! Start by securing your essential needs through steady work.', 'info');
    checkUnwiseRiskAvailability().showOnce = false;
}

// Start the game when page loads
window.addEventListener('load', initGame);
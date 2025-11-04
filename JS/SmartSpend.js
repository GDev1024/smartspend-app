// ============= DATA STRUCTURES =============

// Linked List for Transactions
let transactions = []; // Array simulating linked list (add to head with unshift)

// Queue for Savings (FIFO)
let savings = []; // Array simulating queue (enqueue with push)

// App State
let dailyAllowance = 0;
let currentModalType = '';

// ============= INITIALIZATION =============

function startApp() {
    const allowance = parseFloat(document.getElementById('allowanceInput').value);
    if (!allowance || allowance <= 0) {
        alert('Please enter a valid allowance amount');
        return;
    }
    
    dailyAllowance = allowance;
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    updateDashboard();
    loadFromStorage();
}

// ============= MODAL FUNCTIONS =============

function openModal(type) {
    currentModalType = type;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const descLabel = document.getElementById('modalDescLabel');
    
    if (type === 'expense') {
        title.textContent = 'Add Expense';
        descLabel.textContent = 'What did you spend on?';
    } else if (type === 'income') {
        title.textContent = 'Add Income';
        descLabel.textContent = 'Source of income';
    } else {
        title.textContent = 'Add to Savings';
        descLabel.textContent = 'Note (optional)';
    }
    
    document.getElementById('modalDesc').value = '';
    document.getElementById('modalAmount').value = '';
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function submitTransaction() {
    const desc = document.getElementById('modalDesc').value.trim() || 'Untitled';
    const amount = parseFloat(document.getElementById('modalAmount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (currentModalType === 'savings') {
        addToSavingsQueue(desc, amount);
    } else {
        addToTransactionList(desc, amount, currentModalType);
    }

    updateDashboard();
    saveToStorage();
    closeModal();
}

// ============= DATA STRUCTURE OPERATIONS =============

// Linked List: Add to head - O(1)
function addToTransactionList(description, amount, type) {
    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    transactions.unshift(transaction); // Add to head of list
    displayTransactions();
}

// Queue: Enqueue - O(1)
function addToSavingsQueue(description, amount) {
    const saving = {
        id: Date.now(),
        description: description,
        amount: amount,
        date: new Date().toLocaleDateString()
    };
    
    savings.push(saving); // Add to rear of queue
    displaySavings();
}

// Calculate total income - O(n)
function calculateTotalIncome() {
    let total = 0;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'income') {
            total += transactions[i].amount;
        }
    }
    return total;
}

// Calculate total expenses - O(n)
function calculateTotalExpenses() {
    let total = 0;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            total += transactions[i].amount;
        }
    }
    return total;
}

// Count expense transactions - O(n)
function countExpenses() {
    let count = 0;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            count++;
        }
    }
    return count;
}

// Calculate total savings - O(n)
function calculateTotalSavings() {
    let total = 0;
    for (let i = 0; i < savings.length; i++) {
        total += savings[i].amount;
    }
    return total;
}

// Search transaction by ID - O(n)
function findTransactionById(id) {
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            return i;
        }
    }
    return -1;
}

// Delete transaction - O(n)
function deleteTransaction(id) {
    const index = findTransactionById(id);
    if (index !== -1) {
        transactions.splice(index, 1);
        updateDashboard();
        saveToStorage();
    }
}

// Delete savings - O(n)
function deleteSaving(id) {
    const index = savings.findIndex(s => s.id === id);
    if (index !== -1) {
        savings.splice(index, 1);
        updateDashboard();
        saveToStorage();
    }
}

// ============= DISPLAY FUNCTIONS =============

function updateDashboard() {
    const income = calculateTotalIncome();
    const expenses = calculateTotalExpenses();
    const savingsTotal = calculateTotalSavings();
    const balance = income - expenses;

    document.getElementById('totalIncome').textContent = '$' + income.toFixed(2);
    document.getElementById('totalExpenses').textContent = '$' + expenses.toFixed(2);
    document.getElementById('balance').textContent = '$' + balance.toFixed(2);
    document.getElementById('totalSavings').textContent = '$' + savingsTotal.toFixed(2);

    displayTransactions();
    displaySavings();
}

function displayTransactions() {
    const list = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>📝 No transactions yet</p>
                <p class="small">Add your first expense or income to get started!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-desc">
                <strong>${t.description}</strong><br>
                <small>${t.date} at ${t.time}</small>
            </div>
            <div class="transaction-amount ${t.type === 'expense' ? 'transaction-expense' : 'transaction-income'}">
                ${t.type === 'expense' ? '-' : '+'}$${t.amount.toFixed(2)}
            </div>
            <button class="btn-small transaction-delete" onclick="deleteTransaction(${t.id})">Delete</button>
        </div>
    `).join('');
}

function displaySavings() {
    const list = document.getElementById('savingsList');
    
    if (savings.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>💰 No savings yet</p>
                <p class="small">Start saving today!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = savings.map(s => `
        <div class="savings-item">
            <div class="transaction-desc">
                <strong>${s.description}</strong><br>
                <small>${s.date}</small>
            </div>
            <div class="savings-amount">$${s.amount.toFixed(2)}</div>
            <button class="btn-small transaction-delete" onclick="deleteSaving(${s.id})">Delete</button>
        </div>
    `).join('');
}

// ============= PROJECTION ALGORITHM =============

function showProjection() {
    // Core Algorithm: Calculate projected savings
    const daysLeft = 30;
    const expenseCount = countExpenses();
    
    let avgSpending = 0;
    let projected = 0;
    
    if (expenseCount > 0) {
        const totalExpenses = calculateTotalExpenses();
        avgSpending = totalExpenses / expenseCount;
        const dailySurplus = dailyAllowance - avgSpending;
        projected = dailySurplus * daysLeft;
    } else {
        projected = dailyAllowance * daysLeft;
    }

    if (projected < 0) projected = 0;

    const currentSavings = calculateTotalSavings();
    const potentialTotal = currentSavings + projected;

    document.getElementById('projAllowance').textContent = '$' + dailyAllowance.toFixed(2);
    document.getElementById('projAvgSpending').textContent = '$' + avgSpending.toFixed(2);
    document.getElementById('projDaysLeft').textContent = daysLeft;
    document.getElementById('projSavings').textContent = '$' + projected.toFixed(2);
    document.getElementById('projTotal').textContent = '$' + potentialTotal.toFixed(2);

    document.getElementById('projectionCard').classList.remove('hidden');
}

function hideProjection() {
    document.getElementById('projectionCard').classList.add('hidden');
}

// ============= DATA MANAGEMENT =============

function clearTransactions() {
    if (confirm('Are you sure you want to clear all transactions?')) {
        transactions = [];
        updateDashboard();
        saveToStorage();
    }
}

function clearSavings() {
    if (confirm('Are you sure you want to clear all savings?')) {
        savings = [];
        updateDashboard();
        saveToStorage();
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
        transactions = [];
        savings = [];
        dailyAllowance = 0;
        updateDashboard();
        saveToStorage();
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('setupScreen').classList.remove('hidden');
        document.getElementById('allowanceInput').value = '';
    }
}

// ============= STORAGE FUNCTIONS =============

function saveToStorage() {
    const data = {
        transactions: transactions,
        savings: savings,
        dailyAllowance: dailyAllowance
    };
    // Note: Using in-memory storage as per requirements
    // In a real deployment, you could use localStorage here
}

function loadFromStorage() {
    // Note: Using in-memory storage as per requirements
    // In a real deployment, you could load from localStorage here
}

// ============= EXPORT FUNCTION =============

function exportData() {
    const data = {
        dailyAllowance: dailyAllowance,
        totalIncome: calculateTotalIncome(),
        totalExpenses: calculateTotalExpenses(),
        balance: calculateTotalIncome() - calculateTotalExpenses(),
        totalSavings: calculateTotalSavings(),
        transactions: transactions,
        savings: savings,
        exportDate: new Date().toLocaleString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smartspend-data-' + Date.now() + '.json';
    link.click();
    URL.revokeObjectURL(url);
}

// ============= UTILITY FUNCTIONS =============

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

function getCurrentDate() {
    return new Date().toLocaleDateString();
}

function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

// ============= EVENT LISTENERS =============

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Handle Enter key in inputs
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (document.getElementById('modal').classList.contains('active')) {
            submitTransaction();
        } else if (!document.getElementById('setupScreen').classList.contains('hidden')) {
            startApp();
        }
    }
});
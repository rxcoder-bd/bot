// ============================================================
// NX ERAN - Reward Handler JavaScript
// Version: 3.0.0
// ============================================================

const BOT_TOKEN = '8002896346:AAG96XdUmW6auh_xvmljrj7hQGKymXsqJtg';
const BOT_USERNAME = 'NxEranBot';

// ===== PROCESS REWARD =====
function processReward() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userid') || urlParams.get('reward') || urlParams.get('userId');
    const amount = parseFloat(urlParams.get('amount') || urlParams.get('rewardAmount') || 1);
    const adType = urlParams.get('adType') || 'ad';
    const transactionId = urlParams.get('transactionId') || Date.now().toString();

    const icon = document.getElementById('rewardIcon');
    const title = document.getElementById('rewardTitle');
    const spinner = document.getElementById('spinner');
    const amountDisplay = document.getElementById('rewardAmount');
    const status = document.getElementById('rewardStatus');
    const userDisplay = document.getElementById('rewardUser');
    const backBtn = document.getElementById('backBtn');

    userDisplay.textContent = `User ID: ${userId || 'Unknown'}`;
    amountDisplay.textContent = `+Ⓝ${amount.toFixed(2)}`;

    if (!userId) {
        icon.textContent = '❌';
        title.textContent = 'Invalid Request';
        status.textContent = 'No user ID provided';
        status.style.color = '#EF4444';
        spinner.style.display = 'none';
        backBtn.style.display = 'inline-block';
        return;
    }

    try {
        const userKey = `nxeran_userData_${userId}`;
        let userData = JSON.parse(localStorage.getItem(userKey) || '{}');

        if (!userData || Object.keys(userData).length === 0) {
            userData = {
                id: userId,
                firstName: 'User',
                username: 'user',
                balance: 0,
                totalEarn: 0,
                totalAds: 0,
                transactions: [],
                gigaRemaining: 30,
                monetagRemaining: 30,
                adsgramRemaining: 30,
                spinRemaining: 30,
                websiteRemaining: 30
            };
        }

        userData.balance = (userData.balance || 0) + amount;
        userData.totalEarn = (userData.totalEarn || 0) + amount;
        userData.totalAds = (userData.totalAds || 0) + 1;
        userData.todayEarnings = (userData.todayEarnings || 0) + amount;

        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift({
            type: 'ad_callback',
            title: `Ad Reward (${adType})`,
            amount: amount,
            date: new Date().toLocaleString(),
            icon: 'fa-check-circle',
            transactionId: transactionId,
            source: 'callback'
        });

        localStorage.setItem(userKey, JSON.stringify(userData));

        // Update admin data
        const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
        if (!adminData.users) adminData.users = [];
        const existing = adminData.users.find(u => u.id == userId);
        if (existing) {
            existing.balance = userData.balance;
            existing.totalEarn = userData.totalEarn;
            existing.totalAds = userData.totalAds;
        } else {
            adminData.users.push({
                id: userId,
                name: userData.firstName || 'User',
                username: userData.username || 'user',
                balance: userData.balance,
                totalEarn: userData.totalEarn,
                totalAds: userData.totalAds,
                status: 'active',
                joined: new Date().toLocaleDateString()
            });
        }
        localStorage.setItem('nxeran_adminData', JSON.stringify(adminData));

        icon.textContent = '✅';
        title.textContent = 'Reward Credited!';
        status.textContent = '🎉 Your reward has been added to your balance!';
        status.style.color = '#10B981';
        spinner.style.display = 'none';
        amountDisplay.style.color = '#F59E0B';
        backBtn.style.display = 'inline-block';

        sendBotMessage(userId, 
            `💰 <b>REWARD RECEIVED</b>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `You earned <b>Ⓝ${amount.toFixed(2)}</b> from watching an ad.\n` +
            `━━━━━━━━━━━━━━━━━━━━━`
        );

    } catch (error) {
        icon.textContent = '⚠️';
        title.textContent = 'Error';
        status.textContent = 'Failed to credit reward';
        status.style.color = '#EF4444';
        spinner.style.display = 'none';
        backBtn.style.display = 'inline-block';
        console.error('Reward error:', error);
    }
}

// ===== SEND BOT MESSAGE =====
function sendBotMessage(userId, message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: userId,
                text: `📢 <b>NX ERAN</b>\n\n${message}`,
                parse_mode: 'HTML'
            })
        }).catch(() => {});
    } catch(e) {}
}

// ===== AUTO CLOSE =====
setTimeout(() => {
    const backBtn = document.getElementById('backBtn');
    if (backBtn.style.display !== 'inline-block') {
        backBtn.style.display = 'inline-block';
        backBtn.textContent = '⏳ Redirecting...';
        setTimeout(() => {
            window.location.href = `https://t.me/${BOT_USERNAME}`;
        }, 2000);
    }
}, 5000);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', processReward);

console.log('🎯 Reward Handler Loaded');
console.log('📱 Bot: @' + BOT_USERNAME);

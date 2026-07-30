// ============================================================
// NX ERAN - Main JavaScript
// Version: 3.0.0
// ============================================================

// ===== CONFIGURATION =====
const CONFIG = {
    botApiToken: '8002896346:AAG96XdUmW6auh_xvmljrj7hQGKymXsqJtg',
    botUsername: 'NxEranBot',
    currency: 'Ⓝ',
    currencyRate: 100,
    adminId: '8407948229',
    adminUsername: '@RxCoderBD',
    rewardUrl: 'https://rxcoder-bd.github.io/bot/reward.html'
};

const DEFAULT_VISIT_LINKS = [
    'https://omg10.com/4/11457359',
    'https://omg10.com/4/11457361',
    'https://omg10.com/4/9898635',
    'https://omg10.com/4/11457363',
    'https://omg10.com/4/11457365'
];

// ===== STATE =====
let userData = {
    id: 'Loading...',
    username: 'User',
    firstName: 'User',
    balance: 0,
    todayEarnings: 0,
    todayAds: 0,
    totalAds: 0,
    referrals: [],
    level: 'Bronze',
    levelXP: 0,
    rank: 0,
    totalEarn: 0,
    totalWithdraw: 0,
    gigaRemaining: 30,
    monetagRemaining: 30,
    adsgramRemaining: 30,
    spinRemaining: 30,
    websiteRemaining: 30,
    completedTasks: [],
    referralLink: 'Loading...',
    joinedDate: new Date().toLocaleDateString(),
    transactions: [],
    withdrawHistory: [],
    achievements: [],
    isBanned: false,
    redeemedCodes: [],
    settings: {
        darkMode: false,
        notifications: true,
        sound: true
    }
};

let isAdRunning = false;
let isWebsiteTaskRunning = false;
let visitTimerInterval = null;
let adminSettings = {};
let adminLinks = {};
let adminTasks = [];
let leaderboardData = [];

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const loading = document.getElementById('loading-screen');
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            document.getElementById('app').classList.add('visible');
            initApp();
        }, 500);
    }, 1500);
});

// ===== INIT APP =====
function initApp() {
    initTelegram();
    loadUserData();
    loadAdminData();
    loadSettings();
    updateUI();
    initReferralLink();
    loadAnnouncement();
    renderRecentActivity();
    renderWithdrawHistory();
    renderAchievements();
    renderOfficialLinks();
    renderShortTasks();
    initAdsGramInterstitial();
    checkDailyReset();
    loadLeaderboard();
    updateLevel();
}

// ===== TELEGRAM INIT =====
function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        const user = tg.initDataUnsafe.user;
        if (user) {
            userData.id = user.id;
            userData.username = user.username || 'user';
            userData.firstName = user.first_name;
            
            document.getElementById('headerUsername').textContent = user.first_name;
            document.getElementById('headerUserId').textContent = 'ID: ' + user.id;
            document.getElementById('profileName').textContent = user.first_name + ' ' + (user.last_name || '');
            document.getElementById('profileUsername').textContent = '@' + (user.username || 'user');
            document.getElementById('profileUserId').textContent = user.id;
            document.getElementById('profileJoined').textContent = new Date().toLocaleDateString();
            
            if (user.photo_url) {
                document.getElementById('avatarImg').src = user.photo_url;
                document.getElementById('profileAvatarImg').src = user.photo_url;
            }
            
            checkUserStatus();
        }
    }
}

// ===== CHECK USER STATUS =====
function checkUserStatus() {
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    if (adminData.users) {
        const user = adminData.users.find(u => u.id == userData.id);
        if (user && user.status === 'banned') {
            userData.isBanned = true;
            document.getElementById('profileStatus').textContent = '● Banned';
            document.getElementById('profileStatus').style.color = 'var(--danger)';
            showBannedMessage();
        }
    }
}

// ===== BANNED USER MESSAGE =====
function showBannedMessage() {
    const adminId = adminSettings.contactAdminId || CONFIG.adminId;
    const adminUsername = adminSettings.adminUsername || '@RxCoderBD';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal" style="text-align:center; padding:30px; max-width:340px;">
            <div style="font-size:48px;">⛔</div>
            <h2 style="margin:16px 0; color:var(--text-primary);">Account Banned</h2>
            <p style="color:var(--text-secondary); font-size:14px;">Your account has been suspended.</p>
            <p style="color:var(--text-muted); margin-top:12px; font-size:13px;">
                Please contact admin for assistance:
            </p>
            <div style="margin:12px 0; padding:10px; background:var(--glass-bg); border-radius:8px;">
                <a href="https://t.me/${adminUsername.replace('@', '')}" target="_blank" 
                   style="color:var(--primary-light); text-decoration:none; font-weight:600;">
                    👤 ${adminUsername}
                </a>
                <div style="font-size:11px; color:var(--text-muted);">ID: ${adminId}</div>
            </div>
            <button onclick="this.closest('.modal-overlay').remove()" 
                    class="spin-btn" style="margin-top:12px; padding:10px 30px; font-size:13px;">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ===== LOAD ADMIN DATA =====
function loadAdminData() {
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    adminSettings = adminData.settings || {};
    adminLinks = adminData.links || {};
    adminTasks = adminData.tasks || [];
    
    document.getElementById('minWithdrawDisplay').textContent = adminSettings.minWithdraw || 20;
    document.getElementById('minWithdrawDisplay2').textContent = adminSettings.minWithdraw || 20;
    
    const limits = adminSettings.adLimits || {};
    userData.gigaRemaining = limits.giga || 30;
    userData.monetagRemaining = limits.monetag || 30;
    userData.adsgramRemaining = limits.adsgram || 30;
    userData.spinRemaining = limits.spin || 30;
    userData.websiteRemaining = limits.website || 30;
}

// ===== LOAD SETTINGS =====
function loadSettings() {
    const saved = localStorage.getItem('nxeran_userSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            userData.settings = settings;
            applySettings();
        } catch(e) {}
    }
}

function applySettings() {
    if (userData.settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        document.getElementById('darkModeToggle').classList.add('active');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').classList.remove('active');
    }
    
    if (userData.settings.notifications) {
        document.getElementById('notificationToggle').classList.add('active');
    } else {
        document.getElementById('notificationToggle').classList.remove('active');
    }
    
    if (userData.settings.sound) {
        document.getElementById('soundToggle').classList.add('active');
    } else {
        document.getElementById('soundToggle').classList.remove('active');
    }
}

function saveSettings() {
    localStorage.setItem('nxeran_userSettings', JSON.stringify(userData.settings));
}

// ===== TOGGLE FUNCTIONS =====
function toggleDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    toggle.classList.toggle('active');
    userData.settings.darkMode = toggle.classList.contains('active');
    applySettings();
    saveSettings();
}

function toggleNotification() {
    const toggle = document.getElementById('notificationToggle');
    toggle.classList.toggle('active');
    userData.settings.notifications = toggle.classList.contains('active');
    saveSettings();
    if (userData.settings.notifications) {
        showNotification('Notifications enabled');
    }
}

function toggleSound() {
    const toggle = document.getElementById('soundToggle');
    toggle.classList.toggle('active');
    userData.settings.sound = toggle.classList.contains('active');
    saveSettings();
}

// ===== USER DATA =====
function loadUserData() {
    const key = 'nxeran_userData_' + (userData.id || 'default');
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(userData, parsed);
        } catch(e) {}
    }
}

function saveUserData() {
    const key = 'nxeran_userData_' + (userData.id || 'default');
    localStorage.setItem(key, JSON.stringify(userData));
    syncWithAdmin();
}

function syncWithAdmin() {
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    if (!adminData.users) adminData.users = [];
    const existing = adminData.users.find(u => u.id == userData.id);
    if (existing) {
        existing.balance = userData.balance;
        existing.totalEarn = userData.totalEarn;
        existing.todayAds = userData.todayAds;
        existing.totalAds = userData.totalAds;
        existing.referrals = userData.referrals ? userData.referrals.length : 0;
        existing.level = userData.level;
        existing.name = userData.firstName;
        existing.username = userData.username;
    } else {
        adminData.users.push({
            id: userData.id,
            name: userData.firstName,
            username: userData.username,
            balance: userData.balance,
            totalEarn: userData.totalEarn,
            todayAds: userData.todayAds,
            totalAds: userData.totalAds,
            referrals: userData.referrals ? userData.referrals.length : 0,
            level: userData.level,
            status: 'active',
            joined: new Date().toLocaleDateString()
        });
    }
    localStorage.setItem('nxeran_adminData', JSON.stringify(adminData));
}

// ===== DAILY RESET =====
function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('nxeran_lastReset_' + userData.id);
    
    const adminReset = localStorage.getItem('nxeran_forceReset');
    if (adminReset === 'true') {
        performDailyReset();
        localStorage.removeItem('nxeran_forceReset');
        return;
    }
    
    if (lastReset !== today) {
        performDailyReset();
        localStorage.setItem('nxeran_lastReset_' + userData.id, today);
    }
}

function performDailyReset() {
    const limits = adminSettings.adLimits || {};
    userData.gigaRemaining = limits.giga || 30;
    userData.monetagRemaining = limits.monetag || 30;
    userData.adsgramRemaining = limits.adsgram || 30;
    userData.spinRemaining = limits.spin || 30;
    userData.websiteRemaining = limits.website || 30;
    userData.todayEarnings = 0;
    userData.todayAds = 0;
    saveUserData();
    updateUI();
    showNotification('🔄 Daily limits have been reset!');
}

// ===== REFERRAL LINK =====
function initReferralLink() {
    const link = `https://t.me/${CONFIG.botUsername}?start=ref${userData.id}`;
    userData.referralLink = link;
    document.getElementById('referralLink').textContent = link;
}

function copyReferral() {
    navigator.clipboard.writeText(userData.referralLink).then(() => {
        showNotification('Referral link copied!');
    });
}

// ===== LOAD ANNOUNCEMENT =====
function loadAnnouncement() {
    const announcement = JSON.parse(localStorage.getItem('nxeran_announcement') || '{"text":"🎉 Welcome to NX ERAN! Start earning now!","time":"Today"}');
    document.getElementById('announcementText').textContent = announcement.text;
    document.getElementById('announcementTime').textContent = announcement.time;
}

// ===== NAVIGATION =====
function navigateTo(section) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const targetSection = document.getElementById('section-' + section);
    if (targetSection) targetSection.classList.add('active');
    
    const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');
    
    showAdsGramInterstitial();
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

// ===== UPDATE UI =====
function updateUI() {
    const balanceFormatted = userData.balance.toFixed(2);
    document.getElementById('headerBalance').textContent = balanceFormatted;
    document.getElementById('homeBalance').textContent = balanceFormatted;
    document.getElementById('walletBalance').textContent = 'Ⓝ' + balanceFormatted;
    
    document.getElementById('todayIncome').textContent = '+Ⓝ' + userData.todayEarnings.toFixed(2);
    document.getElementById('todayAds').textContent = userData.todayAds;
    document.getElementById('totalAds').textContent = userData.totalAds;
    const referralCount = userData.referrals ? userData.referrals.length : 0;
    document.getElementById('totalReferrals').textContent = referralCount;
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('userRank').textContent = '#' + (userData.rank || '--');
    document.getElementById('totalEarn').textContent = 'Ⓝ' + userData.totalEarn.toFixed(2);
    document.getElementById('totalWithdraw').textContent = 'Ⓝ' + userData.totalWithdraw.toFixed(2);
    document.getElementById('walletToday').textContent = '+Ⓝ' + userData.todayEarnings.toFixed(2);
    document.getElementById('walletTotal').textContent = 'Ⓝ' + userData.totalEarn.toFixed(2);
    document.getElementById('refCount').textContent = referralCount;
    document.getElementById('refEarnings').textContent = 'Ⓝ' + (referralCount * 0.1).toFixed(2);
    
    document.getElementById('gigaRemaining').textContent = userData.gigaRemaining;
    document.getElementById('monetagRemaining').textContent = userData.monetagRemaining;
    document.getElementById('adsgramRemaining').textContent = userData.adsgramRemaining;
    document.getElementById('spinRemaining').textContent = userData.spinRemaining;
    document.getElementById('spinRemainingModal').textContent = userData.spinRemaining;
    document.getElementById('websiteRemaining').textContent = userData.websiteRemaining;
    document.getElementById('visitRemaining').textContent = userData.websiteRemaining;
    
    document.getElementById('referBadge').textContent = referralCount > 0 ? referralCount : '';
    
    const badges = {
        'Bronze': '🌟 New Member',
        'Silver': '🔥 Active User',
        'Gold': '💎 Premium Member',
        'Platinum': '👑 Top Earner',
        'Diamond': '🏆 Elite Member',
        'Master': '⭐ Master'
    };
    document.getElementById('profileBadge').textContent = badges[userData.level] || '🌟 New Member';
    document.getElementById('profileLevel').textContent = userData.level;
    
    const pending = userData.withdrawHistory ? 
        userData.withdrawHistory.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0) : 0;
    document.getElementById('walletPending').textContent = 'Ⓝ' + pending.toFixed(2);
    
    saveUserData();
}

// ===== RECENT ACTIVITY =====
function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    const transactions = userData.transactions || [];
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="activity-item">
                <div class="left">
                    <div class="icon"><i class="fas fa-info"></i></div>
                    <div class="info">
                        <div class="title">No activity yet</div>
                        <div class="time">Start earning now!</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.slice(0, 5).map(t => {
        const isPositive = t.amount > 0;
        return `
            <div class="activity-item">
                <div class="left">
                    <div class="icon"><i class="fas ${t.icon || 'fa-coins'}"></i></div>
                    <div class="info">
                        <div class="title">${t.title}</div>
                        <div class="time">${t.date || 'Just now'}</div>
                    </div>
                </div>
                <div class="amount ${isPositive ? 'green' : 'red'}">${isPositive ? '+' : ''}Ⓝ${t.amount.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

// ===== WITHDRAW HISTORY =====
function renderWithdrawHistory() {
    const container = document.getElementById('withdrawHistory');
    const history = userData.withdrawHistory || [];
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="activity-item">
                <div class="left">
                    <div class="icon"><i class="fas fa-clock"></i></div>
                    <div class="info">
                        <div class="title">No withdraw requests</div>
                        <div class="time">Your history will appear here</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = history.map(w => {
        const statusColors = {
            'pending': 'gold',
            'completed': 'green',
            'rejected': 'red'
        };
        return `
            <div class="activity-item">
                <div class="left">
                    <div class="icon"><i class="fas fa-wallet"></i></div>
                    <div class="info">
                        <div class="title">${w.method} - ${w.status}</div>
                        <div class="time">${w.date} • ${w.account || ''}</div>
                    </div>
                </div>
                <div class="amount ${statusColors[w.status] || ''}">-Ⓝ${w.amount.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

// ===== ACHIEVEMENTS =====
function renderAchievements() {
    const container = document.getElementById('achievementsList');
    const achievements = [
        { id: 'firstAd', name: 'First Ad Watched', desc: 'Watch your first ad', icon: 'fa-play', unlocked: userData.totalAds > 0 },
        { id: 'hundredAds', name: '100 Ads Club', desc: 'Watch 100 ads', icon: 'fa-film', unlocked: userData.totalAds >= 100 },
        { id: 'thousandAds', name: 'Ad Master', desc: 'Watch 1000 ads', icon: 'fa-crown', unlocked: userData.totalAds >= 1000 },
        { id: 'firstReferral', name: 'First Referral', desc: 'Refer your first friend', icon: 'fa-user-plus', unlocked: (userData.referrals?.length || 0) > 0 },
        { id: 'tenReferrals', name: 'Referral Star', desc: 'Refer 10 friends', icon: 'fa-star', unlocked: (userData.referrals?.length || 0) >= 10 },
        { id: 'hundredEarn', name: 'Earn Ⓝ100', desc: 'Earn 100 Nxona coins', icon: 'fa-coins', unlocked: userData.totalEarn >= 100 },
        { id: 'thousandEarn', name: 'Earn Ⓝ1000', desc: 'Earn 1000 Nxona coins', icon: 'fa-gem', unlocked: userData.totalEarn >= 1000 }
    ];
    
    container.innerHTML = achievements.map(a => `
        <div class="achievement">
            <div class="icon ${a.unlocked ? 'unlocked' : ''}"><i class="fas ${a.icon}"></i></div>
            <div class="info">
                <div class="name">${a.name}</div>
                <div class="desc">${a.desc}</div>
            </div>
            <div class="status ${a.unlocked ? 'unlocked' : 'locked'}">${a.unlocked ? '✅ Unlocked' : '🔒 Locked'}</div>
        </div>
    `).join('');
}

// ===== OFFICIAL LINKS =====
function renderOfficialLinks() {
    const container = document.getElementById('officialLinks');
    const links = adminLinks || {};
    const linkData = [
        { icon: 'fa-globe', name: 'Website', url: links.website || 'https://nxona.online' },
        { icon: 'fa-telegram', name: 'Group', url: links.group || '#' },
        { icon: 'fa-telegram', name: 'Channel', url: links.channel || '#' },
        { icon: 'fa-headset', name: 'Support', url: links.support || '#' },
        { icon: 'fa-facebook', name: 'Facebook', url: links.facebook || '#' },
        { icon: 'fa-youtube', name: 'YouTube', url: links.youtube || '#' },
        { icon: 'fa-instagram', name: 'Instagram', url: links.instagram || '#' },
        { icon: 'fa-twitter', name: 'X', url: links.twitter || '#' }
    ];
    
    container.innerHTML = linkData.map(link => `
        <a href="${link.url}" target="_blank" class="link-btn" style="${!link.url || link.url === '#' ? 'opacity:0.4;cursor:default;' : ''}">
            <i class="fab ${link.icon}"></i> ${link.name}
        </a>
    `).join('');
}

// ===== SHORT TASKS =====
function renderShortTasks() {
    const container = document.getElementById('shortTasks');
    const tasks = adminTasks || [];
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="task-card">
                <div class="task-icon" style="background: linear-gradient(135deg, #6C3CE1, #EC4899);"><i class="fas fa-plus"></i></div>
                <div class="task-info">
                    <div class="name">No tasks available</div>
                    <div class="details">Check back later for new tasks</div>
                </div>
            </div>
        `;
        return;
    }
    
    const icons = {
        'telegram': 'fa-telegram',
        'youtube': 'fa-youtube',
        'facebook': 'fa-facebook',
        'instagram': 'fa-instagram',
        'twitter': 'fa-twitter',
        'discord': 'fa-discord'
    };
    
    const colors = {
        'telegram': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        'youtube': 'linear-gradient(135deg, #FF0000, #CC0000)',
        'facebook': 'linear-gradient(135deg, #4267B2, #365899)',
        'instagram': 'linear-gradient(135deg, #F58529, #DD2A7B)',
        'twitter': 'linear-gradient(135deg, #1DA1F2, #0D8BD9)',
        'discord': 'linear-gradient(135deg, #5865F2, #4752C4)'
    };
    
    container.innerHTML = tasks.map(task => {
        const isCompleted = userData.completedTasks && userData.completedTasks.includes(task.id);
        return `
            <div class="task-card">
                <div class="task-icon" style="background: ${colors[task.type] || 'linear-gradient(135deg, #6C3CE1, #EC4899)'};">
                    <i class="fab ${icons[task.type] || 'fa-tasks'}"></i>
                </div>
                <div class="task-info">
                    <div class="name">${task.name}</div>
                    <div class="details">
                        <span><i class="fas fa-coins"></i> ${task.reward}</span>
                        <span><i class="fas fa-clock"></i> ${task.time || '2 min'}</span>
                        ${task.link ? `<span><i class="fas fa-link"></i> <a href="${task.link}" target="_blank" style="color:var(--primary-light);">Visit</a></span>` : ''}
                    </div>
                </div>
                <button class="task-btn ${isCompleted ? 'completed' : ''}" onclick="openTask('${task.id}')" ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? '✅ Completed' : 'Start'}
                </button>
            </div>
        `;
    }).join('');
}

// ===== WATCH ADS =====
function watchAd(network) {
    if (isAdRunning) return;
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    
    let remaining = 0;
    let adFunction = null;
    
    switch(network) {
        case 'gigapub':
            remaining = userData.gigaRemaining;
            adFunction = showGigaPubAd;
            break;
        case 'monetag':
            remaining = userData.monetagRemaining;
            adFunction = showMonetagAd;
            break;
        case 'adsgram':
            remaining = userData.adsgramRemaining;
            adFunction = showAdsGramRewardAd;
            break;
        default:
            return;
    }
    
    if (remaining <= 0) {
        showNotification(`Daily limit reached for ${network}!`);
        return;
    }
    
    isAdRunning = true;
    const btn = document.getElementById(network + 'Btn');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
    
    adFunction().then(() => {
        const reward = 1;
        userData.balance += reward;
        userData.todayEarnings += reward;
        userData.totalEarn += reward;
        userData.todayAds += 1;
        userData.totalAds += 1;
        
        switch(network) {
            case 'gigapub':
                userData.gigaRemaining -= 1;
                break;
            case 'monetag':
                userData.monetagRemaining -= 1;
                break;
            case 'adsgram':
                userData.adsgramRemaining -= 1;
                break;
        }
        
        userData.transactions.unshift({
            type: 'ad',
            title: `${network} Ad Reward`,
            amount: reward,
            date: new Date().toLocaleString(),
            icon: 'fa-play'
        });
        
        isAdRunning = false;
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-${network === 'gigapub' ? 'bolt' : network === 'monetag' ? 'fire' : 'star'}"></i> ${network.charAt(0).toUpperCase() + network.slice(1)}`;
        updateUI();
        renderRecentActivity();
        renderAchievements();
        updateLevel();
        showNotification(`+Ⓝ${reward} earned from ${network}!`);
    }).catch(() => {
        isAdRunning = false;
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-${network === 'gigapub' ? 'bolt' : network === 'monetag' ? 'fire' : 'star'}"></i> ${network.charAt(0).toUpperCase() + network.slice(1)}`;
        showNotification('Ad failed. Please try again.');
    });
}

// ===== GIGAPUB AD =====
function showGigaPubAd() {
    return new Promise((resolve, reject) => {
        try {
            const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
            const gigaId = adminData.adIds?.gigapub || '1476';
            
            if (typeof window.showGiga !== 'function') {
                const script = document.createElement('script');
                script.src = `https://ad.gigapub.tech/script?id=${gigaId}`;
                script.onload = () => {
                    window.showGiga().then(resolve).catch(reject);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                window.showGiga().then(resolve).catch(reject);
            }
        } catch(e) {
            setTimeout(resolve, 3000);
        }
    });
}

// ===== MONETAG AD =====
function showMonetagAd() {
    return new Promise((resolve, reject) => {
        try {
            const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
            const monetagZone = adminData.adIds?.monetag || '9388728';
            
            if (typeof show_9388728 === 'function') {
                show_9388728().then(resolve).catch(reject);
            } else {
                const script = document.createElement('script');
                script.src = `//libtl.com/sdk.js`;
                script.setAttribute('data-zone', monetagZone);
                script.setAttribute('data-sdk', `show_${monetagZone}`);
                script.onload = () => {
                    if (typeof window[`show_${monetagZone}`] === 'function') {
                        window[`show_${monetagZone}`]().then(resolve).catch(reject);
                    } else {
                        setTimeout(resolve, 3000);
                    }
                };
                script.onerror = () => setTimeout(resolve, 3000);
                document.head.appendChild(script);
            }
        } catch(e) {
            setTimeout(resolve, 3000);
        }
    });
}

// ===== ADSGRAM REWARD AD =====
function showAdsGramRewardAd() {
    return new Promise((resolve, reject) => {
        try {
            const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
            const blockId = adminData.adIds?.adsgram_reward || 'reward-block-id';
            
            if (typeof window.Adsgram === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://sad.adsgram.ai/js/sad.min.js';
                script.onload = () => {
                    showAdsGramAd(blockId, resolve, reject);
                };
                script.onerror = () => setTimeout(resolve, 3000);
                document.head.appendChild(script);
            } else {
                showAdsGramAd(blockId, resolve, reject);
            }
        } catch(e) {
            setTimeout(resolve, 3000);
        }
    });
}

function showAdsGramAd(blockId, resolve, reject) {
    try {
        const AdController = window.Adsgram.init({ blockId: blockId });
        AdController.show()
            .then((result) => {
                if (result.done) {
                    resolve();
                } else {
                    reject(new Error('Ad not completed'));
                }
            })
            .catch(reject);
    } catch(e) {
        setTimeout(resolve, 3000);
    }
}

// ===== ADSGRAM INTERSTITIAL =====
let interstitialCount = 0;

function initAdsGramInterstitial() {
    showAdsGramInterstitial();
}

function showAdsGramInterstitial() {
    if (interstitialCount % 3 !== 0) {
        interstitialCount++;
        return;
    }
    interstitialCount++;
    
    try {
        const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
        const blockId = adminData.adIds?.adsgram_interstitial || 'interstitial-block-id';
        
        if (typeof window.Adsgram !== 'undefined') {
            const AdController = window.Adsgram.init({ blockId: blockId });
            AdController.show().catch(() => {});
        }
    } catch(e) {}
}

// ===== SPIN WHEEL =====
function openSpin() {
    if (userData.spinRemaining <= 0) {
        showNotification('Daily spin limit reached!');
        return;
    }
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    document.getElementById('spinModal').classList.add('active');
}

function spinWheel() {
    if (userData.spinRemaining <= 0) {
        showNotification('No spins left today!');
        closeModal('spinModal');
        return;
    }

    const btn = document.getElementById('spinBtn');
    btn.disabled = true;
    btn.textContent = '🎰 Spinning...';

    showMonetagAd().then(() => {
        const rewards = [
            { amount: 0.5, weight: 40 },
            { amount: 0.75, weight: 25 },
            { amount: 1, weight: 20 },
            { amount: 2, weight: 10 },
            { amount: 3, weight: 5 }
        ];
        
        let totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;
        let reward = rewards[0];
        
        for (let r of rewards) {
            random -= r.weight;
            if (random <= 0) {
                reward = r;
                break;
            }
        }

        const wheel = document.getElementById('spinWheel');
        const rotations = 5 + Math.random() * 5;
        const degrees = rotations * 360;
        wheel.style.transform = `rotate(${degrees}deg)`;

        setTimeout(() => {
            userData.balance += reward.amount;
            userData.todayEarnings += reward.amount;
            userData.totalEarn += reward.amount;
            userData.spinRemaining -= 1;
            
            userData.transactions.unshift({
                type: 'spin',
                title: 'Lucky Spin Reward',
                amount: reward.amount,
                date: new Date().toLocaleString(),
                icon: 'fa-gem'
            });
            
            btn.disabled = false;
            btn.textContent = '🎰 Spin Now';
            updateUI();
            renderRecentActivity();
            updateLevel();
            closeModal('spinModal');
            showNotification(`🎉 You won Ⓝ${reward.amount.toFixed(2)}!`);
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        }, 4000);
    }).catch(() => {
        btn.disabled = false;
        btn.textContent = '🎰 Spin Now';
        showNotification('Ad failed. Please try again.');
    });
}

// ===== VISIT WEBSITE =====
function startWebsiteVisit() {
    if (isWebsiteTaskRunning) return;
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    if (userData.websiteRemaining <= 0) {
        showNotification('Daily website visit limit reached!');
        return;
    }
    document.getElementById('visitModal').classList.add('active');
    const duration = 12 + Math.floor(Math.random() * 11);
    document.getElementById('visitTimer').textContent = duration;
}

function openVisitLink() {
    if (isWebsiteTaskRunning) return;
    if (userData.websiteRemaining <= 0) {
        showNotification('Daily limit reached!');
        return;
    }
    
    isWebsiteTaskRunning = true;
    const btn = document.getElementById('visitStartBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Watching...';

    const visitLinks = JSON.parse(localStorage.getItem('nxeran_visitLinks') || JSON.stringify(DEFAULT_VISIT_LINKS));
    const link = visitLinks[Math.floor(Math.random() * visitLinks.length)];
    if (link) window.open(link, '_blank');

    const timerDisplay = document.getElementById('visitTimer');
    let seconds = parseInt(timerDisplay.textContent);
    
    visitTimerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(visitTimerInterval);
            userData.balance += 1;
            userData.todayEarnings += 1;
            userData.totalEarn += 1;
            userData.totalAds += 1;
            userData.websiteRemaining -= 1;
            
            userData.transactions.unshift({
                type: 'website',
                title: 'Website Visit Reward',
                amount: 1,
                date: new Date().toLocaleString(),
                icon: 'fa-globe'
            });
            
            isWebsiteTaskRunning = false;
            btn.disabled = false;
            btn.textContent = '🌐 Visit Now';
            updateUI();
            renderRecentActivity();
            updateLevel();
            closeModal('visitModal');
            showNotification('+Ⓝ1 earned!');
        }
    }, 1000);
}

// ===== TELEGRAM MEMBERSHIP CHECK =====
async function checkTelegramMembership(userId, channelUsername) {
    try {
        const url = `https://api.telegram.org/bot${CONFIG.botApiToken}/getChatMember?chat_id=@${channelUsername}&user_id=${userId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.ok) {
            const status = data.result.status;
            return status === 'member' || status === 'administrator' || status === 'creator';
        }
        return false;
    } catch(e) {
        return false;
    }
}

// ===== TASKS =====
function openTask(taskId) {
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    
    if (userData.completedTasks && userData.completedTasks.includes(taskId)) {
        showNotification('You have already completed this task!');
        return;
    }
    
    const task = adminTasks.find(t => t.id == taskId);
    if (!task) {
        showNotification('Task not found!');
        return;
    }
    
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    const content = document.getElementById('taskModalContent');

    let taskContent = '';
    
    if (task.type === 'telegram') {
        taskContent = `
            <div style="text-align:center;">
                <p style="color:var(--text-secondary); margin-bottom:12px; font-size:13px;">
                    1. Join the Telegram channel<br>
                    2. After joining, click "Verify" to claim reward
                </p>
                <a href="${task.link || 'https://t.me/NxEranBot'}" target="_blank" class="spin-btn" style="text-decoration:none; display:block; text-align:center; background: linear-gradient(135deg, #3B82F6, #8B5CF6); font-size:14px; padding:10px;">
                    Join Channel
                </a>
                <button class="spin-btn" style="margin-top:8px; background: linear-gradient(135deg, #10B981, #059669); font-size:14px; padding:10px;" onclick="verifyTask('${taskId}')">
                    ✅ Verify
                </button>
            </div>
        `;
    } else if (task.type === 'youtube' || task.type === 'facebook' || task.type === 'instagram' || task.type === 'twitter') {
        taskContent = `
            <div style="text-align:center;">
                <p style="color:var(--text-secondary); margin-bottom:12px; font-size:13px;">
                    1. ${task.type === 'youtube' ? 'Subscribe to our YouTube channel' : task.type === 'facebook' ? 'Follow our Facebook page' : task.type === 'instagram' ? 'Follow our Instagram' : 'Follow our X (Twitter)'}<br>
                    2. Enter your username below<br>
                    3. Submit for review
                </p>
                ${task.link ? `<a href="${task.link}" target="_blank" class="spin-btn" style="text-decoration:none; display:block; text-align:center; font-size:14px; padding:10px; margin-bottom:8px;">Visit Page</a>` : ''}
                <input type="text" id="taskUsername" placeholder="Your Username" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:var(--glass-bg); color:white; font-size:14px; margin-bottom:8px;">
                <button class="spin-btn" style="background: linear-gradient(135deg, #4267B2, #365899); font-size:14px; padding:10px;" onclick="submitTask('${taskId}')">
                    Submit
                </button>
            </div>
        `;
    } else {
        taskContent = `
            <div style="text-align:center;">
                <p style="color:var(--text-secondary); margin-bottom:12px; font-size:13px;">
                    Complete this task to earn rewards!
                </p>
                ${task.link ? `<a href="${task.link}" target="_blank" class="spin-btn" style="text-decoration:none; display:block; text-align:center; font-size:14px; padding:10px; margin-bottom:8px;">Visit</a>` : ''}
                <button class="spin-btn" style="background: linear-gradient(135deg, #10B981, #059669); font-size:14px; padding:10px;" onclick="verifyTask('${taskId}')">
                    ✅ Complete
                </button>
            </div>
        `;
    }

    title.textContent = task.name;
    content.innerHTML = taskContent;
    modal.classList.add('active');
}

async function verifyTask(taskId) {
    const task = adminTasks.find(t => t.id == taskId);
    if (!task) {
        showNotification('Task not found!');
        return;
    }
    if (userData.completedTasks && userData.completedTasks.includes(taskId)) {
        showNotification('You already completed this task!');
        return;
    }
    
    // Telegram task check
    if (task.type === 'telegram' && task.link) {
        const match = task.link.match(/t\.me\/([^\/\?]+)/);
        if (match) {
            const channel = match[1];
            const isMember = await checkTelegramMembership(userData.id, channel);
            if (!isMember) {
                showNotification('❌ You are not a member of the channel!');
                return;
            }
        }
    }
    
    const rewardAmount = parseFloat(task.reward.replace('Ⓝ', '')) || 5;
    userData.balance += rewardAmount;
    userData.totalEarn += rewardAmount;
    userData.todayEarnings += rewardAmount;
    if (!userData.completedTasks) userData.completedTasks = [];
    userData.completedTasks.push(taskId);
    userData.transactions.unshift({
        type: 'task',
        title: `Task Reward: ${task.name}`,
        amount: rewardAmount,
        date: new Date().toLocaleString(),
        icon: 'fa-check'
    });
    updateUI();
    renderRecentActivity();
    renderShortTasks();
    updateLevel();
    closeModal('taskModal');
    showNotification(`✅ Task completed! +Ⓝ${rewardAmount} earned!`);
}

function submitTask(taskId) {
    const input = document.getElementById('taskUsername');
    if (!input || !input.value.trim()) {
        showNotification('Please enter your username');
        return;
    }
    
    const task = adminTasks.find(t => t.id == taskId);
    if (!task) {
        showNotification('Task not found!');
        return;
    }
    
    showNotification('✅ Submitted for review!');
    
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    if (!adminData.pendingTasks) adminData.pendingTasks = [];
    adminData.pendingTasks.push({
        id: Date.now(),
        userId: userData.id,
        userName: userData.firstName,
        taskName: task.name,
        taskId: taskId,
        username: input.value.trim(),
        date: new Date().toLocaleString()
    });
    localStorage.setItem('nxeran_adminData', JSON.stringify(adminData));
    
    closeModal('taskModal');
}

// ===== WITHDRAW =====
let currentWithdrawMethod = 'bkash';

function showWithdraw(method) {
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    if (!adminSettings.allowWithdraw) {
        showNotification('Withdrawals are currently disabled');
        return;
    }
    currentWithdrawMethod = method;
    const titles = {
        'bkash': 'Withdraw to bKash',
        'nagad': 'Withdraw to Nagad',
        'binance': 'Withdraw to Binance',
        'nxonapay': 'Withdraw to NxonaPay'
    };
    const labels = {
        'bkash': 'bKash Number',
        'nagad': 'Nagad Number',
        'binance': 'Binance UID',
        'nxonapay': 'Username / Wallet Address'
    };
    const fees = {
        'bkash': adminSettings.withdrawFee || 0.05,
        'nagad': adminSettings.withdrawFee || 0.05,
        'binance': 0,
        'nxonapay': 0
    };
    const mins = {
        'bkash': adminSettings.minWithdraw || 20,
        'nagad': adminSettings.minWithdraw || 20,
        'binance': 10,
        'nxonapay': 10
    };

    document.getElementById('withdrawTitle').textContent = titles[method];
    document.getElementById('withdrawLabel').textContent = labels[method];
    document.getElementById('withdrawFee').textContent = 'Ⓝ' + fees[method];
    document.getElementById('withdrawMin').textContent = 'Ⓝ' + mins[method];
    document.getElementById('withdrawModal').classList.add('active');
}

function submitWithdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('withdrawAccount').value;

    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount');
        return;
    }

    const minAmounts = {
        'bkash': adminSettings.minWithdraw || 20,
        'nagad': adminSettings.minWithdraw || 20,
        'binance': 10,
        'nxonapay': 10
    };
    if (amount < minAmounts[currentWithdrawMethod]) {
        showNotification(`Minimum withdraw is Ⓝ${minAmounts[currentWithdrawMethod]}`);
        return;
    }

    if (amount > userData.balance) {
        showNotification('Insufficient balance!');
        return;
    }

    const hasPending = userData.withdrawHistory ? 
        userData.withdrawHistory.some(w => w.status === 'pending') : false;
    if (hasPending) {
        showNotification('You have a pending withdrawal request!');
        return;
    }

    userData.balance -= amount;
    userData.totalWithdraw += amount;
    
    if (!userData.withdrawHistory) userData.withdrawHistory = [];
    userData.withdrawHistory.unshift({
        id: Date.now(),
        amount: amount,
        method: currentWithdrawMethod,
        account: account,
        status: 'pending',
        date: new Date().toLocaleString(),
        userId: userData.id,
        userName: userData.firstName
    });
    
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    if (!adminData.withdrawals) adminData.withdrawals = [];
    adminData.withdrawals.unshift({
        id: Date.now(),
        amount: amount,
        method: currentWithdrawMethod,
        account: account,
        status: 'pending',
        date: new Date().toLocaleString(),
        userId: userData.id,
        userName: userData.firstName
    });
    localStorage.setItem('nxeran_adminData', JSON.stringify(adminData));
    
    updateUI();
    renderWithdrawHistory();
    closeModal('withdrawModal');
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAccount').value = '';
    showNotification(`✅ Withdrawal of Ⓝ${amount.toFixed(2)} submitted!`);
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
}

// ===== REDEEM CODE =====
function redeemCode(code) {
    if (userData.isBanned) {
        showNotification('⛔ Your account is banned!');
        return;
    }
    if (!code) {
        showNotification('Please enter a code');
        return;
    }
    const codes = JSON.parse(localStorage.getItem('nxeran_redeem_codes') || '[]');
    const found = codes.find(c => c.code === code && c.usedCount < c.maxUses);
    if (!found) {
        showNotification('❌ Invalid or expired code!');
        return;
    }
    if (userData.redeemedCodes && userData.redeemedCodes.includes(code)) {
        showNotification('❌ You already redeemed this code!');
        return;
    }
    userData.balance += found.amount;
    userData.totalEarn += found.amount;
    found.usedCount += 1;
    if (!userData.redeemedCodes) userData.redeemedCodes = [];
    userData.redeemedCodes.push(code);
    localStorage.setItem('nxeran_redeem_codes', JSON.stringify(codes));
    saveUserData();
    updateUI();
    updateLevel();
    showNotification(`✅ Redeemed Ⓝ${found.amount}!`);
}

// ===== LEADERBOARD =====
function loadLeaderboard() {
    const saved = localStorage.getItem('nxeran_leaderboard');
    if (saved) {
        try {
            leaderboardData = JSON.parse(saved);
        } catch(e) {
            leaderboardData = [];
        }
    }
    if (leaderboardData.length === 0) {
        syncLeaderboard();
    }
}

function syncLeaderboard() {
    const adminData = JSON.parse(localStorage.getItem('nxeran_adminData') || '{}');
    const users = adminData.users || [];
    leaderboardData = users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        balance: u.balance || 0,
        totalEarn: u.totalEarn || 0,
        level: u.level || 'Bronze',
        totalAds: u.totalAds || 0
    }));
    leaderboardData.sort((a, b) => b.totalEarn - a.totalEarn);
    leaderboardData.forEach((user, index) => {
        user.rank = index + 1;
    });
    localStorage.setItem('nxeran_leaderboard', JSON.stringify(leaderboardData));
    const current = leaderboardData.find(u => u.id == userData.id);
    if (current) {
        userData.rank = current.rank;
        saveUserData();
    }
}

// ===== LEVEL SYSTEM =====
function updateLevel() {
    const xp = userData.totalAds + (userData.totalEarn * 10) + (userData.referrals ? userData.referrals.length * 50 : 0);
    userData.levelXP = xp;
    let level = 'Bronze';
    if (xp >= 10000) level = 'Master';
    else if (xp >= 5000) level = 'Diamond';
    else if (xp >= 2000) level = 'Platinum';
    else if (xp >= 1000) level = 'Gold';
    else if (xp >= 500) level = 'Silver';
    userData.level = level;
    saveUserData();
}

// ===== MODALS =====
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if (id === 'visitModal' && visitTimerInterval) {
        clearInterval(visitTimerInterval);
        visitTimerInterval = null;
        isWebsiteTaskRunning = false;
        document.getElementById('visitStartBtn').disabled = false;
        document.getElementById('visitStartBtn').textContent = '🌐 Visit Now';
    }
}

// ===== NOTIFICATION =====
function showNotification(message) {
    if (!userData.settings.notifications) return;
    
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(el => {
            el.classList.remove('active');
        });
        if (visitTimerInterval) {
            clearInterval(visitTimerInterval);
            visitTimerInterval = null;
            isWebsiteTaskRunning = false;
            document.getElementById('visitStartBtn').disabled = false;
            document.getElementById('visitStartBtn').textContent = '🌐 Visit Now';
        }
    }
});

console.log('🚀 NX ERAN Loaded Successfully!');
console.log('📱 Bot: @' + CONFIG.botUsername);
console.log('💰 Currency: ' + CONFIG.currency);
console.log('👤 User ID:', userData.id);
console.log('👑 Admin: ' + CONFIG.adminUsername);

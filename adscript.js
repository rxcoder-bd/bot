// ============================================================
// NX ERAN - Admin Panel JavaScript
// Version: 3.0.0
// ============================================================

// ===== CONFIG =====
const ADMIN_ID = '8407948229';
const BOT_TOKEN = '8002896346:AAG96XdUmW6auh_xvmljrj7hQGKymXsqJtg';
const DEFAULT_PASSWORD = 'Rx';

// ===== ADMIN STATE =====
let adminData = {
    users: [],
    withdrawals: [],
    tasks: [],
    pendingTasks: [],
    visitLinks: [],
    adminIds: ['8407948229'],
    subAdmins: [],
    redeemCodes: [],
    adIds: {
        gigapub: '',
        monetag: '',
        adsgram_reward: '',
        adsgram_interstitial: '',
        adsgram_task: ''
    },
    adLimits: {
        giga: 30,
        monetag: 30,
        adsgram: 30,
        spin: 30,
        website: 30
    },
    settings: {
        minWithdraw: 20,
        withdrawFee: 0.05,
        allowWithdraw: true,
        allowTasks: true,
        allowSpin: true,
        allowWebsite: true,
        adminPassword: 'Rx',
        contactAdminId: '8407948229',
        contactAdminUsername: '@RxCoderBD'
    },
    links: {
        website: 'https://nxona.online',
        group: 'https://t.me/NxEranGroup',
        channel: 'https://t.me/NxEranChannel',
        support: 'https://t.me/NxEranSupport',
        facebook: 'https://facebook.com/nxona',
        youtube: 'https://youtube.com/nxona',
        instagram: 'https://instagram.com/nxona',
        twitter: 'https://twitter.com/nxona'
    },
    announcement: {
        text: '🎉 Welcome to NX ERAN! Start earning now!',
        time: 'Today'
    }
};

const DEFAULT_VISIT_LINKS = [
    'https://omg10.com/4/11457359',
    'https://omg10.com/4/11457361',
    'https://omg10.com/4/9898635',
    'https://omg10.com/4/11457363',
    'https://omg10.com/4/11457365'
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    updateUI();
    loadAnnouncement();
    renderVisitLinks();
    renderAdminIds();
    renderSubAdmins();
    renderRedeemCodes();
});

// ===== LOAD ADMIN DATA =====
function loadAdminData() {
    const saved = localStorage.getItem('nxeran_adminData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(adminData, parsed);
        } catch(e) {}
    }
    
    // Load ad IDs
    document.getElementById('gigaId').value = adminData.adIds?.gigapub || '';
    document.getElementById('monetagId').value = adminData.adIds?.monetag || '';
    document.getElementById('adsgramRewardId').value = adminData.adIds?.adsgram_reward || '';
    document.getElementById('adsgramInterstitialId').value = adminData.adIds?.adsgram_interstitial || '';
    document.getElementById('adsgramTaskId').value = adminData.adIds?.adsgram_task || '';
    
    // Load limits
    document.getElementById('gigaLimit').value = adminData.adLimits?.giga || 30;
    document.getElementById('monetagLimit').value = adminData.adLimits?.monetag || 30;
    document.getElementById('adsgramLimit').value = adminData.adLimits?.adsgram || 30;
    document.getElementById('spinLimit').value = adminData.adLimits?.spin || 30;
    document.getElementById('websiteLimit').value = adminData.adLimits?.website || 30;
    
    // Load settings
    document.getElementById('minWithdraw').value = adminData.settings?.minWithdraw || 20;
    document.getElementById('withdrawFee').value = adminData.settings?.withdrawFee || 0.05;
    document.getElementById('allowWithdraw').checked = adminData.settings?.allowWithdraw !== false;
    document.getElementById('allowTasks').checked = adminData.settings?.allowTasks !== false;
    document.getElementById('allowSpin').checked = adminData.settings?.allowSpin !== false;
    document.getElementById('allowWebsite').checked = adminData.settings?.allowWebsite !== false;
    document.getElementById('mainAdminId').value = adminData.adminIds?.[0] || '8407948229';
    document.getElementById('contactAdminUsername').value = adminData.settings?.contactAdminUsername || '@RxCoderBD';
    document.getElementById('contactAdminId').value = adminData.settings?.contactAdminId || '8407948229';
    
    // Load links
    if (adminData.links) {
        document.getElementById('linkWebsite').value = adminData.links.website || '';
        document.getElementById('linkGroup').value = adminData.links.group || '';
        document.getElementById('linkChannel').value = adminData.links.channel || '';
        document.getElementById('linkSupport').value = adminData.links.support || '';
        document.getElementById('linkFacebook').value = adminData.links.facebook || '';
        document.getElementById('linkYoutube').value = adminData.links.youtube || '';
        document.getElementById('linkInstagram').value = adminData.links.instagram || '';
        document.getElementById('linkTwitter').value = adminData.links.twitter || '';
    }
    
    // Load visit links
    if (!adminData.visitLinks || adminData.visitLinks.length === 0) {
        adminData.visitLinks = [...DEFAULT_VISIT_LINKS];
    }
}

// ===== SAVE ADMIN DATA =====
function saveAdminData() {
    localStorage.setItem('nxeran_adminData', JSON.stringify(adminData));
    localStorage.setItem('nxeran_visitLinks', JSON.stringify(adminData.visitLinks));
    localStorage.setItem('nxeran_announcement', JSON.stringify(adminData.announcement));
    localStorage.setItem('nxeran_redeem_codes', JSON.stringify(adminData.redeemCodes || []));
}

// ===== ADMIN LOGIN =====
function adminLogin() {
    const userId = document.getElementById('loginUserId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    
    const isMainAdmin = adminData.adminIds?.includes(userId) || userId === ADMIN_ID;
    const isSubAdmin = adminData.subAdmins?.some(s => s.id === userId);
    
    if (!isMainAdmin && !isSubAdmin) {
        errorDiv.textContent = '❌ Unauthorized! You are not an admin.';
        errorDiv.style.display = 'block';
        return;
    }
    
    const storedPassword = adminData.settings?.adminPassword || DEFAULT_PASSWORD;
    if (password !== storedPassword) {
        errorDiv.textContent = '❌ Incorrect password!';
        errorDiv.style.display = 'block';
        return;
    }
    
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    errorDiv.style.display = 'none';
    
    if (isSubAdmin) {
        const sub = adminData.subAdmins.find(s => s.id === userId);
        applyPermissions(sub.permissions);
    }
    
    loadAdminData();
    updateUI();
    showNotification('✅ Welcome Admin!');
}

// ===== APPLY PERMISSIONS =====
function applyPermissions(permissions) {
    if (permissions === 'full') return;
    const allowedTabs = permissions?.tabs || ['dashboard'];
    document.querySelectorAll('.admin-tab').forEach(tab => {
        const tabName = tab.dataset.tab;
        if (!allowedTabs.includes(tabName) && tabName !== 'dashboard') {
            tab.style.display = 'none';
        }
    });
}

// ===== CHANGE PASSWORD =====
function changeAdminPassword() {
    const currentPass = prompt('Enter current password:');
    if (currentPass !== (adminData.settings?.adminPassword || DEFAULT_PASSWORD)) {
        showNotification('❌ Incorrect current password!');
        return;
    }
    const newPass = prompt('Enter new password (minimum 3 characters):');
    if (newPass && newPass.length >= 3) {
        adminData.settings.adminPassword = newPass;
        saveAdminData();
        showNotification('✅ Password updated successfully!');
    } else {
        showNotification('❌ Password must be at least 3 characters!');
    }
}

// ===== ADMIN ID MANAGEMENT =====
function renderAdminIds() {
    const container = document.getElementById('adminIdsList');
    const ids = adminData.adminIds || [];
    if (ids.length === 0 || (ids.length === 1 && ids[0] === ADMIN_ID)) {
        container.innerHTML = '<div class="empty-state">No additional admins</div>';
        return;
    }
    container.innerHTML = ids.filter(id => id !== ADMIN_ID).map(id => `
        <div class="user-item">
            <div class="info">
                <div class="name">${id}</div>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="removeAdminId('${id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addAdminId() {
    const id = document.getElementById('newAdminId').value.trim();
    if (!id) {
        showNotification('Please enter an ID');
        return;
    }
    if (!adminData.adminIds) adminData.adminIds = [ADMIN_ID];
    if (adminData.adminIds.includes(id)) {
        showNotification('Already added!');
        return;
    }
    adminData.adminIds.push(id);
    saveAdminData();
    document.getElementById('newAdminId').value = '';
    renderAdminIds();
    showNotification('✅ Admin added!');
}

function removeAdminId(id) {
    if (confirm('Remove this admin?')) {
        adminData.adminIds = adminData.adminIds.filter(a => a !== id);
        saveAdminData();
        renderAdminIds();
        showNotification('Admin removed!');
    }
}

function changeMainAdmin() {
    const newId = prompt('Enter new Main Admin ID:');
    if (newId && newId.trim()) {
        if (!adminData.adminIds) adminData.adminIds = [ADMIN_ID];
        if (!adminData.adminIds.includes(newId.trim())) {
            adminData.adminIds.push(newId.trim());
        }
        document.getElementById('mainAdminId').value = newId.trim();
        saveAdminData();
        showNotification('✅ Main Admin updated!');
    }
}

// ===== SUB-ADMIN MANAGEMENT =====
function renderSubAdmins() {
    const container = document.getElementById('subAdminsList');
    const subs = adminData.subAdmins || [];
    if (subs.length === 0) {
        container.innerHTML = '<div class="empty-state">No sub-admins</div>';
        return;
    }
    container.innerHTML = subs.map(s => `
        <div class="user-item">
            <div class="info">
                <div class="name">${s.id}</div>
                <div class="id">Permissions: ${s.permissions}</div>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="removeSubAdmin('${s.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addSubAdmin() {
    const id = document.getElementById('newSubAdminId').value.trim();
    const perm = document.getElementById('subAdminPerm').value;
    if (!id) {
        showNotification('Please enter User ID');
        return;
    }
    if (!adminData.subAdmins) adminData.subAdmins = [];
    if (adminData.subAdmins.some(s => s.id === id)) {
        showNotification('Already a sub-admin!');
        return;
    }
    adminData.subAdmins.push({ id, permissions: perm });
    saveAdminData();
    document.getElementById('newSubAdminId').value = '';
    renderSubAdmins();
    showNotification('✅ Sub-admin added!');
}

function removeSubAdmin(id) {
    if (confirm('Remove this sub-admin?')) {
        adminData.subAdmins = adminData.subAdmins.filter(s => s.id !== id);
        saveAdminData();
        renderSubAdmins();
        showNotification('Sub-admin removed!');
    }
}

// ===== CONTACT ADMIN =====
function saveContactAdmin() {
    const username = document.getElementById('contactAdminUsername').value.trim();
    const id = document.getElementById('contactAdminId').value.trim();
    if (username && id) {
        adminData.settings.contactAdminUsername = username;
        adminData.settings.contactAdminId = id;
        saveAdminData();
        showNotification('✅ Contact admin saved!');
    }
}

// ===== TABS =====
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        if (this.dataset.tab === 'dashboard') updateDashboard();
        if (this.dataset.tab === 'users') renderUsers();
        if (this.dataset.tab === 'withdrawals') renderWithdrawals();
        if (this.dataset.tab === 'tasks') renderTasks();
        if (this.dataset.tab === 'redeem') renderRedeemCodes();
    });
});

// ===== UPDATE UI =====
function updateUI() {
    updateDashboard();
    renderUsers();
    renderWithdrawals();
    renderTasks();
}

// ===== DASHBOARD =====
function updateDashboard() {
    document.getElementById('totalUsers').textContent = adminData.users.length;
    const pending = adminData.withdrawals ? adminData.withdrawals.filter(w => w.status === 'pending').length : 0;
    document.getElementById('totalWithdrawals').textContent = pending;
    const totalEarn = adminData.users.reduce((sum, u) => sum + (u.totalEarn || 0), 0);
    document.getElementById('totalEarnings').textContent = 'Ⓝ' + totalEarn.toFixed(2);
    const today = new Date().toDateString();
    const todayUsers = adminData.users.filter(u => u.todayAds > 0);
    document.getElementById('todayUsers').textContent = todayUsers.length;
}

// ===== USERS =====
function renderUsers() {
    const container = document.getElementById('userList');
    document.getElementById('userCount').textContent = `(${adminData.users.length})`;
    
    if (adminData.users.length === 0) {
        container.innerHTML = '<div class="empty-state">No users found</div>';
        return;
    }
    
    container.innerHTML = adminData.users.map(user => `
        <div class="user-item">
            <div class="info">
                <div class="name">${user.name} <span class="status-badge ${user.status}">${user.status}</span></div>
                <div class="id">ID: ${user.id} | @${user.username}</div>
                <div class="balance">Ⓝ ${(user.balance || 0).toFixed(2)} | Level: ${user.level} | Ads: ${user.totalAds || 0}</div>
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="editUserBalance('${user.id}')"><i class="fas fa-edit"></i></button>
                ${user.status === 'active' ? 
                    `<button class="ban-btn" onclick="banUser('${user.id}')"><i class="fas fa-ban"></i></button>` :
                    `<button class="unban-btn" onclick="unbanUser('${user.id}')"><i class="fas fa-check"></i></button>`
                }
            </div>
        </div>
    `).join('');
}

function searchUser() {
    const query = document.getElementById('searchUser').value.toLowerCase().trim();
    const container = document.getElementById('searchResult');
    
    if (!query) {
        container.innerHTML = '';
        return;
    }
    
    const results = adminData.users.filter(u => 
        u.id.toString().includes(query) || 
        u.username.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:10px;">No users found</div>';
        return;
    }
    
    container.innerHTML = results.map(user => `
        <div class="user-item">
            <div class="info">
                <div class="name">${user.name} <span class="status-badge ${user.status}">${user.status}</span></div>
                <div class="id">ID: ${user.id} | @${user.username}</div>
                <div class="balance">Ⓝ ${(user.balance || 0).toFixed(2)} | Level: ${user.level}</div>
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="editUserBalance('${user.id}')"><i class="fas fa-edit"></i></button>
                ${user.status === 'active' ? 
                    `<button class="ban-btn" onclick="banUser('${user.id}')"><i class="fas fa-ban"></i></button>` :
                    `<button class="unban-btn" onclick="unbanUser('${user.id}')"><i class="fas fa-check"></i></button>`
                }
            </div>
        </div>
    `).join('');
}

function editUserBalance(userId) {
    const amount = prompt('Enter new balance amount (Ⓝ):');
    if (amount !== null) {
        const user = adminData.users.find(u => u.id == userId);
        if (user) {
            user.balance = parseFloat(amount) || 0;
            const userKey = 'nxeran_userData_' + userId;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.balance = user.balance;
            localStorage.setItem(userKey, JSON.stringify(userData));
            saveAdminData();
            renderUsers();
            showNotification('Balance updated!');
            sendMessageToUser(userId, 
                `💰 <b>BALANCE UPDATED</b>\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `Your balance has been updated to <b>Ⓝ${user.balance.toFixed(2)}</b> by admin.\n` +
                `━━━━━━━━━━━━━━━━━━━━━`
            );
        }
    }
}

function banUser(userId) {
    if (confirm('Ban this user?')) {
        const user = adminData.users.find(u => u.id == userId);
        if (user) {
            user.status = 'banned';
            const userKey = 'nxeran_userData_' + userId;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.isBanned = true;
            localStorage.setItem(userKey, JSON.stringify(userData));
            saveAdminData();
            renderUsers();
            showNotification('User banned!');
            sendMessageToUser(userId, 
                `⛔ <b>ACCOUNT BANNED</b>\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `Your account has been banned by admin.\n` +
                `Please contact support for assistance.\n` +
                `━━━━━━━━━━━━━━━━━━━━━`
            );
        }
    }
}

function unbanUser(userId) {
    const user = adminData.users.find(u => u.id == userId);
    if (user) {
        user.status = 'active';
        const userKey = 'nxeran_userData_' + userId;
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        userData.isBanned = false;
        localStorage.setItem(userKey, JSON.stringify(userData));
        saveAdminData();
        renderUsers();
        showNotification('User unbanned!');
        sendMessageToUser(userId, 
            `✅ <b>ACCOUNT UNBANNED</b>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `Your account has been unbanned by admin.\n` +
            `You can now continue earning!\n` +
            `━━━━━━━━━━━━━━━━━━━━━`
        );
    }
}

// ===== WITHDRAWALS =====
function renderWithdrawals() {
    const pendingContainer = document.getElementById('pendingWithdrawals');
    const pending = adminData.withdrawals ? adminData.withdrawals.filter(w => w.status === 'pending') : [];
    document.getElementById('pendingCount').textContent = `(${pending.length})`;
    
    if (pending.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-state">No pending withdrawals</div>';
    } else {
        pendingContainer.innerHTML = pending.map(w => `
            <div class="withdraw-item">
                <div class="info">
                    <div class="user">${w.userName || 'User'} (${w.userId})</div>
                    <div class="details">${w.method} - ${w.account}</div>
                    <div class="amount">Ⓝ ${w.amount.toFixed(2)}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${w.date}</div>
                </div>
                <div class="actions">
                    <button class="approve-btn" onclick="approveWithdraw('${w.id}')">✅ Approve</button>
                    <button class="reject-btn" onclick="rejectWithdraw('${w.id}')">❌ Reject</button>
                </div>
            </div>
        `).join('');
    }

    const historyContainer = document.getElementById('withdrawHistory');
    const history = adminData.withdrawals ? adminData.withdrawals.filter(w => w.status !== 'pending') : [];
    if (history.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No withdrawal history</div>';
    } else {
        historyContainer.innerHTML = history.map(w => `
            <div class="withdraw-item">
                <div class="info">
                    <div class="user">${w.userName || 'User'} (${w.userId})</div>
                    <div class="details">${w.method} - ${w.account}</div>
                    <div class="amount">Ⓝ ${w.amount.toFixed(2)}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${w.date} · <span class="status-badge ${w.status}">${w.status}</span></div>
                </div>
            </div>
        `).join('');
    }
}

function approveWithdraw(id) {
    if (!confirm('✅ Approve this withdrawal?')) return;
    
    const w = adminData.withdrawals.find(w => w.id == id);
    if (!w) {
        showNotification('❌ Withdrawal not found!');
        return;
    }
    
    w.status = 'completed';
    const userKey = 'nxeran_userData_' + w.userId;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    if (userData.withdrawHistory) {
        const wh = userData.withdrawHistory.find(wh => wh.id == id);
        if (wh) wh.status = 'completed';
        localStorage.setItem(userKey, JSON.stringify(userData));
    }
    saveAdminData();
    renderWithdrawals();
    showNotification('✅ Withdrawal approved!');
    
    sendMessageToUser(w.userId, 
        `✅ <b>WITHDRAWAL APPROVED</b>\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 Amount: <b>Ⓝ${w.amount.toFixed(2)}</b>\n` +
        `📱 Method: <b>${w.method}</b>\n` +
        `📅 Date: <b>${w.date}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✅ Your withdrawal has been approved and processed.`
    );
}

function rejectWithdraw(id) {
    if (!confirm('❌ Reject this withdrawal?')) return;
    
    const w = adminData.withdrawals.find(w => w.id == id);
    if (!w) {
        showNotification('❌ Withdrawal not found!');
        return;
    }
    
    w.status = 'rejected';
    const userKey = 'nxeran_userData_' + w.userId;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    if (userData) {
        userData.balance = (userData.balance || 0) + w.amount;
        if (userData.withdrawHistory) {
            const wh = userData.withdrawHistory.find(wh => wh.id == id);
            if (wh) wh.status = 'rejected';
        }
        localStorage.setItem(userKey, JSON.stringify(userData));
        const adminUser = adminData.users.find(u => u.id == w.userId);
        if (adminUser) adminUser.balance = userData.balance;
    }
    saveAdminData();
    renderWithdrawals();
    showNotification('❌ Withdrawal rejected! Balance refunded.');
    
    sendMessageToUser(w.userId, 
        `❌ <b>WITHDRAWAL REJECTED</b>\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 Amount: <b>Ⓝ${w.amount.toFixed(2)}</b>\n` +
        `📱 Method: <b>${w.method}</b>\n` +
        `📅 Date: <b>${w.date}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `❌ Your withdrawal has been rejected.\n` +
        `💸 The amount has been <b>refunded</b> to your balance.`
    );
}

// ===== TASKS =====
function renderTasks() {
    const container = document.getElementById('taskList');
    if (!adminData.tasks || adminData.tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks added</div>';
    } else {
        container.innerHTML = adminData.tasks.map((task, index) => `
            <div class="task-item">
                <div class="info">
                    <div class="name">${task.name}</div>
                    <div class="details">Reward: ${task.reward} | Type: ${task.type} | Time: ${task.time || '2 min'} ${task.link ? '| 🔗 Link added' : ''}</div>
                </div>
                <div class="actions">
                    <button class="delete-btn" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    const pendingContainer = document.getElementById('pendingTasks');
    if (!adminData.pendingTasks || adminData.pendingTasks.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-state">No pending submissions</div>';
    } else {
        pendingContainer.innerHTML = adminData.pendingTasks.map((task, index) => `
            <div class="task-item">
                <div class="info">
                    <div class="name">${task.userName} - ${task.taskName}</div>
                    <div class="details">${task.username || task.details || ''} | ${task.date}</div>
                </div>
                <div class="actions">
                    <button class="approve-btn" onclick="approveTask(${index})">✅ Approve</button>
                    <button class="reject-btn" onclick="rejectTask(${index})">❌ Reject</button>
                </div>
            </div>
        `).join('');
    }
}

function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const reward = document.getElementById('taskReward').value.trim();
    const type = document.getElementById('taskType').value;
    const time = document.getElementById('taskTime').value.trim() || '2 min';
    const link = document.getElementById('taskLink').value.trim();
    
    if (!name || !reward) {
        showNotification('Please fill name and reward');
        return;
    }
    
    if (!adminData.tasks) adminData.tasks = [];
    adminData.tasks.push({ 
        id: 'task_' + Date.now(),
        name, 
        reward, 
        type, 
        time,
        link: link || ''
    });
    saveAdminData();
    document.getElementById('taskName').value = '';
    document.getElementById('taskReward').value = '';
    document.getElementById('taskTime').value = '';
    document.getElementById('taskLink').value = '';
    renderTasks();
    showNotification('Task added!');
}

function deleteTask(index) {
    if (confirm('Delete this task?')) {
        adminData.tasks.splice(index, 1);
        saveAdminData();
        renderTasks();
        showNotification('Task deleted!');
    }
}

function approveTask(index) {
    const task = adminData.pendingTasks[index];
    if (task) {
        const reward = parseFloat(task.reward) || 5;
        const userKey = 'nxeran_userData_' + task.userId;
        const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
        if (userData) {
            userData.balance = (userData.balance || 0) + reward;
            userData.totalEarn = (userData.totalEarn || 0) + reward;
            if (!userData.completedTasks) userData.completedTasks = [];
            userData.completedTasks.push(task.taskId);
            localStorage.setItem(userKey, JSON.stringify(userData));
            const adminUser = adminData.users.find(u => u.id == task.userId);
            if (adminUser) {
                adminUser.balance = userData.balance;
                adminUser.totalEarn = userData.totalEarn;
            }
        }
        adminData.pendingTasks.splice(index, 1);
        saveAdminData();
        renderTasks();
        showNotification(`Task approved! +Ⓝ${reward} given.`);
        sendMessageToUser(task.userId, 
            `✅ <b>TASK APPROVED</b>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 Task: <b>${task.taskName}</b>\n` +
            `💰 Reward: <b>+Ⓝ${reward}</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `✅ Your task submission has been approved!`
        );
    }
}

function rejectTask(index) {
    const task = adminData.pendingTasks[index];
    if (task) {
        adminData.pendingTasks.splice(index, 1);
        saveAdminData();
        renderTasks();
        showNotification('Task rejected!');
        sendMessageToUser(task.userId, 
            `❌ <b>TASK REJECTED</b>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 Task: <b>${task.taskName}</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `❌ Your task submission has been rejected.`
        );
    }
}

// ===== REDEEM CODES =====
function createRedeemCode() {
    const code = document.getElementById('redeemCode').value.trim().toUpperCase();
    const amount = parseFloat(document.getElementById('redeemAmount').value);
    const maxUses = parseInt(document.getElementById('redeemMaxUses').value);
    
    if (!code || !amount || !maxUses) {
        showNotification('Please fill all fields');
        return;
    }
    
    if (!adminData.redeemCodes) adminData.redeemCodes = [];
    if (adminData.redeemCodes.some(c => c.code === code)) {
        showNotification('Code already exists!');
        return;
    }
    
    adminData.redeemCodes.push({
        code,
        amount,
        maxUses,
        usedCount: 0,
        created: new Date().toISOString()
    });
    localStorage.setItem('nxeran_redeem_codes', JSON.stringify(adminData.redeemCodes));
    saveAdminData();
    
    document.getElementById('redeemCode').value = '';
    document.getElementById('redeemAmount').value = '';
    document.getElementById('redeemMaxUses').value = '';
    renderRedeemCodes();
    showNotification(`✅ Redeem code "${code}" created!`);
}

function renderRedeemCodes() {
    const container = document.getElementById('redeemCodesList');
    const codes = adminData.redeemCodes || [];
    if (codes.length === 0) {
        container.innerHTML = '<div class="empty-state">No codes created</div>';
        return;
    }
    container.innerHTML = codes.map(c => `
        <div class="task-item">
            <div class="info">
                <div class="name">${c.code}</div>
                <div class="details">Amount: Ⓝ${c.amount} | Uses: ${c.usedCount}/${c.maxUses}</div>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="deleteRedeemCode('${c.code}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function deleteRedeemCode(code) {
    if (confirm('Delete this code?')) {
        adminData.redeemCodes = adminData.redeemCodes.filter(c => c.code !== code);
        localStorage.setItem('nxeran_redeem_codes', JSON.stringify(adminData.redeemCodes));
        saveAdminData();
        renderRedeemCodes();
        showNotification('Code deleted!');
    }
}

// ===== ADS =====
function saveAdIds() {
    adminData.adIds = {
        gigapub: document.getElementById('gigaId').value.trim(),
        monetag: document.getElementById('monetagId').value.trim(),
        adsgram_reward: document.getElementById('adsgramRewardId').value.trim(),
        adsgram_interstitial: document.getElementById('adsgramInterstitialId').value.trim(),
        adsgram_task: document.getElementById('adsgramTaskId').value.trim()
    };
    saveAdminData();
    showNotification('Ad IDs saved!');
}

function saveLimits() {
    adminData.adLimits = {
        giga: parseInt(document.getElementById('gigaLimit').value) || 30,
        monetag: parseInt(document.getElementById('monetagLimit').value) || 30,
        adsgram: parseInt(document.getElementById('adsgramLimit').value) || 30,
        spin: parseInt(document.getElementById('spinLimit').value) || 30,
        website: parseInt(document.getElementById('websiteLimit').value) || 30
    };
    saveAdminData();
    showNotification('Limits saved!');
}

// ===== SETTINGS =====
function saveSettings() {
    adminData.settings.minWithdraw = parseFloat(document.getElementById('minWithdraw').value) || 20;
    adminData.settings.withdrawFee = parseFloat(document.getElementById('withdrawFee').value) || 0.05;
    saveAdminData();
    showNotification('Settings saved!');
}

function saveSecurity() {
    adminData.settings.allowWithdraw = document.getElementById('allowWithdraw').checked;
    adminData.settings.allowTasks = document.getElementById('allowTasks').checked;
    adminData.settings.allowSpin = document.getElementById('allowSpin').checked;
    adminData.settings.allowWebsite = document.getElementById('allowWebsite').checked;
    saveAdminData();
    showNotification('Security settings saved!');
}

// ===== LINKS =====
function saveLink(type) {
    const inputMap = {
        website: 'linkWebsite',
        group: 'linkGroup',
        channel: 'linkChannel',
        support: 'linkSupport',
        facebook: 'linkFacebook',
        youtube: 'linkYoutube',
        instagram: 'linkInstagram',
        twitter: 'linkTwitter'
    };
    const value = document.getElementById(inputMap[type]).value.trim();
    if (value) {
        adminData.links[type] = value;
        saveAdminData();
        showNotification('Link saved!');
    }
}

// ===== VISIT LINKS =====
function renderVisitLinks() {
    const container = document.getElementById('visitLinksList');
    if (!adminData.visitLinks || adminData.visitLinks.length === 0) {
        adminData.visitLinks = [...DEFAULT_VISIT_LINKS];
    }
    container.innerHTML = adminData.visitLinks.map((link, index) => `
        <div class="link-group">
            <input type="text" class="admin-input" id="visitLink${index}" value="${link}">
            <button class="admin-btn danger" onclick="removeVisitLink(${index})">✕</button>
        </div>
    `).join('');
}

function addVisitLink() {
    const input = document.getElementById('newVisitLink');
    const link = input.value.trim();
    if (link) {
        if (!adminData.visitLinks) adminData.visitLinks = [];
        adminData.visitLinks.push(link);
        input.value = '';
        saveAdminData();
        renderVisitLinks();
        showNotification('Visit link added!');
    }
}

function removeVisitLink(index) {
    if (confirm('Remove this link?')) {
        adminData.visitLinks.splice(index, 1);
        saveAdminData();
        renderVisitLinks();
        showNotification('Link removed!');
    }
}

function saveVisitLinks() {
    const links = [];
    document.querySelectorAll('#visitLinksList .link-group input').forEach(input => {
        if (input.value.trim()) {
            links.push(input.value.trim());
        }
    });
    adminData.visitLinks = links;
    saveAdminData();
    showNotification('Visit links saved!');
}

// ===== ANNOUNCEMENT =====
function loadAnnouncement() {
    const announcement = JSON.parse(localStorage.getItem('nxeran_announcement') || '{"text":"🎉 Welcome to NX ERAN! Start earning now!","time":"Today"}');
    document.getElementById('announcementInput').value = announcement.text || '🎉 Welcome to NX ERAN! Start earning now!';
    document.getElementById('announcementTime').value = announcement.time || 'Today';
}

function updateAnnouncement() {
    const text = document.getElementById('announcementInput').value.trim();
    const time = document.getElementById('announcementTime').value.trim();
    if (text) {
        adminData.announcement = { text, time };
        saveAdminData();
        showNotification('Announcement updated!');
    }
}

function sendAnnouncementToAll() {
    const text = document.getElementById('announcementInput').value.trim();
    const time = document.getElementById('announcementTime').value.trim() || 'Today';
    
    if (!text) {
        showNotification('Please enter announcement text');
        return;
    }
    
    adminData.announcement = { text, time };
    localStorage.setItem('nxeran_announcement', JSON.stringify(adminData.announcement));
    
    const users = adminData.users || [];
    if (users.length === 0) {
        showNotification('No users to send');
        return;
    }
    
    let sent = 0;
    const message = `📢 <b>🔔 NEW ANNOUNCEMENT</b>\n\n${text}\n\n📅 ${time}`;
    
    users.forEach(user => {
        sendMessageToUser(user.id, message);
        sent++;
    });
    
    showNotification(`📨 Announcement sent to ${sent} users!`);
}

// ===== FORCE RESET =====
function forceResetLimits() {
    if (confirm('Reset all users\' daily limits?')) {
        localStorage.setItem('nxeran_forceReset', 'true');
        const users = adminData.users || [];
        users.forEach(user => {
            const userKey = 'nxeran_userData_' + user.id;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            if (userData) {
                userData.gigaRemaining = adminData.adLimits?.giga || 30;
                userData.monetagRemaining = adminData.adLimits?.monetag || 30;
                userData.adsgramRemaining = adminData.adLimits?.adsgram || 30;
                userData.spinRemaining = adminData.adLimits?.spin || 30;
                userData.websiteRemaining = adminData.adLimits?.website || 30;
                userData.todayEarnings = 0;
                userData.todayAds = 0;
                localStorage.setItem(userKey, JSON.stringify(userData));
            }
        });
        showNotification('✅ All users\' limits reset!');
        sendMessageToAllUsers('🔄 Daily limits have been reset by admin. You can continue earning!');
    }
}

function sendMessageToAllUsers(message) {
    const users = adminData.users || [];
    users.forEach(user => {
        sendMessageToUser(user.id, message);
    });
}

// ===== SYNC USERS =====
function syncUsers() {
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(k => k.startsWith('nxeran_userData_'));
    let synced = 0;
    
    userKeys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const userId = key.replace('nxeran_userData_', '');
            if (userId && userId !== 'default') {
                const existing = adminData.users.find(u => u.id == userId);
                if (existing) {
                    existing.balance = data.balance || 0;
                    existing.totalEarn = data.totalEarn || 0;
                    existing.todayAds = data.todayAds || 0;
                    existing.totalAds = data.totalAds || 0;
                    existing.referrals = data.referrals ? data.referrals.length : 0;
                    existing.level = data.level || 'Bronze';
                    existing.name = data.firstName || 'User';
                    existing.username = data.username || 'user';
                } else {
                    adminData.users.push({
                        id: userId,
                        name: data.firstName || 'User',
                        username: data.username || 'user',
                        balance: data.balance || 0,
                        totalEarn: data.totalEarn || 0,
                        todayAds: data.todayAds || 0,
                        totalAds: data.totalAds || 0,
                        referrals: data.referrals ? data.referrals.length : 0,
                        level: data.level || 'Bronze',
                        status: data.isBanned ? 'banned' : 'active',
                        joined: new Date().toLocaleDateString()
                    });
                }
                synced++;
            }
        } catch(e) {}
    });
    
    saveAdminData();
    updateUI();
    showNotification(`✅ Synced ${synced} users successfully!`);
}

// ===== SEND MESSAGE TO USER =====
function sendMessageToUser(userId, message) {
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

// ===== EXPORT/IMPORT =====
function exportData() {
    const data = JSON.stringify(adminData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nxeran_admin_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported!');
}

function importData() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.assign(adminData, data);
            saveAdminData();
            loadAdminData();
            updateUI();
            renderVisitLinks();
            renderAdminIds();
            renderSubAdmins();
            renderRedeemCodes();
            showNotification('Data imported successfully!');
        } catch(err) {
            showNotification('Invalid JSON file!');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ===== NOTIFICATION =====
function showNotification(message) {
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

console.log('🔧 Rx Admin Panel Loaded!');
console.log('📊 Total Users:', adminData.users.length);
console.log('👑 Admin: @RxCoderBD');

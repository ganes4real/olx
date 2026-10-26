// =====================================================
// OLX Admin Panel — Passcode Gate & Dashboard Logic
// =====================================================

const ADMIN_PASSCODE = 'admin@olx';
const SESSION_KEY = 'olx_admin_session';

const passcodeGate = document.getElementById('passcodeGate');
const adminDashboard = document.getElementById('adminDashboard');
const passcodeForm = document.getElementById('passcodeForm');
const passcodeInput = document.getElementById('passcodeInput');
const passcodeError = document.getElementById('passcodeError');
const togglePassBtn = document.getElementById('togglePassBtn');
const adminToast = document.getElementById('adminToast');

// ---- Session Check ----
function checkSession() {
  return sessionStorage.getItem(SESSION_KEY) === 'granted';
}

function grantAccess() {
  sessionStorage.setItem(SESSION_KEY, 'granted');
  passcodeGate.style.display = 'none';
  adminDashboard.style.display = 'flex';
  initDashboard();
}

if (checkSession()) {
  grantAccess();
}

// ---- Passcode Submit ----
passcodeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = passcodeInput.value;
  if (val === ADMIN_PASSCODE) {
    passcodeError.textContent = '';
    grantAccess();
  } else {
    passcodeError.textContent = '❌ Incorrect passcode. Access denied.';
    passcodeInput.value = '';
    passcodeInput.focus();
    const card = document.querySelector('.passcode-card');
    card.style.animation = 'none';
    void card.offsetWidth; // reflow
    card.style.animation = 'shake 0.4s ease';
  }
});

togglePassBtn.addEventListener('click', () => {
  const isPass = passcodeInput.type === 'password';
  passcodeInput.type = isPass ? 'text' : 'password';
  togglePassBtn.textContent = isPass ? '🙈' : '👁️';
});

// ---- Toast ----
let toastTimer;
function showToast(msg, duration = 3200) {
  clearTimeout(toastTimer);
  adminToast.textContent = msg;
  adminToast.classList.remove('hidden');
  toastTimer = setTimeout(() => adminToast.classList.add('hidden'), duration);
}

// ---- Helpers ----
function fmtCur(n) {
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

function fmtDate(d) {
  if (!d) return 'Recently';
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return diff + ' days ago';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(t) {
  if (!t) return '';
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function api(url, opts) {
  const res = await fetch(url, opts);
  return res.json();
}

// ---- Dashboard Init ----
function initDashboard() {
  loadStats();
  loadItemsTable();
  bindSubtabs();

  document.getElementById('refreshAllBtn').addEventListener('click', () => {
    loadStats();
    const active = document.querySelector('.admin-section:not(.hidden)');
    if (active && active.id === 'adminSectionItems') loadItemsTable();
    else if (active && active.id === 'adminSectionReports') loadReportsTable();
    else loadUsersTable();
    showToast('Data refreshed ✓');
  });

  document.getElementById('adminItemSearch').addEventListener('input', loadItemsTable);
  document.getElementById('adminStatusFilter').addEventListener('change', loadItemsTable);
}

// ---- Stats ----
async function loadStats() {
  try {
    const res = await api('/api/admin/stats');
    if (res.success && res.stats) {
      const s = res.stats;
      document.getElementById('statTotalItems').textContent = s.totalItems;
      document.getElementById('statListedItems').textContent = s.listedItems;
      document.getElementById('statSoldItems').textContent = s.soldItems;
      document.getElementById('statPendingReports').textContent = s.pendingReports;
      document.getElementById('statTotalUsers').textContent = s.totalUsers;
      document.getElementById('adminReportsBadge').textContent = s.totalReports;
      document.getElementById('tbTotalItems').textContent = s.totalItems;
      document.getElementById('tbTotalUsers').textContent = s.totalUsers;
      document.getElementById('tbPendingReports').textContent = s.pendingReports;
    }
  } catch(e) { console.warn('Stats error', e); }
}

// ---- Items Table ----
async function loadItemsTable() {
  const tbody = document.getElementById('adminItemsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#8b949e;">Loading inventory…</td></tr>';
  try {
    const search = document.getElementById('adminItemSearch').value;
    const status = document.getElementById('adminStatusFilter').value;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    const res = await api('/api/admin/items?' + params);

    if (!res.success || !res.items || res.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#8b949e;">No items found.</td></tr>';
      return;
    }

    tbody.innerHTML = res.items.map(item => `
      <tr data-id="${item._id}">
        <td>
          <div class="table-item-preview">
            <img src="${item.image}" class="table-item-thumb" alt="">
            <div class="table-item-meta">
              <div class="title" title="${esc(item.title)}">${esc(item.title)}</div>
              <div class="id">ID: ${item._id.substring(0,10)}…</div>
            </div>
          </div>
        </td>
        <td>${esc(item.category)}</td>
        <td><strong>${fmtCur(item.price)}</strong></td>
        <td>${esc(item.location)}</td>
        <td>
          <div><strong>${esc(item.sellerName)}</strong></div>
          <small style="color:#8b949e">${esc(item.sellerPhone)}</small>
        </td>
        <td><span class="status-pill ${item.status || 'listed'}">${item.status || 'listed'}</span></td>
        <td>${item.reportCount > 0 ? '<span class="status-pill pending">⚠️ ' + item.reportCount + '</span>' : '<span style="color:#8b949e">None</span>'}</td>
        <td>
          <button class="btn-admin-action btn-mark-status" data-action="toggle-status" data-id="${item._id}" data-current="${item.status}">
            ${item.status === 'sold' ? 'Mark Listed' : 'Mark Sold'}
          </button>
          <button class="btn-admin-action btn-delete-item" data-action="delete" data-id="${item._id}" data-title="${esc(item.title)}">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        if (!confirm('ADMIN ACTION:\nPermanently delete "' + title + '" from the database?')) return;
        const r = await api('/api/admin/items/' + id, { method: 'DELETE' });
        if (r.success) { showToast('"' + title + '" deleted ✓'); loadItemsTable(); loadStats(); }
        else showToast('Delete failed');
      });
    });

    tbody.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const cur = btn.getAttribute('data-current');
        const newS = cur === 'sold' ? 'listed' : 'sold';
        const r = await api('/api/admin/items/' + id + '/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newS })
        });
        if (r.success) { showToast('Status updated to ' + newS); loadItemsTable(); loadStats(); }
      });
    });

  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#ef4444;">Error loading inventory</td></tr>';
  }
}

// ---- Reports Table ----
async function loadReportsTable() {
  const tbody = document.getElementById('adminReportsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#8b949e;">Loading reports…</td></tr>';
  try {
    const res = await api('/api/reports');
    if (!res.success || !res.reports || res.reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#8b949e;">No reports on file. Community is clean! 🎉</td></tr>';
      return;
    }

    tbody.innerHTML = res.reports.map(rep => {
      const itemIdStr = rep.itemId ? ((rep.itemId._id || rep.itemId).toString()) : '';
      const itemIdShort = itemIdStr ? itemIdStr.substring(0,10) + '…' : 'N/A';
      return `
      <tr data-report-id="${rep._id}">
        <td>
          <strong>${esc(rep.itemTitle)}</strong>
          <div style="font-size:11px;color:#8b949e">ID: ${itemIdShort}</div>
        </td>
        <td><span class="status-pill pending">${esc(rep.reason)}</span></td>
        <td style="max-width:200px;word-break:break-word">${esc(rep.description || 'No description')}</td>
        <td>${esc(rep.sellerName)}</td>
        <td>
          <div>${esc(rep.reporterName)}</div>
          <small style="color:#8b949e">${esc(rep.reporterEmail || '')}</small>
        </td>
        <td>${fmtDate(rep.createdAt)}</td>
        <td><span class="status-pill ${rep.status}">${rep.status}</span></td>
        <td>
          ${rep.itemId ? '<button class="btn-admin-action btn-delete-item" data-action="del-rep-item" data-item-id="' + itemIdStr + '" data-report-id="' + rep._id + '">🗑️ Delete Ad</button>' : ''}
          <button class="btn-admin-action btn-resolve-report" data-action="resolve" data-id="${rep._id}">✓ Resolve</button>
          <button class="btn-admin-action btn-dismiss-report" data-action="dismiss" data-id="${rep._id}">Dismiss</button>
        </td>
      </tr>
    `}).join('');

    tbody.querySelectorAll('[data-action="del-rep-item"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('ADMIN ACTION:\nDelete this reported listing and resolve the report?')) return;
        const itemId = btn.getAttribute('data-item-id');
        const repId = btn.getAttribute('data-report-id');
        await api('/api/admin/items/' + itemId, { method: 'DELETE' });
        await api('/api/reports/' + repId + '/status', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'resolved', adminNotes: 'Removed by admin' })
        });
        showToast('Scam item removed & report resolved 🛡️');
        loadReportsTable(); loadItemsTable(); loadStats();
      });
    });

    tbody.querySelectorAll('[data-action="resolve"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api('/api/reports/' + btn.getAttribute('data-id') + '/status', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'resolved' })
        });
        showToast('Report resolved ✓'); loadReportsTable(); loadStats();
      });
    });

    tbody.querySelectorAll('[data-action="dismiss"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api('/api/reports/' + btn.getAttribute('data-id') + '/status', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'dismissed' })
        });
        showToast('Report dismissed'); loadReportsTable(); loadStats();
      });
    });

  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#ef4444;">Error loading reports</td></tr>';
  }
}

// ---- Users Table ----
async function loadUsersTable() {
  const tbody = document.getElementById('adminUsersTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#8b949e;">Loading users…</td></tr>';
  try {
    const res = await api('/api/admin/users');
    if (!res.success || !res.users) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Error loading users</td></tr>';
      return;
    }

    tbody.innerHTML = res.users.map(u => `
      <tr data-user-id="${u._id}">
        <td><strong>${esc(u.name)}</strong></td>
        <td>${esc(u.email)}</td>
        <td>${esc(u.phone)}</td>
        <td><span class="status-pill ${u.role === 'admin' ? 'admin-role' : 'listed'}">${u.role.toUpperCase()}</span></td>
        <td><strong>${u.itemsCount}</strong> listings</td>
        <td>${fmtDate(u.createdAt)}</td>
        <td>
          <button class="btn-admin-action btn-mark-status" data-action="toggle-role" data-id="${u._id}" data-role="${u.role}">
            ${u.role === 'admin' ? 'Make User' : 'Make Admin'}
          </button>
          <button class="btn-admin-action btn-delete-item" data-action="delete-user" data-id="${u._id}" data-name="${esc(u.name)}">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="toggle-role"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const cur = btn.getAttribute('data-role');
        const newRole = cur === 'admin' ? 'user' : 'admin';
        const r = await api('/api/admin/users/' + id + '/role', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        if (r.success) { showToast('Role changed to ' + newRole); loadUsersTable(); }
      });
    });

    tbody.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (!confirm('Delete user "' + name + '" and all their listings?')) return;
        const r = await api('/api/admin/users/' + id, { method: 'DELETE' });
        if (r.success) { showToast('User ' + name + ' removed'); loadUsersTable(); loadStats(); }
      });
    });

  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Error loading users</td></tr>';
  }
}

// ---- Subtabs ----
function bindSubtabs() {
  const defs = [
    { btn: 'adminTabItems', section: 'adminSectionItems', loader: loadItemsTable },
    { btn: 'adminTabReports', section: 'adminSectionReports', loader: loadReportsTable },
    { btn: 'adminTabUsers', section: 'adminSectionUsers', loader: loadUsersTable }
  ];
  defs.forEach(({ btn, section, loader }) => {
    document.getElementById(btn).addEventListener('click', () => {
      defs.forEach(d => {
        document.getElementById(d.btn).classList.remove('active');
        document.getElementById(d.section).classList.add('hidden');
      });
      document.getElementById(btn).classList.add('active');
      document.getElementById(section).classList.remove('hidden');
      loader();
    });
  });
}

const KEY = 'technoload-webapp-v2';
const AUTH_KEY = 'technoload-server-session';
const API_BASE = window.TechnoLoadConfig?.apiBaseUrl || 'https://technoload-platform-u202410728-e3hpgzdgf7g5daaq.westus-01.azurewebsites.net/api/v1';
let session = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null');
const saveSession = () => {
  if (session) sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(AUTH_KEY);
};
async function serverAuth(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The server could not complete the request.');
  return result;
}
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}`, ...(options.headers || {}) } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Request failed.');
  return result;
}

const seed = {
  assets: [
    { id:'A-001', name:'CAT 320 Excavator', type:'Machinery', usage:1842, status:'AVAILABLE' },
    { id:'A-002', name:'Volvo FMX Dump Truck', type:'Dump truck', usage:64500, status:'IN_OPERATION' },
    { id:'A-003', name:'XCMG QY25K Crane', type:'Crane', usage:3250, status:'IN_MAINTENANCE' },
    { id:'A-004', name:'Scania R450 Truck', type:'Truck', usage:98700, status:'AVAILABLE' }
  ],
  maintenance: [{id:'M-201',asset:'XCMG QY25K Crane',type:'Corrective',date:'2026-10-10'},{id:'M-202',asset:'CAT 320 Excavator',type:'Preventive',date:'2026-10-15'}],
  operations: [{id:'OP-31',route:'Lima → Ica',asset:'Volvo FMX Dump Truck',driver:'Marco Lopez',status:'ON_ROUTE'},{id:'OP-32',route:'Callao → Ate',asset:'Scania R450 Truck',driver:'Rosa Vargas',status:'SCHEDULED'}],
  membership: 'Professional'
};

let state = JSON.parse(localStorage.getItem(KEY) || 'null') || structuredClone(seed);
let view = location.hash.slice(1) || 'dashboard';
let authMode = (location.hash === '#register' || view === 'register') ? 'register' : 'login';
let redirectAfterLogin = null;
let authError = '';

const app = document.querySelector('#app'), dialog = document.querySelector('#dialog'), form = document.querySelector('#asset-form');
const labels = { AVAILABLE:'Available', IN_OPERATION:'In operation', IN_MAINTENANCE:'In maintenance', ON_ROUTE:'On route', SCHEDULED:'Scheduled' };
const save = () => localStorage.setItem(KEY, JSON.stringify(state));

function toast(message) {
  const node = document.querySelector('#toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 2800);
}

function getWebsiteUrl() {
  const isAzure = window.location.hostname.includes('azurewebsites.net');
  if (isAzure) return 'https://technoload-website-u202410728-hxegc4f8a5e4dvgw.westus-01.azurewebsites.net/';
  const inHosting = window.location.pathname.includes('/hosting/') || window.location.href.includes('/hosting/');
  return inHosting ? '../../TechFlow-website/index.html' : '../TechFlow-website/index.html';
}

function authView() {
  const isRegister = authMode === 'register';
  const websiteUrl = getWebsiteUrl();
  return `<div class="auth-wrapper">
    <div class="auth-box">
      <div class="auth-brand"><i>T</i>TechnoLoad</div>
      <p class="auth-tagline">Smart fleet management platform</p>
      
      <div class="auth-nav-tabs">
        <button class="auth-tab-btn ${!isRegister ? 'active' : ''}" data-auth-tab="login">Sign in</button>
        <button class="auth-tab-btn ${isRegister ? 'active' : ''}" data-auth-tab="register">Create account</button>
      </div>

      ${authError ? `<div class="auth-alert error"><span>⚠</span> ${authError}</div>` : ''}

      ${!isRegister ? `
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Corporate email</label>
            <div class="form-input-wrap">
              <input id="login-email" type="email" required placeholder="admin@technoload.pe" value="admin@technoload.pe" autocomplete="username">
            </div>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="form-input-wrap">
              <input id="login-password" type="password" required placeholder="••••••••" value="Admin123!" autocomplete="current-password">
            </div>
          </div>
          <button class="button primary" style="width:100%;margin-top:6px;" type="submit">Sign in to platform</button>
        </form>

        <div class="demo-box">
          <div class="demo-box-header">⚡ Quick demo access:</div>
          <div class="demo-chips">
            <button type="button" class="demo-chip" data-fill-email="admin@technoload.pe" data-fill-pass="Admin123!">Administrator</button>
            <button type="button" class="demo-chip" data-fill-email="user@technoload.pe" data-fill-pass="User123!">Customer</button>
          </div>
        </div>

        <div class="auth-links">
          <button type="button" data-auth-tab="register">Do not have an account? Register here</button>
          <a class="back-website-link" href="${websiteUrl}">← Back to website</a>
        </div>
      ` : `
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="reg-name">Full name</label>
            <div class="form-input-wrap">
              <input id="reg-name" type="text" required placeholder="e.g. Carlos Mendoza">
            </div>
          </div>
          <div class="form-group">
            <label for="reg-email">Corporate email</label>
            <div class="form-input-wrap">
              <input id="reg-email" type="email" required placeholder="carlos@constructora.pe" autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label for="reg-company">Company</label>
            <div class="form-input-wrap">
              <input id="reg-company" type="text" required placeholder="e.g. Constructora Andina S.A.">
            </div>
          </div>
          <div class="form-group">
            <label for="reg-role">Operational role</label>
            <div class="form-input-wrap">
              <select id="reg-role">
                <option value="Fleet Administrator">Fleet Administrator</option>
                <option value="Operations Coordinator">Operations Coordinator</option>
                <option value="Maintenance Technician">Maintenance Technician</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="reg-pass">Password</label>
            <div class="form-input-wrap">
              <input id="reg-pass" type="password" minlength="8" required placeholder="At least 8 characters" autocomplete="new-password">
            </div>
          </div>
          <div class="form-group">
            <label for="reg-pass-confirm">Confirm password</label>
            <div class="form-input-wrap">
              <input id="reg-pass-confirm" type="password" minlength="6" required placeholder="Repeat password" autocomplete="new-password">
            </div>
          </div>
          <button class="button primary" style="width:100%;margin-top:6px;" type="submit">Create account and enter</button>
        </form>

        <div class="auth-links">
          <button type="button" data-auth-tab="login">Already have an account? Sign in</button>
          <a class="back-website-link" href="${websiteUrl}">← Back to website</a>
        </div>
      `}
    </div>
  </div>`;
}

function shell(title, content) {
  const isAdmin = session?.user?.role === 'ADMIN';
  const nav = isAdmin ? [['dashboard','▦','Dashboard'],['fleet','🚜','Fleet'],['rentals','▣','Requests'],['maintenance','⚒','Maintenance'],['operations','⌖','Operations'],['admin','⚙','Approvals']] : [['catalog','🚜','Machinery catalog'],['memberships','★','Memberships'],['orders','▣','My reservations'],['notifications','🔔','Notifications']];
  const languageButton = window.TechnoLoadI18n?.language() === 'es' ? 'EN' : 'ES';
  const currentUser = session?.user || { name: 'Flor Álvarez', role: 'Fleet Administrator', company: 'TechnoLoad Corp' };
  const initials = (currentUser.name || 'TL').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return `<div class="shell">
    <aside class="side">
      <div class="brand"><i>T</i>TechnoLoad</div>
      <nav>${nav.map(([id,icon,label]) => `<button class="${view===id?'active':''}" data-view="${id}"><span>${icon}</span>${label}</button>`).join('')}</nav>
      <div class="side-user">
        <small>Connected as:<br><b>${currentUser.name}</b><br><span style="color:#ffad38">${currentUser.company || 'TechnoLoad'}</span></small>
      </div>
      <small style="margin-top:12px;border-top:1px solid #2a3d4d;padding-top:12px;">Smart fleet management<br>Functional local prototype</small>
    </aside>
    <main class="main">
      <header class="top">
        <b>${title}</b>
        <div class="user-menu">
          <div class="user-profile">
            <span class="user-avatar">${initials}</span>
            <div class="user-info">
              <b class="user-name">${currentUser.name}</b>
              <small class="user-role">${isAdmin ? 'Administrator' : 'Customer'}</small>
            </div>
          </div>
          <button class="logout-btn button" data-action="logout" title="Sign out" aria-label="Sign out">
            <span aria-hidden="true">⎋</span>
            <span>Sign out</span>
          </button>
          <button class="language button ghost" data-action="language" aria-label="Change language">${languageButton}</button>
        </div>
      </header>
      <section class="content">${content}</section>
    </main>
  </div>`;
}

function customerCatalog() {
  const assets = state.assets.filter(item => item.status === 'AVAILABLE');
  return shell('Machinery catalog', `<div class="head"><div><h1>Choose equipment for your project</h1><p>Set your dates. Eligible requests are approved automatically and placed on reserve.</p></div></div><div class="grid">${assets.map(item => `<article class="asset"><header><h3>${item.type === 'Crane' ? '🏗️' : item.type === 'Dump truck' ? '🚚' : '🚜'} ${item.name}</h3><span class="tag AVAILABLE">Available</span></header><p>${item.type}<br>Operational use: <b>${Number(item.usage).toLocaleString('en-US')}</b></p><form class="rental-form" data-asset="${item.id}"><label>Start date<input name="startDate" type="date" required></label><label>End date<input name="endDate" type="date" required></label><button class="primary" type="submit">Reserve equipment</button></form></article>`).join('') || '<p class="empty">No machinery is currently available.</p>'}</div>`);
}
function customerOrders() { return shell('My reservations', `<div class="head"><div><h1>Reservations and delivery</h1><p>Your requests and delivery priority update automatically.</p></div></div><section class="panel"><h2>Loading your current requests…</h2></section>`); }
function customerNotifications() { return shell('Notifications', `<div class="head"><div><h1>Notifications</h1><p>Maintenance, reservation and new-product updates appear here.</p></div><button data-action="read-notifications">Mark all read</button></div><section class="panel"><h2>Loading notifications…</h2></section>`); }
function customerMemberships() { const plans = [['starter','Starter','S/ 149','Standard delivery · 5% rental discount'],['professional','Professional','S/ 349','Priority delivery · 12% rental discount · priority support']]; return shell('Memberships', `<div class="head"><div><h1>Plans with delivery advantages</h1><p>Checkout uses a safe sandbox: no real charge is made.</p></div></div><div class="grid">${plans.map(([id,name,price,benefit]) => `<article class="asset"><header><h3>${name}</h3><span class="tag AVAILABLE">Member benefits</span></header><p><b style="font-size:1.5rem">${price}/month</b><br>${benefit}</p><footer><button class="primary" data-checkout="${id}" data-method="CARD">Pay by test card</button><button data-checkout="${id}" data-method="YAPE">Yape sandbox</button></footer></article>`).join('')}</div>`); }
async function admin() { app.innerHTML = shell('Approvals', '<div class="head"><div><h1>Approvals</h1><p>Loading reservations and incidents…</p></div></div>'); try { const data = await api('/admin/requests'); app.innerHTML = shell('Approvals', `<div class="head"><div><h1>Automated approvals</h1><p>Eligible reservations are already reserved; review exceptions below.</p></div></div><section class="panel"><h2>Rental requests</h2><table><thead><tr><th>Request</th><th>Asset</th><th>Dates</th><th>Status</th><th>Decision</th></tr></thead><tbody>${data.rentals.map(r => `<tr><td>${r.id}</td><td>${r.assetId}</td><td>${r.startDate} → ${r.endDate}</td><td>${r.status}</td><td>${r.status === 'PENDING_REVIEW' ? `<button class="primary" data-approve-rental="${r.id}">Approve</button>` : 'Automatic'}</td></tr>`).join('') || '<tr><td colspan="5">No requests yet.</td></tr>'}</tbody></table></section><section class="panel"><h2>Equipment incidents</h2><table><tbody>${data.incidents.map(i => `<tr><td>${i.assetId}</td><td>${i.description}</td><td>${i.status}</td></tr>`).join('') || '<tr><td>No incidents.</td></tr>'}</tbody></table></section>`); } catch (error) { toast(error.message); } }

function dashboard() {
  const available = state.assets.filter(item => item.status === 'AVAILABLE').length;
  const active = state.operations.filter(item => item.status === 'ON_ROUTE').length;
  return shell('Operations dashboard', `<div class="head"><div><h1>Operations overview</h1><p>Immediate visibility into assets, maintenance and dispatches.</p></div><button class="primary" data-view="fleet">View fleet</button></div><div class="metrics"><article class="metric"><span>Registered assets</span><b>${state.assets.length}</b><small>● Updated inventory</small></article><article class="metric"><span>Available assets</span><b>${available}</b><small>● Ready to assign</small></article><article class="metric"><span>Pending maintenance</span><b>${state.maintenance.length}</b><small>● Scheduled attention</small></article><article class="metric"><span>Active dispatches</span><b>${active}</b><small>● Operation in progress</small></article></div><section class="panel"><h2>Upcoming actions</h2><table><thead><tr><th>Type</th><th>Asset</th><th>Date</th><th>Action</th></tr></thead><tbody>${state.maintenance.map(item => `<tr><td>${item.type} maintenance</td><td>${item.asset}</td><td>${item.date}</td><td><button data-complete="${item.id}">Complete</button></td></tr>`).join('') || '<tr><td colspan="4">There is no pending maintenance.</td></tr>'}</tbody></table></section>`);
}

function fleet() { return shell('Fleet inventory', `<div class="head"><div><h1>Fleet inventory</h1><p>Register and review machinery, vehicles and availability.</p></div><button class="primary" data-action="new">+ Register asset</button></div><div class="toolbar"><input id="search" placeholder="Search by name or type"><select id="filter"><option value="">All statuses</option><option value="AVAILABLE">Available</option><option value="IN_OPERATION">In operation</option><option value="IN_MAINTENANCE">In maintenance</option></select><button data-action="reset">Reset demo</button></div><div id="asset-grid" class="grid">${cards(state.assets)}</div>`); }

function cards(items) { return items.length ? items.map(item => `<article class="asset"><header><h3>${item.name}</h3><span class="tag ${item.status}">${labels[item.status]}</span></header><p>${item.type}<br>Current usage: <b>${Number(item.usage).toLocaleString('en-US')}</b> h/km</p><footer><button data-edit="${item.id}">Edit</button><button class="danger" data-delete="${item.id}">Remove</button></footer></article>`).join('') : '<p class="empty">No assets found.</p>'; }

function rentals() { return shell('Rental requests', `<div class="head"><div><h1>Requests and rentals</h1><p>Review reservations and keep availability conflict-free.</p></div><button class="primary" data-action="rental">+ Create request</button></div><section class="panel"><table><thead><tr><th>Request</th><th>Customer</th><th>Asset</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td>R-1001</td><td>Andina Construction</td><td>CAT 320 Excavator</td><td><span class="tag IN_MAINTENANCE">Requested</span></td><td><button data-action="approve">Approve</button></td></tr><tr><td>R-1002</td><td>Pacific Works</td><td>Scania R450 Truck</td><td><span class="tag AVAILABLE">Confirmed</span></td><td>—</td></tr></tbody></table></section>`); }

function maintenance() { return shell('Maintenance', `<div class="head"><div><h1>Preventive maintenance</h1><p>Schedule interventions and keep the fleet available.</p></div><button class="primary" data-action="schedule">+ Schedule maintenance</button></div><section class="panel"><table><thead><tr><th>Order</th><th>Asset</th><th>Type</th><th>Date</th><th>Action</th></tr></thead><tbody>${state.maintenance.map(item => `<tr><td>${item.id}</td><td>${item.asset}</td><td>${item.type}</td><td>${item.date}</td><td><button data-complete="${item.id}">Complete</button></td></tr>`).join('') || '<tr><td colspan="5">There is no scheduled maintenance.</td></tr>'}</tbody></table></section>`); }

function operations() { return shell('Operations', `<div class="head"><div><h1>Operations and dispatches</h1><p>Coordinate routes, units and each service owner.</p></div><button class="primary" data-action="operation">+ Create dispatch</button></div><section class="panel"><table><thead><tr><th>Order</th><th>Route</th><th>Unit</th><th>Owner</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.operations.map(item => `<tr><td>${item.id}</td><td>${item.route}</td><td>${item.asset}</td><td>${item.driver}</td><td><span class="tag ${item.status==='ON_ROUTE'?'IN_OPERATION':'IN_MAINTENANCE'}">${labels[item.status]}</span></td><td>${item.status==='SCHEDULED'?`<button data-start="${item.id}">Start route</button>`:'—'}</td></tr>`).join('')}</tbody></table></section>`); }

function memberships() { const plans = [['Starter','S/ 149','Up to 10 assets'],['Professional','S/ 349','Up to 50 assets'],['Enterprise','Custom','Unlimited assets']]; return shell('Memberships', `<div class="head"><div><h1>Membership and billing</h1><p>Your active plan is <b>${state.membership}</b>. Select a plan to update this functional prototype.</p></div></div><div class="grid">${plans.map(([name,price,detail]) => `<article class="asset"><header><h3>${name}</h3><span class="tag ${name===state.membership?'AVAILABLE':'IN_OPERATION'}">${name===state.membership?'Active':'Plan'}</span></header><p><b style="font-size:1.5rem">${price}</b><br>${detail}<br>Fleet, maintenance and operations tools.</p><footer><button class="${name===state.membership?'':'primary'}" ${name===state.membership?'disabled':''} data-plan="${name}">${name===state.membership?'Current plan':`Choose ${name}`}</button></footer></article>`).join('')}</div>`); }

function render() {
  if (!session) {
    if (view !== 'login' && view !== 'register') {
      redirectAfterLogin = view;
    }
    authMode = (view === 'register' || location.hash === '#register') ? 'register' : 'login';
    location.hash = authMode;
    app.innerHTML = authView();
    window.TechnoLoadI18n?.translate(document);
    return;
  }
  if (view === 'login' || view === 'register') {
    view = redirectAfterLogin || 'dashboard';
    redirectAfterLogin = null;
  }
  location.hash = view;
  if (session.user.role !== 'ADMIN') { const page = {catalog: customerCatalog, memberships: customerMemberships, orders: customerOrders, notifications: customerNotifications}[view] || customerCatalog; app.innerHTML = page(); window.TechnoLoadI18n?.translate(document); return; }
  if (view === 'admin') return admin();
  const page = {fleet, rentals, maintenance, operations}[view] || dashboard;
  app.innerHTML = page();
  window.TechnoLoadI18n?.translate(document);
}

function openAsset(item = {id:'',name:'',type:'Machinery',usage:0,status:'AVAILABLE'}) {
  document.querySelector('#dialog-title').textContent = item.id ? 'Edit asset' : 'Register asset';
  for (const key of ['id','name','type','usage','status']) document.querySelector(`#asset-${key}`).value = item[key];
  dialog.showModal();
}

window.addEventListener('hashchange', () => {
  const currentHash = location.hash.slice(1);
  if (!currentHash) return;
  if (!session) {
    authMode = (currentHash === 'register') ? 'register' : 'login';
    render();
    return;
  }
  if (currentHash !== view) {
    view = currentHash;
    render();
  }
});

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  // Auth Tab Switch
  if (button.dataset.authTab) {
    authMode = button.dataset.authTab;
    authError = '';
    render();
    return;
  }

  // Quick Demo Account Click
  if (button.dataset.fillEmail) {
    const emailField = document.querySelector('#login-email');
    const passField = document.querySelector('#login-password');
    if (emailField && passField) {
      emailField.value = button.dataset.fillEmail;
      passField.value = button.dataset.fillPass;
      emailField.focus();
    }
    return;
  }

  // Logout action
  if (button.dataset.action === 'logout') {
    if (session?.token) fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${session.token}` } }).catch(() => {});
    session = null;
    saveSession();
    authError = '';
    authMode = 'login';
    view = 'login';
    render();
    toast(window.TechnoLoadI18n?.language() === 'es' ? 'Sesión cerrada correctamente.' : 'Signed out successfully.');
    return;
  }

  if (button.dataset.view) {
    view = button.dataset.view;
    render();
    return;
  }
  if (button.dataset.action === 'language') {
    window.TechnoLoadI18n?.toggle();
    render();
    return;
  }
  if (button.dataset.action === 'new') openAsset();
  if (button.dataset.action === 'reset') {
    state = structuredClone(seed);
    save();
    render();
    toast('Demo data restored.');
  }
  if (button.dataset.action === 'schedule') {
    const asset = state.assets.find(item => item.status !== 'IN_MAINTENANCE') || state.assets[0];
    state.maintenance.push({id:`M-${Date.now().toString().slice(-4)}`,asset:asset.name,type:'Preventive',date:new Date().toISOString().slice(0,10)});
    save();
    render();
    toast('Maintenance scheduled.');
  }
  if (button.dataset.action === 'operation') {
    const asset = state.assets.find(item => item.status === 'AVAILABLE');
    if (!asset) return toast('There are no available assets.');
    asset.status = 'IN_OPERATION';
    state.operations.push({id:`OP-${Date.now().toString().slice(-4)}`,route:'Lima → Chancay',asset:asset.name,driver:'Assigned operator',status:'SCHEDULED'});
    save();
    render();
    toast('Dispatch created and asset reserved.');
  }
  if (button.dataset.action === 'approve') toast('Rental request approved.');
  if (button.dataset.action === 'rental') toast('Rental request created.');
  if (button.dataset.edit) openAsset(state.assets.find(item => item.id === button.dataset.edit));
  if (button.dataset.delete) {
    state.assets = state.assets.filter(item => item.id !== button.dataset.delete);
    save();
    render();
    toast('Asset removed.');
  }
  if (button.dataset.complete) {
    state.maintenance = state.maintenance.filter(item => item.id !== button.dataset.complete);
    save();
    render();
    toast('Maintenance completed.');
  }
  if (button.dataset.start) {
    state.operations.find(item => item.id === button.dataset.start).status = 'ON_ROUTE';
    save();
    render();
    toast('Route started.');
  }
  if (button.dataset.plan) {
    state.membership = button.dataset.plan;
    save();
    render();
    toast(`${state.membership} membership is now active.`);
  }
  if (button.dataset.checkout) api('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ planId: button.dataset.checkout, method: button.dataset.method }) }).then(() => { toast('Sandbox payment accepted. Membership active.'); view = 'orders'; render(); }).catch(error => toast(error.message));
  if (button.dataset.approveRental) api(`/admin/rentals/${button.dataset.approveRental}/decision`, { method: 'POST', body: JSON.stringify({ approved: true }) }).then(() => { toast('Reservation approved and customer notified.'); render(); }).catch(error => toast(error.message));
  if (button.dataset.action === 'read-notifications') api('/notifications/read', { method: 'POST' }).then(() => toast('Notifications marked as read.'));
});

document.addEventListener('submit', event => {
  if (event.target.classList.contains('rental-form')) {
    event.preventDefault(); const data = new FormData(event.target);
    api('/rentals', { method: 'POST', body: JSON.stringify({ assetId: event.target.dataset.asset, startDate: data.get('startDate'), endDate: data.get('endDate') }) }).then(rental => { toast(rental.status === 'AUTO_APPROVED' ? 'Approved automatically — equipment reserved.' : 'Request sent for review.'); view = 'orders'; render(); }).catch(error => toast(error.message));
    return;
  }
  // Login Form Submission
  if (event.target.id === 'login-form') {
    event.preventDefault();
    const email = document.querySelector('#login-email').value.trim().toLowerCase();
    const pass = document.querySelector('#login-password').value;

    serverAuth('/auth/login', { email, password: pass }).then(result => {
      session = result;
      saveSession();
      authError = '';
      view = redirectAfterLogin || (result.user.role === 'ADMIN' ? 'dashboard' : 'catalog');
      redirectAfterLogin = null;
      render();
      toast(window.TechnoLoadI18n?.language() === 'es' ? `¡Bienvenido(a), ${result.user.name}!` : `Welcome back, ${result.user.name}!`);
    }).catch(error => {
      authError = error.message;
      render();
    });
    return;
  }

  // Register Form Submission
  if (event.target.id === 'register-form') {
    event.preventDefault();
    const name = document.querySelector('#reg-name').value.trim();
    const email = document.querySelector('#reg-email').value.trim().toLowerCase();
    const company = document.querySelector('#reg-company').value.trim();
    const role = document.querySelector('#reg-role').value;
    const pass = document.querySelector('#reg-pass').value;
    const passConfirm = document.querySelector('#reg-pass-confirm').value;

    if (!name || !email || !pass) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'Por favor completa todos los campos.' : 'Please fill in all fields.';
      render();
      return;
    }
    if (pass.length < 8) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.';
      render();
      return;
    }
    if (pass !== passConfirm) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.';
      render();
      return;
    }
    serverAuth('/auth/register', { name, email, password: pass, organization: company, requestedRole: role }).then(result => {
      session = result;
      saveSession();
      authError = '';
      view = redirectAfterLogin || 'catalog';
      redirectAfterLogin = null;
      render();
      toast(window.TechnoLoadI18n?.language() === 'es' ? `¡Cuenta creada exitosamente! Bienvenido(a), ${result.user.name}` : `Account created successfully! Welcome, ${result.user.name}`);
    }).catch(error => { authError = error.message; render(); });
    return;
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'search') {
    const term = event.target.value.toLowerCase(), filter = document.querySelector('#filter').value;
    document.querySelector('#asset-grid').innerHTML = cards(state.assets.filter(item => (item.name + item.type).toLowerCase().includes(term) && (!filter || item.status === filter)));
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'filter') document.querySelector('#search').dispatchEvent(new Event('input'));
});

form.addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const item = {
    id: document.querySelector('#asset-id').value || `A-${Date.now().toString().slice(-4)}`,
    name: document.querySelector('#asset-name').value,
    type: document.querySelector('#asset-type').value,
    usage: Number(document.querySelector('#asset-usage').value),
    status: document.querySelector('#asset-status').value
  };
  const index = state.assets.findIndex(asset => asset.id === item.id);
  if (index < 0) state.assets.push(item);
  else state.assets[index] = item;
  save();
  dialog.close();
  render();
  toast(index < 0 ? 'Asset registered.' : 'Asset updated.');
});

render();

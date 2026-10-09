const KEY = 'technoload-webapp-v2';
const AUTH_KEY = 'technoload-session';
const USERS_KEY = 'technoload-users';

const defaultUsers = [
  { id:'U-001', name:'Flor Álvarez', email:'admin@technoload.pe', password:'admin123', role:'Fleet Administrator', company:'TechnoLoad Corp' },
  { id:'U-002', name:'Mathias Castillo', email:'mathias@technoload.pe', password:'mathias123', role:'Fleet Administrator', company:'TechnoLoad Corp' },
  { id:'U-003', name:'Marco López', email:'operaciones@technoload.pe', password:'operaciones123', role:'Operations Coordinator', company:'TransAndina Logística' },
  { id:'U-004', name:'Renzo Huamán', email:'contratista@technoload.pe', password:'contratista123', role:'Contractor', company:'Constructora del Sur' }
];

let users = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
if (!users || !Array.isArray(users) || users.length === 0) {
  users = structuredClone(defaultUsers);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
const saveUsers = () => localStorage.setItem(USERS_KEY, JSON.stringify(users));

let session = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

// Check URL hash for auth token passed across origins
if (location.hash.includes('auth=')) {
  try {
    const rawHash = location.hash.slice(1);
    const params = new URLSearchParams(rawHash);
    const authData = params.get('auth');
    if (authData) {
      session = JSON.parse(decodeURIComponent(authData));
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      if (session.user && !users.some(u => u.email.toLowerCase() === session.user.email.toLowerCase())) {
        users.push(session.user);
        saveUsers();
      }
      const targetView = params.get('view') || 'dashboard';
      location.hash = targetView;
    }
  } catch (err) {
    console.error('Failed to parse auth token:', err);
  }
}

const saveSession = () => {
  if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  else localStorage.removeItem(AUTH_KEY);
};

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
              <input id="login-password" type="password" required placeholder="••••••••" value="admin123" autocomplete="current-password">
            </div>
          </div>
          <button class="button primary" style="width:100%;margin-top:6px;" type="submit">Sign in to platform</button>
        </form>

        <div class="demo-box">
          <div class="demo-box-header">⚡ Quick demo access:</div>
          <div class="demo-chips">
            <button type="button" class="demo-chip" data-fill-email="admin@technoload.pe" data-fill-pass="admin123">Flor Álvarez (Admin)</button>
            <button type="button" class="demo-chip" data-fill-email="mathias@technoload.pe" data-fill-pass="mathias123">Mathias Castillo (Admin)</button>
            <button type="button" class="demo-chip" data-fill-email="operaciones@technoload.pe" data-fill-pass="operaciones123">Marco López (Ops)</button>
            <button type="button" class="demo-chip" data-fill-email="contratista@technoload.pe" data-fill-pass="contratista123">Renzo Huamán (Contractor)</button>
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
              <input id="reg-pass" type="password" minlength="6" required placeholder="At least 6 characters" autocomplete="new-password">
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
  const nav = [['dashboard','▦','Dashboard'],['fleet','🚜','Fleet'],['rentals','▣','Rentals'],['maintenance','⚒','Maintenance'],['operations','⌖','Operations'],['memberships','★','Memberships']];
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
              <small class="user-role">${currentUser.role}</small>
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
  const page = {fleet, rentals, maintenance, operations, memberships}[view] || dashboard;
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
});

document.addEventListener('submit', event => {
  // Login Form Submission
  if (event.target.id === 'login-form') {
    event.preventDefault();
    const email = document.querySelector('#login-email').value.trim().toLowerCase();
    const pass = document.querySelector('#login-password').value;

    const matched = users.find(u => u.email.toLowerCase() === email && u.password === pass);
    if (matched) {
      session = { user: matched, token: 'jwt-' + Date.now(), loggedInAt: Date.now() };
      saveSession();
      authError = '';
      view = redirectAfterLogin || 'dashboard';
      redirectAfterLogin = null;
      render();
      toast(window.TechnoLoadI18n?.language() === 'es' ? `¡Bienvenido(a), ${matched.name}!` : `Welcome back, ${matched.name}!`);
    } else {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'Correo o contraseña incorrectos.' : 'Invalid email or password.';
      render();
    }
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
    if (pass.length < 6) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.';
      render();
      return;
    }
    if (pass !== passConfirm) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.';
      render();
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email)) {
      authError = window.TechnoLoadI18n?.language() === 'es' ? 'Este correo ya se encuentra registrado.' : 'This email is already registered.';
      render();
      return;
    }

    const newUser = {
      id: `U-${Date.now().toString().slice(-4)}`,
      name,
      email,
      password: pass,
      role,
      company: company || 'TechnoLoad'
    };
    users.push(newUser);
    saveUsers();

    session = { user: newUser, token: 'jwt-' + Date.now(), loggedInAt: Date.now() };
    saveSession();
    authError = '';
    view = redirectAfterLogin || 'dashboard';
    redirectAfterLogin = null;
    render();
    toast(window.TechnoLoadI18n?.language() === 'es' ? `¡Cuenta creada exitosamente! Bienvenido(a), ${newUser.name}` : `Account created successfully! Welcome, ${newUser.name}`);
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

import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Asset, AssetStatus, AuthSession, User } from './models';

type View = 'dashboard' | 'fleet' | 'maintenance' | 'operations' | 'payments';
type PaymentKind = 'Alquiler' | 'Suscripción' | 'Daño';
type PaymentStatus = 'Aprobado' | 'Rechazado';
interface PaymentRecord { id: string; description: string; kind: PaymentKind; amount: number; date: string; status: PaymentStatus; method: string; }
const seed: Asset[] = [
  {id:'A-001',name:'Excavadora CAT 320',type:'Maquinaria',usage:1842,status:'AVAILABLE'},
  {id:'A-002',name:'Volquete Volvo FMX',type:'Volquete',usage:64500,status:'IN_OPERATION'},
  {id:'A-003',name:'Grúa XCMG QY25K',type:'Grúa',usage:3250,status:'IN_MAINTENANCE'},
  {id:'A-004',name:'Camión Scania R450',type:'Camión',usage:98700,status:'AVAILABLE'}
];

const defaultUsers: User[] = [
  { id:'U-001', name:'Flor Álvarez', email:'admin@technoload.pe', password:'admin123', role:'Administradora de flota', company:'TechnoLoad Corp' },
  { id:'U-002', name:'Mathias Castillo', email:'mathias@technoload.pe', password:'mathias123', role:'Administrador de flota', company:'TechnoLoad Corp' },
  { id:'U-003', name:'Marco López', email:'operaciones@technoload.pe', password:'operaciones123', role:'Coordinador de operaciones', company:'TransAndina Logística' },
  { id:'U-004', name:'Renzo Huamán', email:'contratista@technoload.pe', password:'contratista123', role:'Contratista', company:'Constructora del Sur' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Unauthenticated Screen -->
  <div *ngIf="!session()" class="auth-wrapper">
    <div class="auth-box">
      <div class="auth-brand"><i>T</i>TechnoLoad</div>
      <p class="auth-tagline">Plataforma de gestión inteligente de flotas</p>

      <div class="auth-nav-tabs">
        <button type="button" class="auth-tab-btn" [class.active]="authMode()==='login'" (click)="setAuthMode('login')">Iniciar sesión</button>
        <button type="button" class="auth-tab-btn" [class.active]="authMode()==='register'" (click)="setAuthMode('register')">Crear cuenta</button>
      </div>

      <div *ngIf="authError()" class="auth-alert error"><span>⚠</span> {{authError()}}</div>

      <!-- Login Form -->
      <form *ngIf="authMode()==='login'" class="auth-form" (ngSubmit)="login()">
        <div class="form-group">
          <label>Correo corporativo</label>
          <div class="form-input-wrap">
            <input type="email" required [(ngModel)]="loginEmail" name="email" placeholder="admin@technoload.pe">
          </div>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <div class="form-input-wrap">
            <input type="password" required [(ngModel)]="loginPass" name="password" placeholder="••••••••">
          </div>
        </div>
        <button class="button primary" style="width:100%;margin-top:6px;" type="submit">Ingresar a la plataforma</button>

        <div class="demo-box">
          <div class="demo-box-header">⚡ Cuentas demo de acceso rápido:</div>
          <div class="demo-chips">
            <button type="button" class="demo-chip" (click)="fillDemo('admin@technoload.pe','admin123')">Flor Álvarez (Admin)</button>
            <button type="button" class="demo-chip" (click)="fillDemo('mathias@technoload.pe','mathias123')">Mathias Castillo (Admin)</button>
            <button type="button" class="demo-chip" (click)="fillDemo('operaciones@technoload.pe','operaciones123')">Marco López (Operaciones)</button>
          </div>
        </div>

        <div class="auth-links">
          <button type="button" (click)="setAuthMode('register')">¿No tienes cuenta? Regístrate aquí</button>
        </div>
      </form>

      <!-- Register Form -->
      <form *ngIf="authMode()==='register'" class="auth-form" (ngSubmit)="register()">
        <div class="form-group">
          <label>Nombre completo</label>
          <div class="form-input-wrap">
            <input type="text" required [(ngModel)]="regName" name="name" placeholder="ej. Mathias Castillo">
          </div>
        </div>
        <div class="form-group">
          <label>Correo corporativo</label>
          <div class="form-input-wrap">
            <input type="email" required [(ngModel)]="regEmail" name="email" placeholder="mathias@empresa.pe">
          </div>
        </div>
        <div class="form-group">
          <label>Empresa</label>
          <div class="form-input-wrap">
            <input type="text" required [(ngModel)]="regCompany" name="company" placeholder="ej. Constructora Andina">
          </div>
        </div>
        <div class="form-group">
          <label>Rol operativo</label>
          <div class="form-input-wrap">
            <select [(ngModel)]="regRole" name="role">
              <option>Administrador de flota</option>
              <option>Coordinador de operaciones</option>
              <option>Técnico de mantenimiento</option>
              <option>Contratista</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <div class="form-input-wrap">
            <input type="password" minlength="6" required [(ngModel)]="regPass" name="pass" placeholder="Mínimo 6 caracteres">
          </div>
        </div>
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <div class="form-input-wrap">
            <input type="password" minlength="6" required [(ngModel)]="regPassConfirm" name="passConfirm" placeholder="Repite la contraseña">
          </div>
        </div>
        <button class="button primary" style="width:100%;margin-top:6px;" type="submit">Crear cuenta y entrar</button>

        <div class="auth-links">
          <button type="button" (click)="setAuthMode('login')">¿Ya tienes una cuenta? Inicia sesión</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Authenticated Platform Shell -->
  <div *ngIf="session()" class="shell">
    <aside class="side">
      <div class="brand"><i>T</i>TechnoLoad</div>
      <nav>
        <button *ngFor="let item of nav" [class.active]="view()===item.id" (click)="view.set(item.id)">
          {{item.icon}}<span>{{item.label}}</span>
        </button>
      </nav>
      <div class="side-user">
        <small>Conectado como:<br><b>{{session()?.user?.name}}</b><br><span style="color:#ffad38">{{session()?.user?.company || 'TechnoLoad'}}</span></small>
      </div>
      <small style="margin-top:12px;border-top:1px solid #2a3d4d;padding-top:12px;">Gestión inteligente de flotas<br>Angular + TypeScript</small>
    </aside>

    <main class="main">
      <header class="top">
        <b>{{title()}}</b>
        <div class="user-menu">
          <div class="user-profile">
            <span class="user-avatar">{{userInitials()}}</span>
            <div class="user-info">
              <b class="user-name">{{session()?.user?.name}}</b>
              <small class="user-role">{{session()?.user?.role}}</small>
            </div>
          </div>
          <button class="logout-btn button" (click)="logout()" title="Cerrar sesión" aria-label="Cerrar sesión">
            <span aria-hidden="true">⎋</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <section class="content">
        <ng-container [ngSwitch]="view()">
          <section *ngSwitchCase="'dashboard'">
            <div class="head">
              <div><h1>Situación de la operación</h1><p>Visibilidad inmediata de activos, alertas y despachos.</p></div>
              <button class="primary" (click)="view.set('fleet')">Ver flota</button>
            </div>
            <div class="metrics">
              <article class="metric"><span>Activos registrados</span><b>{{assets().length}}</b><small>● Inventario actualizado</small></article>
              <article class="metric"><span>Activos disponibles</span><b>{{available()}}</b><small>● Listos para asignar</small></article>
              <article class="metric"><span>Mantenimientos pendientes</span><b>{{maintenance().length}}</b><small>● Atención programada</small></article>
              <article class="metric"><span>Despachos activos</span><b>{{activeOperations()}}</b><small>● Operación en curso</small></article>
            </div>
            <section class="panel">
              <h2>Próximas acciones</h2>
              <table>
                <tr><th>Tipo</th><th>Activo</th><th>Fecha</th><th>Acción</th></tr>
                <tr *ngFor="let m of maintenance()">
                  <td>Mantenimiento {{m.type}}</td><td>{{m.asset}}</td><td>{{m.date}}</td>
                  <td><button (click)="complete(m.id)">Completar</button></td>
                </tr>
              </table>
            </section>
          </section>

          <section *ngSwitchCase="'fleet'">
            <div class="head">
              <div><h1>Inventario de flota</h1><p>Registra y consulta maquinaria, vehículos y disponibilidad.</p></div>
              <button class="primary" (click)="newAsset()">+ Registrar activo</button>
            </div>
            <div class="toolbar">
              <input [(ngModel)]="query" placeholder="Buscar por nombre o tipo">
              <select [(ngModel)]="statusFilter">
                <option value="">Todos los estados</option>
                <option value="AVAILABLE">Disponible</option>
                <option value="IN_OPERATION">En operación</option>
                <option value="IN_MAINTENANCE">Mantenimiento</option>
              </select>
              <button (click)="reset()">Restablecer demo</button>
            </div>
            <div class="grid">
              <article class="asset" *ngFor="let a of filteredAssets()">
                <header><h3>{{a.name}}</h3><span class="tag {{a.status}}">{{label(a.status)}}</span></header>
                <p>{{a.type}}<br>Uso acumulado: <b>{{a.usage | number}}</b> h/km</p>
                <footer>
                  <button (click)="edit(a)">Editar</button>
                  <button class="danger" (click)="remove(a.id)">Dar de baja</button>
                </footer>
              </article>
            </div>
          </section>

          <section *ngSwitchCase="'maintenance'">
            <div class="head">
              <div><h1>Mantenimiento preventivo</h1><p>Programa intervenciones y mantiene la flota disponible.</p></div>
              <button class="primary" (click)="schedule()">+ Programar mantenimiento</button>
            </div>
            <section class="panel">
              <table>
                <tr><th>Orden</th><th>Activo</th><th>Tipo</th><th>Fecha</th><th></th></tr>
                <tr *ngFor="let m of maintenance()">
                  <td>{{m.id}}</td><td>{{m.asset}}</td><td>{{m.type}}</td><td>{{m.date}}</td>
                  <td><button (click)="complete(m.id)">Completar</button></td>
                </tr>
              </table>
            </section>
          </section>

          <section *ngSwitchCase="'operations'">
            <div class="head">
              <div><h1>Operaciones y despachos</h1><p>Coordina rutas, unidades y responsables.</p></div>
              <button class="primary" (click)="addOperation()">+ Crear despacho</button>
            </div>
            <section class="panel">
              <table>
                <tr><th>Orden</th><th>Ruta</th><th>Unidad</th><th>Responsable</th><th>Estado</th><th></th></tr>
                <tr *ngFor="let o of operations()">
                  <td>{{o.id}}</td><td>{{o.route}}</td><td>{{o.asset}}</td><td>{{o.driver}}</td>
                  <td><span class="tag {{o.status==='En ruta'?'IN_OPERATION':'IN_MAINTENANCE'}}">{{o.status}}</span></td>
                  <td><button *ngIf="o.status==='Programado'" (click)="start(o.id)">Iniciar ruta</button></td>
                </tr>
              </table>
            </section>
          </section>

          <section *ngSwitchCase="'payments'">
            <div class="head">
              <div><h1>Pagos de vehículos</h1><p>Prueba cargos por alquiler, suscripción o reparación en el sandbox.</p></div>
              <span class="sandbox-badge">● SANDBOX · SIN COBROS REALES</span>
            </div>
            <div class="payment-layout">
              <section class="panel payment-form-panel">
                <h2>Crear pago de prueba</h2>
                <form class="payment-form" (ngSubmit)="simulatePayment()">
                  <label>Tipo de cobro
                    <select [(ngModel)]="paymentKind" (ngModelChange)="changePaymentKind($event)" name="paymentKind">
                      <option value="Alquiler">Alquiler de vehículo</option>
                      <option value="Suscripción">Suscripción de servicio</option>
                      <option value="Daño">Reparación por daño</option>
                    </select>
                  </label>
                  <label>Vehículo o servicio
                    <select [(ngModel)]="paymentAssetId" name="paymentAssetId" required>
                      <option *ngFor="let item of paymentCatalog()" [value]="item.id">{{item.name}}</option>
                    </select>
                  </label>
                  <label *ngIf="paymentKind==='Alquiler'">Duración del alquiler
                    <select [(ngModel)]="rentalDays" name="rentalDays">
                      <option [ngValue]="1">1 día</option><option [ngValue]="3">3 días</option><option [ngValue]="7">7 días</option>
                    </select>
                  </label>
                  <label *ngIf="paymentKind==='Daño'">Descripción del daño
                    <input [(ngModel)]="damageDescription" name="damageDescription" required minlength="4" placeholder="Ej. Cambio de neumático">
                  </label>
                  <div class="payment-total"><span>Total de prueba</span><b>S/ {{paymentAmount() | number:'1.2-2'}}</b></div>
                  <fieldset class="sandbox-choice"><legend>Resultado simulado</legend>
                    <label><input type="radio" name="sandboxResult" value="approved" [(ngModel)]="sandboxResult"> Aprobar</label>
                    <label><input type="radio" name="sandboxResult" value="rejected" [(ngModel)]="sandboxResult"> Rechazar</label>
                  </fieldset>
                  <button class="primary" type="submit">Procesar pago de prueba</button>
                  <small class="payment-note">No ingreses datos bancarios. Esta demostración no se conecta a una pasarela ni mueve dinero.</small>
                </form>
              </section>
              <section class="panel payment-history">
                <h2>Historial de pagos</h2>
                <div *ngIf="payments().length===0" class="empty">Aún no hay pagos. Crea uno para probar el flujo.</div>
                <table *ngIf="payments().length">
                  <thead><tr><th>Concepto</th><th>Tipo</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
                  <tbody><tr *ngFor="let p of payments()"><td>{{p.description}}</td><td>{{p.kind}}</td><td>{{p.date}}</td><td>S/ {{p.amount | number:'1.2-2'}}</td><td><span class="payment-status" [class.rejected]="p.status==='Rechazado'">{{p.status}}</span></td></tr></tbody>
                </table>
              </section>
            </div>
          </section>
        </ng-container>
      </section>
    </main>
  </div>

  <dialog #dialog>
    <form method="dialog" (ngSubmit)="save(dialog)">
      <header><b>{{editing ? 'Editar activo' : 'Registrar activo'}}</b><button type="button" (click)="dialog.close()">×</button></header>
      <label>Nombre<input required [(ngModel)]="draft.name" name="name"></label>
      <label>Tipo
        <select [(ngModel)]="draft.type" name="type">
          <option>Maquinaria</option><option>Camión</option><option>Volquete</option><option>Grúa</option>
        </select>
      </label>
      <label>Uso actual<input type="number" min="0" required [(ngModel)]="draft.usage" name="usage"></label>
      <label>Estado
        <select [(ngModel)]="draft.status" name="status">
          <option value="AVAILABLE">Disponible</option>
          <option value="IN_OPERATION">En operación</option>
          <option value="IN_MAINTENANCE">En mantenimiento</option>
        </select>
      </label>
      <menu>
        <button type="button" (click)="dialog.close()">Cancelar</button>
        <button class="primary">Guardar activo</button>
      </menu>
    </form>
  </dialog>

  <div id="toast" [class.show]="toast()">{{toast()}}</div>
  `
})
export class AppComponent {
  readonly nav: {id:View; icon:string; label:string}[] = [
    {id:'dashboard',icon:'▦',label:'Dashboard'},
    {id:'fleet',icon:'🚜',label:'Flota'},
    {id:'maintenance',icon:'⚒',label:'Mantenimiento'},
    {id:'operations',icon:'⌖',label:'Operaciones'},
    {id:'payments',icon:'S/',label:'Pagos (sandbox)'}
  ];

  view = signal<View>('dashboard');
  assets = signal<Asset[]>(this.read('assets', seed));
  maintenance = signal([
    {id:'M-201',asset:'Grúa XCMG QY25K',type:'Correctivo',date:'2026-10-10'},
    {id:'M-202',asset:'Excavadora CAT 320',type:'Preventivo',date:'2026-10-15'}
  ]);
  operations = signal([
    {id:'OP-31',route:'Lima → Ica',asset:'Volquete Volvo FMX',driver:'Marco López',status:'En ruta'},
    {id:'OP-32',route:'Callao → Ate',asset:'Camión Scania R450',driver:'Rosa Vargas',status:'Programado'}
  ]);

  // Auth & Session
  users = signal<User[]>(this.readUsers());
  session = signal<AuthSession | null>(this.readSession());
  authMode = signal<'login' | 'register'>('login');
  authError = signal<string>('');

  loginEmail = 'admin@technoload.pe';
  loginPass = 'admin123';

  regName = '';
  regEmail = '';
  regCompany = '';
  regRole = 'Administrador de flota';
  regPass = '';
  regPassConfirm = '';

  query = '';
  statusFilter = '';
  editing = false;
  draft: Asset = {id:'',name:'',type:'Maquinaria',usage:0,status:'AVAILABLE'};
  toast = signal('');

  available = computed(() => this.assets().filter(a => a.status === 'AVAILABLE').length);
  activeOperations = computed(() => this.operations().filter(o => o.status === 'En ruta').length);
  title = computed(() => ({dashboard:'Dashboard operativo',fleet:'Flota',maintenance:'Mantenimiento',operations:'Operaciones'}[this.view()]));

  userInitials = computed(() => {
    const name = this.session()?.user?.name || 'TL';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  });

  read<T>(key:string, fallback:T): T {
    try { return JSON.parse(localStorage.getItem('technoload-ts-'+key) ?? '') as T; }
    catch { return fallback; }
  }

  readUsers(): User[] {
    try {
      const stored = localStorage.getItem('technoload-users');
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem('technoload-users', JSON.stringify(defaultUsers));
    return structuredClone(defaultUsers);
  }

  readSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem('technoload-session');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }

  setAuthMode(mode: 'login' | 'register') {
    this.authMode.set(mode);
    this.authError.set('');
  }

  fillDemo(email: string, pass: string) {
    this.loginEmail = email;
    this.loginPass = pass;
    this.authError.set('');
  }

  login() {
    const email = this.loginEmail.trim().toLowerCase();
    const pass = this.loginPass;
    const matched = this.users().find(u => u.email.toLowerCase() === email && u.password === pass);

    if (matched) {
      const sess: AuthSession = { user: matched, token: 'jwt-' + Date.now(), loggedInAt: Date.now() };
      this.session.set(sess);
      localStorage.setItem('technoload-session', JSON.stringify(sess));
      this.authError.set('');
      this.notice(`¡Bienvenido(a), ${matched.name}!`);
    } else {
      this.authError.set('Correo o contraseña incorrectos.');
    }
  }

  register() {
    const name = this.regName.trim();
    const email = this.regEmail.trim().toLowerCase();
    const company = this.regCompany.trim();
    const role = this.regRole;
    const pass = this.regPass;
    const passConfirm = this.regPassConfirm;

    if (!name || !email || !pass) {
      this.authError.set('Por favor completa todos los campos.');
      return;
    }
    if (pass.length < 6) {
      this.authError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (pass !== passConfirm) {
      this.authError.set('Las contraseñas no coinciden.');
      return;
    }
    if (this.users().some(u => u.email.toLowerCase() === email)) {
      this.authError.set('Este correo ya se encuentra registrado.');
      return;
    }

    const newUser: User = {
      id: `U-${Date.now().toString().slice(-4)}`,
      name,
      email,
      password: pass,
      role,
      company: company || 'TechnoLoad'
    };

    const updatedUsers = [...this.users(), newUser];
    this.users.set(updatedUsers);
    localStorage.setItem('technoload-users', JSON.stringify(updatedUsers));

    const sess: AuthSession = { user: newUser, token: 'jwt-' + Date.now(), loggedInAt: Date.now() };
    this.session.set(sess);
    localStorage.setItem('technoload-session', JSON.stringify(sess));
    this.authError.set('');
    this.notice(`¡Cuenta creada con éxito! Bienvenido(a), ${newUser.name}`);
  }

  logout() {
    this.session.set(null);
    localStorage.removeItem('technoload-session');
    this.authMode.set('login');
    this.authError.set('');
    this.notice('Sesión cerrada correctamente.');
  }

  persist() {
    localStorage.setItem('technoload-ts-assets', JSON.stringify(this.assets()));
  }

  notice(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2600);
  }

  label(s: AssetStatus) {
    return ({AVAILABLE:'Disponible', IN_OPERATION:'En operación', IN_MAINTENANCE:'En mantenimiento'}[s]);
  }

  filteredAssets() {
    const q = this.query.toLowerCase();
    return this.assets().filter(a => (!q || (a.name+a.type).toLowerCase().includes(q)) && (!this.statusFilter || a.status === this.statusFilter));
  }

  newAsset() {
    this.editing = false;
    this.draft = {id:'',name:'',type:'Maquinaria',usage:0,status:'AVAILABLE'};
    (document.querySelector('dialog') as HTMLDialogElement).showModal();
  }

  edit(a: Asset) {
    this.editing = true;
    this.draft = {...a};
    (document.querySelector('dialog') as HTMLDialogElement).showModal();
  }

  save(dialog: HTMLDialogElement) {
    const item = {...this.draft, id: this.draft.id || `A-${Date.now().toString().slice(-4)}`};
    this.assets.update(list => this.editing ? list.map(a => a.id === item.id ? item : a) : [...list, item]);
    this.persist();
    dialog.close();
    this.notice('Activo guardado.');
  }

  remove(id: string) {
    this.assets.update(list => list.filter(a => a.id !== id));
    this.persist();
    this.notice('Activo dado de baja.');
  }

  reset() {
    this.assets.set(structuredClone(seed));
    this.persist();
    this.notice('Datos restablecidos.');
  }

  complete(id: string) {
    this.maintenance.update(list => list.filter(m => m.id !== id));
    this.notice('Mantenimiento completado.');
  }

  schedule() {
    const asset = this.assets()[0];
    if (asset) {
      this.maintenance.update(list => [...list, {id:`M-${Date.now().toString().slice(-4)}`,asset:asset.name,type:'Preventivo',date:new Date().toISOString().slice(0,10)}]);
      this.notice('Mantenimiento programado.');
    }
  }

  addOperation() {
    const asset = this.assets().find(a => a.status === 'AVAILABLE');
    if (!asset) {
      this.notice('No hay activos disponibles.');
      return;
    }
    this.assets.update(list => list.map(a => a.id === asset.id ? {...a, status:'IN_OPERATION' as AssetStatus} : a));
    this.operations.update(list => [...list, {id:`OP-${Date.now().toString().slice(-4)}`,route:'Lima → Chancay',asset:asset.name,driver:'Operador asignado',status:'Programado'}]);
    this.persist();
    this.notice('Despacho creado.');
  }

  start(id: string) {
    this.operations.update(list => list.map(o => o.id === id ? {...o, status:'En ruta'} : o));
    this.notice('Ruta iniciada.');
  }
}

(() => {
  const translations = {
    'Operations dashboard': 'Panel operativo', 'Dashboard': 'Panel', 'Fleet': 'Flota', 'Rentals': 'Alquileres', 'Maintenance': 'Mantenimiento', 'Operations': 'Operaciones', 'Memberships': 'Membresías',
    'Smart fleet management': 'Gestión inteligente de flotas', 'Functional local prototype': 'Prototipo local funcional', 'Flor Alvarez · Fleet Administrator': 'Flor Alvarez · Administradora de flota',
    'Operations overview': 'Resumen de operaciones', 'Immediate visibility into assets, maintenance and dispatches.': 'Visibilidad inmediata de activos, mantenimientos y despachos.', 'View fleet': 'Ver flota',
    'Registered assets': 'Activos registrados', 'Available assets': 'Activos disponibles', 'Pending maintenance': 'Mantenimientos pendientes', 'Active dispatches': 'Despachos activos',
    'Updated inventory': 'Inventario actualizado', 'Ready to assign': 'Listos para asignar', 'Scheduled attention': 'Atención programada', 'Operation in progress': 'Operación en curso',
    'Upcoming actions': 'Próximas acciones', 'Type': 'Tipo', 'Asset': 'Activo', 'Date': 'Fecha', 'Action': 'Acción', 'Complete': 'Completar', 'There is no pending maintenance.': 'No hay mantenimientos pendientes.',
    'Fleet inventory': 'Inventario de flota', 'Register and review machinery, vehicles and availability.': 'Registra y consulta maquinaria, vehículos y su disponibilidad.', '+ Register asset': '+ Registrar activo',
    'Search by name or type': 'Buscar por nombre o tipo', 'All statuses': 'Todos los estados', 'Available': 'Disponible', 'In operation': 'En operación', 'In maintenance': 'En mantenimiento', 'Reset demo': 'Restablecer demo',
    'Edit': 'Editar', 'Remove': 'Eliminar', 'No assets found.': 'No se encontraron activos.', 'Rental requests': 'Solicitudes de alquiler', 'Requests and rentals': 'Solicitudes y alquileres',
    'Review reservations and keep availability conflict-free.': 'Revisa reservas y evita conflictos de disponibilidad.', '+ Create request': '+ Crear solicitud', 'Request': 'Solicitud', 'Customer': 'Cliente', 'Requested': 'Solicitado', 'Confirmed': 'Confirmado', 'Approve': 'Aprobar',
    'Preventive maintenance': 'Mantenimiento preventivo', 'Schedule interventions and keep the fleet available.': 'Programa intervenciones y mantén la flota disponible.', '+ Schedule maintenance': '+ Programar mantenimiento',
    'Order': 'Orden', 'There is no scheduled maintenance.': 'No hay mantenimientos programados.', 'Coordinate routes, units and each service owner.': 'Coordina rutas, unidades y responsables de cada servicio.',
    '+ Create dispatch': '+ Crear despacho', 'Route': 'Ruta', 'Unit': 'Unidad', 'Owner': 'Responsable', 'On route': 'En ruta', 'Scheduled': 'Programado', 'Start route': 'Iniciar ruta',
    'Membership and billing': 'Membresías y facturación', 'Starter': 'Inicial', 'Professional': 'Profesional', 'Enterprise': 'Empresarial', 'Active': 'Activo', 'Plan': 'Plan', 'Current plan': 'Plan actual',
    'Choose Starter': 'Elegir Inicial', 'Choose Professional': 'Elegir Profesional', 'Choose Enterprise': 'Elegir Empresarial', 'Up to 10 assets': 'Hasta 10 activos', 'Up to 50 assets': 'Hasta 50 activos', 'Unlimited assets': 'Activos ilimitados',
    'Fleet, maintenance and operations tools.': 'Herramientas de flota, mantenimiento y operaciones.', 'Register asset': 'Registrar activo', 'Edit asset': 'Editar activo', 'Name': 'Nombre',
    'Current usage (hours/km)': 'Uso actual (horas/km)', 'Cancel': 'Cancelar', 'Save asset': 'Guardar activo', 'Machinery': 'Maquinaria', 'Truck': 'Camión', 'Dump truck': 'Volquete', 'Crane': 'Grúa',
    'Close': 'Cerrar', 'e.g. Volvo FH Truck': 'ej. Camión Volvo FH', 'Corrective': 'Correctivo', 'Preventive': 'Preventivo', 'Demo data restored.': 'Datos de demostración restablecidos.',
    'Maintenance scheduled.': 'Mantenimiento programado.', 'There are no available assets.': 'No hay activos disponibles.', 'Dispatch created and asset reserved.': 'Despacho creado y activo reservado.',
    'Rental request approved.': 'Solicitud de alquiler aprobada.', 'Rental request created.': 'Solicitud de alquiler creada.', 'Asset removed.': 'Activo eliminado.', 'Maintenance completed.': 'Mantenimiento completado.',
    'Route started.': 'Ruta iniciada.', 'Asset registered.': 'Activo registrado.', 'Asset updated.': 'Activo actualizado.',
    'Sign in': 'Iniciar sesión', 'Create account': 'Crear cuenta', 'Sign in to platform': 'Ingresar a la plataforma', 'Create account and enter': 'Crear cuenta y entrar',
    'Corporate email': 'Correo corporativo', 'Password': 'Contraseña', 'Confirm password': 'Confirmar contraseña', 'Full name': 'Nombre completo', 'Company': 'Empresa', 'Operational role': 'Rol operativo',
    'Fleet Administrator': 'Administrador de flota', 'Operations Coordinator': 'Coordinador de operaciones', 'Maintenance Technician': 'Técnico de mantenimiento', 'Contractor': 'Contratista',
    'Log out': 'Cerrar sesión', 'Sign out': 'Cerrar sesión', 'Quick demo access': 'Acceso demo rápido',
    'Do not have an account? Register here': '¿No tienes cuenta? Regístrate aquí', 'Already have an account? Sign in': '¿Ya tienes una cuenta? Inicia sesión',
    'Back to website': 'Volver al sitio web', 'Signed out successfully.': 'Sesión cerrada correctamente.', 'Invalid email or password.': 'Correo o contraseña incorrectos.',
    'Please fill in all fields.': 'Por favor completa todos los campos.', 'Passwords do not match.': 'Las contraseñas no coinciden.', 'Password must be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
    'This email is already registered.': 'Este correo ya se encuentra registrado.', 'Connected as:': 'Conectado como:', 'Current user': 'Usuario actual'
  };
  let language = localStorage.getItem('technoload-webapp-language') || 'en';
  const preserveWhitespace = (text, value) => text.replace(text.trim(), value);
  function translate(root = document) {
    document.documentElement.lang = language;
    if (language !== 'es') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const key = node.nodeValue.trim();
      if (translations[key]) node.nodeValue = preserveWhitespace(node.nodeValue, translations[key]);
      else if (key.startsWith('Current usage:')) node.nodeValue = preserveWhitespace(node.nodeValue, key.replace('Current usage:', 'Uso actual:'));
      else if (key.endsWith('maintenance')) node.nodeValue = preserveWhitespace(node.nodeValue, key.replace('maintenance', 'mantenimiento'));
    });
    root.querySelectorAll?.('[placeholder]').forEach((field) => { if (translations[field.placeholder]) field.placeholder = translations[field.placeholder]; });
    root.querySelectorAll?.('[aria-label]').forEach((element) => { if (translations[element.getAttribute('aria-label')]) element.setAttribute('aria-label', translations[element.getAttribute('aria-label')]); });
  }
  window.TechnoLoadI18n = { language: () => language, toggle: () => { language = language === 'en' ? 'es' : 'en'; localStorage.setItem('technoload-webapp-language', language); }, translate };
})();

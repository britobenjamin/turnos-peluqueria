let usuarios = [];

fetch('usuarios.json')
  .then(response => response.json())
  .then(data => {
    usuarios = data.usuarios;
  });







  function mostrarRegistro() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-registro').style.display = 'block';
  limpiarMensaje();
}

function mostrarLogin() {
  document.getElementById('seccion-registro').style.display = 'none';
  document.getElementById('seccion-login').style.display = 'block';
  limpiarMensaje();
}

function limpiarMensaje() {
  const msg = document.getElementById('mensaje');
  msg.textContent = '';
  msg.className = '';
}

function mostrarMensaje(texto, tipo) {
  const msg = document.getElementById('mensaje');
  msg.textContent = texto;
  msg.className = tipo; // 'error' o 'exito'
}








function iniciarSesion() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (email === '' || pass === '') {
    mostrarMensaje('Completá todos los campos.', 'error');
    return;
  }

  const esAdmin = usuarios.find(u => u.email === email && u.password === pass);

  if (esAdmin) {
    mostrarMensaje('¡Bienvenido, ' + esAdmin.nombre + '!', 'exito');
    localStorage.setItem('usuarioLogueado', esAdmin.nombre);
    localStorage.setItem('rol', 'admin');
    setTimeout(() => {
      window.location.href = 'turnos.html';
    }, 1500);
    return;
  }

  // Si no es admin, busca en los clientes guardados en localStorage
  const clientesGuardados = JSON.parse(localStorage.getItem('clientes') || '[]');
  const esCliente = clientesGuardados.find(u => u.email === email && u.password === pass);

  if (esCliente) {
    mostrarMensaje('¡Bienvenido, ' + esCliente.nombre + '!', 'exito');
    localStorage.setItem('usuarioLogueado', esCliente.nombre);
    localStorage.setItem('rol', 'cliente');
    setTimeout(() => {
      window.location.href = 'cliente.html';
    }, 1500);
    return;
  }

  mostrarMensaje('Email o contraseña incorrectos.', 'error');
}








function registrarUsuario() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();

  if (nombre === '' || email === '' || pass === '') {
    mostrarMensaje('Completá todos los campos.', 'error');
    return;
  }

  // Verifica que no sea un email de admin
  const esAdmin = usuarios.find(u => u.email === email);
  if (esAdmin) {
    mostrarMensaje('Ya existe una cuenta con ese email.', 'error');
    return;
  }

  // Verifica que no exista ya como cliente
  const clientesGuardados = JSON.parse(localStorage.getItem('clientes') || '[]');
  const yaExiste = clientesGuardados.find(u => u.email === email);
  if (yaExiste) {
    mostrarMensaje('Ya existe una cuenta con ese email.', 'error');
    return;
  }

  // Crea el nuevo cliente y lo guarda en localStorage
  const nuevoCliente = { nombre, email, password: pass };
  clientesGuardados.push(nuevoCliente);
  localStorage.setItem('clientes', JSON.stringify(clientesGuardados));

  mostrarMensaje('¡Cuenta creada! Ya podés iniciar sesión.', 'exito');
  setTimeout(() => {
    mostrarLogin();
  }, 1500);
}
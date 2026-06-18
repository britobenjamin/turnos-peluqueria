const API_URL = 'http://localhost:3000';

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
  msg.className = tipo;
}

async function iniciarSesion() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (email === '' || pass === '') {
    mostrarMensaje('Completá todos los campos.', 'error');
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(datos.error, 'error');
      return;
    }

    localStorage.setItem('usuarioId', datos.id);
    localStorage.setItem('usuarioNombre', datos.nombre);
    localStorage.setItem('rol', datos.rol);

    mostrarMensaje('¡Bienvenido, ' + datos.nombre + '!', 'exito');

    setTimeout(() => {
      if (datos.rol === 'admin') {
        window.location.href = 'turnos.html';
      } else {
        window.location.href = 'cliente.html';
      }
    }, 1500);

  } catch (error) {
    mostrarMensaje('Error al conectar con el servidor.', 'error');
  }
}

async function registrarUsuario() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();

  if (nombre === '' || email === '' || pass === '') {
    mostrarMensaje('Completá todos los campos.', 'error');
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password: pass })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(datos.error, 'error');
      return;
    }

    mostrarMensaje('¡Cuenta creada! Ya podés iniciar sesión.', 'exito');
    setTimeout(() => {
      mostrarLogin();
    }, 1500);

  } catch (error) {
    mostrarMensaje('Error al conectar con el servidor.', 'error');
  }
}
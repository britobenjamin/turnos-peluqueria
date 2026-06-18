const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PUERTO = 3000;

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.get('/turnos', async (req, res) => {
  try {
    const turnos = await prisma.turno.findMany();
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
});



app.get('/turnos/:id', async (req, res) => { // Ruta para obtener un turno por su ID
  const { id } = req.params;

  try {
    const turno = await prisma.turno.findUnique({
      where: { id: Number(id) }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json(turno);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el turno' });
  }
});




app.put('/turnos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, fecha, hora } = req.body;

  const turnoExistente = await prisma.turno.findUnique({
    where: { id: Number(id) }
  });

  if (!turnoExistente) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  if (!fecha || !hora) {
    return res.status(400).json({ error: 'Fecha y hora son obligatorios' });
  }

  const turnoRepetido = await prisma.turno.findFirst({
    where: {
      fecha: new Date(fecha),
      hora,
      id: { not: Number(id) }
    }
  });

  if (turnoRepetido) {
    return res.status(400).json({ error: 'Ya existe un turno en esa fecha y horario' });
  }

  try {
    const turnoActualizado = await prisma.turno.update({
      where: { id: Number(id) },
      data: {
        nombre: nombre || turnoExistente.nombre,
        telefono: telefono || turnoExistente.telefono,
        fecha: new Date(fecha),
        hora
      }
    });
    res.json(turnoActualizado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al actualizar el turno' });
  }
});




app.delete('/turnos/:id', async (req, res) => { // Ruta para eliminar un turno por su ID
  const { id } = req.params;

  const turnoExistente = await prisma.turno.findUnique({
    where: { id: Number(id) }
  });

  if (!turnoExistente) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  try {
    await prisma.turno.delete({
      where: { id: Number(id) }
    });
    res.json({ mensaje: 'Turno eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el turno' });
  }
});



app.post('/turnos', async (req, res) => {
  const { nombre, telefono, fecha, hora, usuarioId } = req.body;

  if (!nombre || !telefono || !fecha || !hora || !usuarioId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (nombre.trim() === '' || telefono.trim() === '') {
    return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
  }

  const turnoRepetido = await prisma.turno.findFirst({
    where: {
      fecha: new Date(fecha),
      hora
    }
  });

  if (turnoRepetido) {
    return res.status(400).json({ error: 'Ya existe un turno en esa fecha y horario' });
  }

  try {
    const nuevoTurno = await prisma.turno.create({
      data: {
        nombre,
        telefono,
        fecha: new Date(fecha),
        hora,
        usuario: {
          connect: { id: Number(usuarioId) }
        }
      }
    });
    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear el turno' });
  }
});




app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { rol: 'cliente' },
      include: { turnos: true }
    });
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});







app.post('/usuarios/registro', async (req, res) => { // Ruta para registrar un nuevo usuario
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (nombre.trim() === '' || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
  }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password,
        rol: 'cliente'
      }
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});





app.post('/usuarios/login', async (req, res) => { // Ruta para iniciar sesión
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || usuario.password !== password) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});







app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
/**
 * Servicio web de registro e inicio de sesión
 * Evidencia: GA7-220501096-AA5-EV01
 *
 * Endpoints:
 *   POST /api/registro  -> crea un usuario nuevo
 *   POST /api/login     -> valida usuario y contraseña
 *
 * Los usuarios se guardan en un archivo JSON (data/usuarios.json)
 * y las contraseñas se almacenan cifradas (hash con scrypt), nunca en texto plano.
 */

// ---------- 1. Importación de módulos ----------
const express = require("express"); // Framework para crear el servidor web
const cors = require("cors");       // Permite llamar la API desde otras páginas/orígenes
const crypto = require("crypto");   // Módulo nativo de Node para cifrar contraseñas
const fs = require("fs");           // Para leer/escribir el archivo de usuarios
const path = require("path");       // Para construir rutas de archivos

// ---------- 2. Configuración ----------
const app = express();
const PORT = process.env.PORT || 3000;
const RUTA_DATOS = path.join(__dirname, "data", "usuarios.json");

app.use(cors());          // Habilita CORS
app.use(express.json());  // Permite leer el cuerpo (body) de las peticiones en formato JSON

// ---------- 3. Funciones auxiliares de almacenamiento ----------

/** Lee la lista de usuarios desde el archivo JSON. Si no existe, devuelve []. */
function leerUsuarios() {
  if (!fs.existsSync(RUTA_DATOS)) return [];
  return JSON.parse(fs.readFileSync(RUTA_DATOS, "utf8"));
}

/** Guarda la lista de usuarios en el archivo JSON (crea la carpeta si hace falta). */
function guardarUsuarios(usuarios) {
  fs.mkdirSync(path.dirname(RUTA_DATOS), { recursive: true });
  fs.writeFileSync(RUTA_DATOS, JSON.stringify(usuarios, null, 2));
}

// ---------- 4. Funciones auxiliares de seguridad ----------

/** Cifra una contraseña con una "sal" aleatoria. Devuelve "sal:hash". */
function cifrarContrasena(contrasena) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(contrasena, sal, 64).toString("hex");
  return `${sal}:${hash}`;
}

/** Compara una contraseña escrita con el "sal:hash" guardado. */
function verificarContrasena(contrasena, guardada) {
  const [sal, hash] = guardada.split(":");
  const hashIntento = crypto.scryptSync(contrasena, sal, 64);
  // timingSafeEqual evita ataques por diferencia de tiempos
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), hashIntento);
}

// ---------- 5. Rutas (endpoints) ----------

/** GET /api -> comprobar que el servicio está activo. */
app.get("/api", (req, res) => {
  res.json({ mensaje: "Servicio web de registro y login activo" });
});

/**
 * POST /api/registro
 * Body JSON: { "usuario": "esteban", "contrasena": "Clave123" }
 * Respuestas:
 *   201 -> usuario registrado
 *   400 -> faltan datos
 *   409 -> el usuario ya existe
 */
app.post("/api/registro", (req, res) => {
  const { usuario, contrasena } = req.body;

  // Validar que lleguen ambos datos
  if (!usuario || !contrasena) {
    return res.status(400).json({ mensaje: "Debe enviar usuario y contraseña" });
  }

  const usuarios = leerUsuarios();

  // Verificar que el usuario no exista ya (sin distinguir mayúsculas)
  const existe = usuarios.some(
    (u) => u.usuario.toLowerCase() === usuario.toLowerCase()
  );
  if (existe) {
    return res.status(409).json({ mensaje: "El usuario ya existe" });
  }

  // Guardar el nuevo usuario con la contraseña cifrada
  usuarios.push({ usuario, contrasena: cifrarContrasena(contrasena) });
  guardarUsuarios(usuarios);

  res.status(201).json({ mensaje: "Usuario registrado correctamente" });
});

/**
 * POST /api/login
 * Body JSON: { "usuario": "esteban", "contrasena": "Clave123" }
 * Respuestas:
 *   200 -> autenticación satisfactoria
 *   400 -> faltan datos
 *   401 -> error en la autenticación
 */
app.post("/api/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ mensaje: "Debe enviar usuario y contraseña" });
  }

  // Buscar el usuario en el archivo
  const encontrado = leerUsuarios().find(
    (u) => u.usuario.toLowerCase() === usuario.toLowerCase()
  );

  // Si no existe o la contraseña no coincide -> error de autenticación
  if (!encontrado || !verificarContrasena(contrasena, encontrado.contrasena)) {
    return res.status(401).json({ mensaje: "Error en la autenticación" });
  }

  // Credenciales correctas
  res.status(200).json({ mensaje: "Autenticación satisfactoria" });
});

// ---------- 6. Arranque del servidor ----------
app.listen(PORT, () => {
  console.log(`Servicio web escuchando en http://localhost:${PORT}`);
});

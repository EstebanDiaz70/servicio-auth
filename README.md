# Servicio web de registro e inicio de sesión
Evidencia GA7-220501096-AA5-EV01 – Diseño y desarrollo de servicios web

## Requisitos
- Node.js 18 o superior
- Git

## Ejecución
```bash
npm install
npm start
```
El servicio queda en `http://localhost:3000`.

## Endpoints
| Método | Ruta           | Descripción                  |
|--------|----------------|------------------------------|
| GET    | /api           | Verifica que el servicio vive |
| POST   | /api/registro  | Registra un usuario          |
| POST   | /api/login     | Inicia sesión                |

### Body (JSON) para registro y login
```json
{ "usuario": "esteban", "contrasena": "Clave123" }
```

### Respuestas
| Caso                       | Código | Mensaje                         |
|----------------------------|--------|---------------------------------|
| Registro correcto          | 201    | Usuario registrado correctamente |
| Registro, usuario repetido | 409    | El usuario ya existe            |
| Falta usuario o contraseña | 400    | Debe enviar usuario y contraseña |
| Login correcto             | 200    | Autenticación satisfactoria     |
| Login incorrecto           | 401    | Error en la autenticación       |

## Probar con Postman (AA5-EV02)
1. Método POST, URL `http://localhost:3000/api/registro`
2. Pestaña Body → raw → JSON, pegar el JSON de arriba → Send (debe dar 201)
3. Cambiar la URL a `/api/login` → Send (200). Con contraseña errada → 401.

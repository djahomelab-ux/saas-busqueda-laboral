# Sistema inteligente integrador para la búsqueda laboral (SaaS)

Proyecto Integrador – Inteligencia Artificial – UPSJB. Plataforma web que centraliza la gestión del
currículum, las ofertas, las postulaciones y la preparación de entrevistas, con un asistente
contextual que combina reglas en **SWI-Prolog** con un **modelo de lenguaje** consumido por API.

## Estructura

```
backend/    API REST (Node.js + Express) en capas: routes → controllers → services → repositories → MySQL
  src/models/        validación y reglas de las entidades
  src/ia/            iaClient (modelo de lenguaje), prologClient, prompts, esquemas de salida
  tests/             Jest + Supertest; evaluar-asistente.js (métricas del informe)
frontend/   React + Vite
prolog/     conocimiento.pl (reglas), servidor.pl (servicio HTTP), pruebas.pl (plunit), iniciar.pl
database/   schema.sql (modelo físico) y seed.sql (datos de demostración)
```

## Requisitos

- Node.js 20 o superior
- MySQL 8.0
- SWI-Prolog 9 o superior
- Una API key de OpenAI (solo para las funciones del asistente)

## Puesta en marcha

### Opción rápida en Windows

Con Node.js, SWI-Prolog y MySQL encendido (por ejemplo, desde XAMPP), basta con hacer doble clic en
`iniciar.bat`. El archivo crea `backend/.env` si no existe, instala las dependencias, crea la base de
datos si hace falta y abre Prolog, backend y frontend en tres ventanas. Si MySQL tiene contraseña,
escríbela en `DB_PASSWORD` de `backend/.env` antes de ejecutarlo.

### Paso a paso

1. **Base de datos** (con los datos de conexión de `backend/.env`)

   ```bash
   cd backend
   npm install
   npm run crear-bd                 # la crea si no existe
   npm run crear-bd -- --reiniciar  # la borra y la vuelve a crear
   ```

2. **Servicio Prolog** (puerto 5000)

   ```bash
   cd prolog
   swipl iniciar.pl
   ```

3. **Backend** (puerto 3000)

   ```bash
   cd backend
   cp .env.example .env      # completar DB_PASSWORD, JWT_SECRET y OPENAI_API_KEY
   npm install
   npm run dev
   ```

4. **Frontend** (puerto 5173)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Usuario de demostración: `juan@demo.com` / `Demo12345`. Con la versión de CV 1 y la oferta 1, el
análisis de compatibilidad devuelve 60 % simple y 78 % ponderada (ejemplo de la Tabla 1 del informe).

## Pruebas

```bash
cd backend && npm test                       # 23 pruebas (la de Prolog se omite si el servicio no está activo)
cd prolog  && swipl -q -g main -t halt pruebas.pl   # 10 pruebas del motor de conocimiento
```

## Métricas del asistente (Tabla 12 del informe)

Completar `backend/tests/datos/validacion.json` con los 20 pares CV–oferta y las 30 respuestas de
entrevista etiquetadas por los evaluadores, levantar el servicio Prolog y ejecutar:

```bash
cd backend && npm run evaluar
```

El resultado se guarda en `backend/tests/datos/resultado-evaluacion.json`. La fidelidad al contexto y la
utilidad percibida se obtienen de las fichas de los evaluadores (Anexo 6 del informe).

## Seguridad implementada en el Avance 2

- Contraseñas con hash bcrypt (`bcryptjs`, costo 10); nunca en texto plano.
- Token JWT con vigencia de 2 horas; cada consulta filtra por el usuario autenticado.
- Todas las sentencias SQL usan `pool.execute()` con marcadores `?`; el ordenamiento usa lista blanca.
- Los errores internos no se exponen al cliente.
- Los datos de contacto del currículum no se envían al modelo de lenguaje.

Pendiente para el Avance 3: autenticación en dos pasos, bloqueo temporal de IP y pasarela de pagos real.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registro` · `/api/auth/login` | Registro e inicio de sesión |
| GET/PUT | `/api/perfil` | Perfil profesional |
| POST | `/api/perfil/habilidades` | Habilidad con nivel (basico, intermedio, avanzado) |
| GET/POST | `/api/curriculums` | Currículums |
| POST | `/api/curriculums/:id/versiones` | Nueva versión (`{ contenido }`) |
| GET | `/api/curriculums/versiones/:idVersion` | Detalle de una versión |
| GET/POST | `/api/ofertas` · GET `/api/ofertas/:id` | Ofertas y requisitos |
| GET/POST | `/api/postulaciones` · PATCH `/api/postulaciones/:id/estado` | Postulaciones |
| POST | `/api/entrevistas` · `/api/entrevistas/:id/respuestas` | Entrevista simulada |
| POST | `/api/asistente/compatibilidad` · `/analisis-cv` · `/consulta` | Asistente |
| GET | `/api/suscripcion` · POST `/api/suscripcion/plan` · GET `/api/pagos` | Suscripción |

# Quiz App — Documento de arquitectura

## Visión general

Aplicación web de quizzes con enfoque en móvil, autenticación de usuarios, historial de resultados y ranking. Se construirá de forma iterativa, empezando por un MVP con preguntas de texto y expandiendo hacia diagramas interactivos tipo rompecabezas y un leaderboard en tiempo real.

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Lenguaje | TypeScript | Tipado estático, mejor experiencia de desarrollo |
| Framework | Next.js (App Router) | SSR nativo, mezcla Server + Client Components, middleware de auth, ideal para móvil |
| Base de datos | Supabase (Postgres) | Auth integrado, RLS, Realtime para leaderboard futuro, Storage para assets |
| Estado cliente | Zustand o Context API | Manejo del estado del quiz en curso sin sobrecargar el servidor |
| Hosting | Vercel | Deploy nativo de Next.js, edge functions, CDN global |

### Por qué Next.js sobre Astro

Astro sería ideal para contenido mayormente estático. Este proyecto tiene demasiado dinamismo: tres modos de quiz, autenticación real, historial por usuario y un leaderboard que eventualmente será en tiempo real. Con Next.js App Router se pueden mezclar Server Components (carga de preguntas sin exponer lógica al cliente) con Client Components (interactividad del quiz), sin instalar adaptadores adicionales.

---

## Modalidades de quiz

| Modo | Preguntas | Alcance | Fase |
|---|---|---|---|
| Corto | ~20 preguntas | Un solo tema | MVP (fase 1) |
| Largo | ~60 preguntas | 52 temas | Fase 2 |
| Infinito | Sin límite | Aleatorio | Fase 2 |

La fase 1 arranca únicamente con el modo corto.

---

## Tipos de contenido

- **Fase 1:** solo texto (pregunta + 4 opciones)
- **Fase 2:** diagramas interactivos estilo rompecabezas (canvas), imágenes asociadas a preguntas

---

## Funcionalidades de usuarios

- **Fase 1:** registro/login, historial personal de scores
- **Fase 2:** ranking top 100, leaderboard público con Supabase Realtime

---

## Arquitectura del sistema

### Tres capas principales

```
┌─────────────────────────────────────────┐
│           Cliente (móvil / browser)     │
│  Páginas Next.js · Componentes UI       │
│  Estado cliente (Zustand / Context)     │
└───────────────┬─────────────────────────┘
                │ HTTP / fetch
┌───────────────▼─────────────────────────┐
│         Next.js — Servidor              │
│  Server Components  →  precarga SSR/ISR │
│  Route Handlers     →  POST /result     │
│                         GET /leaderboard│
│                         GET /history    │
│  Middleware auth    →  Supabase Auth SSR│
│                         session cookies │
└───────────────┬─────────────────────────┘
                │ Supabase SDK
┌───────────────▼─────────────────────────┐
│              Supabase                   │
│  Auth      →  users, profiles, JWT+RLS  │
│  Postgres  →  questions, topics,        │
│               quiz_sessions, scores     │
│  Realtime  →  leaderboard (fase 2)      │
│  Storage   →  imágenes, canvas (fase 2) │
└─────────────────────────────────────────┘
```

---

## Esquema de base de datos

### `profiles`
Extiende `auth.users` de Supabase.

```sql
id          uuid  PK  FK → auth.users
username    text
avatar_url  text
created_at  timestamptz
```

### `topics`
Los temas del examen (52 en el modo largo).

```sql
id           uuid  PK
name         text
description  text
```

### `questions`
Las preguntas del quiz. Las opciones se guardan en JSONB para flexibilidad futura (imágenes, diagramas, número variable de opciones).

```sql
id             uuid   PK
topic_id       uuid   FK → topics
text           text
options        jsonb  -- array de strings (o objetos en fase 2)
correct_index  int    -- índice de la opción correcta (0-3)
difficulty     int    -- 1 fácil · 2 medio · 3 difícil
```

> **Decisión de diseño:** usar `options jsonb` en lugar de columnas `option_a/b/c/d` da flexibilidad para cuando las opciones lleven imágenes o los diagramas tengan metadatos asociados.

### `quiz_sessions`
Una sesión por cada quiz iniciado. Permite retomar un quiz si el usuario cierra la app (campo `state`).

```sql
id            uuid  PK
user_id       uuid  FK → profiles
mode          text  -- 'short' | 'long' | 'infinite'
score         int
completed_at  timestamptz  -- null si está en curso
state         jsonb  -- índice actual + respuestas temporales (opcional)
created_at    timestamptz
```

### `user_scores`
Historial de resultados. Base del leaderboard futuro.

```sql
id          uuid  PK
user_id     uuid  FK → profiles
session_id  uuid  FK → quiz_sessions
score       int
created_at  timestamptz
```

### `session_answers` *(fase 2)*
Respuestas individuales por sesión. Permite análisis por tema ("fallaste más en el tema X").

```sql
session_id    uuid  FK → quiz_sessions
question_id   uuid  FK → questions
chosen_index  int
is_correct    bool
```

> **Nota:** aunque es fase 2, vale la pena crear esta tabla desde el inicio si se quiere análisis de rendimiento por tema a corto plazo.

---

## Estructura de carpetas (Next.js App Router)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── quiz/
│   │   ├── [mode]/
│   │   │   └── page.tsx        ← Server Component, carga preguntas
│   │   └── [mode]/play/
│   │       └── page.tsx        ← Client Component, lógica del quiz
│   ├── history/
│   │   └── page.tsx
│   ├── leaderboard/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── QuestionCard.tsx
│   ├── OptionButton.tsx
│   ├── ProgressBar.tsx
│   ├── ResultsScreen.tsx
│   └── Leaderboard.tsx
├── hooks/
│   └── useQuiz.ts              ← lógica centralizada del quiz
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ← cliente para componentes del browser
│   │   └── server.ts           ← cliente para Server Components y Route Handlers
│   └── queries/
│       ├── questions.ts
│       └── scores.ts
└── middleware.ts                ← protección de rutas con Supabase Auth
```

---

## Flujo de interacción (modo corto, fase 1)

```
1. Usuario abre /quiz/short
   └── Server Component carga las 20 preguntas del tema (SSR)

2. Cliente recibe HTML con preguntas ya incluidas
   └── QuestionCard renderiza pregunta + 4 opciones

3. Usuario selecciona una opción
   └── onClick → useQuiz → evalúa correcto/incorrecto
   └── OptionButton muestra feedback visual (verde/rojo)

4. Avanza a la siguiente pregunta
   └── useQuiz incrementa índice
   └── Si era la última → ResultsScreen

5. Quiz completado
   └── Route Handler POST /api/result guarda en quiz_sessions y user_scores
   └── Redirige a historial o pantalla de resultados
```

---

## Hoja de ruta iterativa

### Fase 1 — MVP
- [ ] Setup Next.js + Supabase
- [ ] Auth (registro, login, sesión)
- [ ] Tablas: `profiles`, `topics`, `questions`, `quiz_sessions`, `user_scores`
- [ ] Modo corto: 20 preguntas de un tema
- [ ] Feedback inmediato por respuesta
- [ ] Pantalla de resultados
- [ ] Historial del usuario

### Fase 2
- [ ] Modo largo (60 preguntas, 52 temas)
- [ ] Modo infinito
- [ ] Ranking top 100 (vista SQL + Realtime)
- [ ] `session_answers` para análisis por tema
- [ ] Diagramas interactivos en preguntas (canvas / rompecabezas)
- [ ] Supabase Storage para assets de diagramas

---

*Documento generado como base de planificación. Actualizar conforme avance el desarrollo.*
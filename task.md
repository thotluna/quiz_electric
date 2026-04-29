# 🏗️ Quiz Electric - Plan de Tareas

## ✅ Arquitectura "Continente e Islas" (Finalizado)
- [x] Refactorizar `app/quiz/page.tsx` como Server Component (Continente).
- [x] Mover componentes locales a `app/quiz/components/` (Islas).
- [x] Implementar capa de acceso a datos (DAL) en `lib/queries/questions.ts`.
- [x] Centralizar transformación a `ClientQuestion` para ocultar respuestas correctas.
- [x] Configurar hidratación del store de Zustand desde el servidor.
- [x] Implementar Server Actions para evaluación segura y guardado de stats.

## ✅ Estabilidad y Build (Finalizado)
- [x] Corregir tipos en `QuizConfigStore` (propiedad `mode`).
- [x] Resolver errores de `JSX.Element` usando `ReactElement`.
- [x] Corregir importaciones circulares en `types/index.ts`.
- [x] Validar build de producción exitoso con `pnpm build`.
- [x] Sincronizar rama `refactor/components` y resolver conflictos de `merge`.

## 🛠️ Próximos Pasos
- [ ] Auditoría de UI en dispositivos móviles.
- [ ] Pruebas de integración del flujo completo.
- [ ] Desplegar cambios a producción.

---

## 📜 Historial de Tareas Completadas

### Quiz & Mecánicas
- [x] Implementar cronómetro en el componente `Quiz`
- [x] Mostrar cantidad de respuestas correctas en tiempo real
- [x] Actualizar la UI con un diseño premium para las nuevas estadísticas
- [x] Mostrar tiempo final en la pantalla de resultados
- [x] Verificar el correcto funcionamiento y tipado estricto
- [x] Eliminar botón de evaluar y unificar con el botón de siguiente
- [x] Implementar auto-avance de 3 segundos tras la evaluación
- [x] Mostrar feedback visual del progreso de auto-avance en la UI
- [x] Pausar el cronómetro durante el tiempo de espera del auto-avance
- [x] Reducir espaciados y tamaños de fuente para evitar scroll innecesario
- [x] Optimizar StatsBar para que sea más compacto en móviles
- [x] Ajustar el diseño general para pantallas desktop y mobile
- [x] Implementar página de selección de modo (10 timed, 50, Infinito)
- [x] Implementar filtro por ITC-BT específica o reglamento completo
- [x] Adaptar Quiz y StatsBar para el modo infinito y navegación dinámica

### Autenticación y Perfil
- [x] Integrar Supabase Auth con Google
- [x] Crear página de inicio (Login) con diseño premium
- [x] Persistir estadísticas por pregunta (global + usuario) en Supabase
- [x] Timer por pregunta individual para métricas de tiempo
- [x] Migrar `Question.id` de `number` a `string` (formato `ITC-BT-XX-YY`)

### Estado y Persistencia
- [x] Migrar estado del quiz de `useState` a Zustand store
- [x] Persistir sesión de quiz en localStorage via middleware `persist`
- [x] Refactorizar Server Action a batch (guardar al finalizar)
- [x] Crear ResumeModal para retomar quiz incompleto
- [x] Integrar userId en el flujo del store
- [x] Implementar tests E2E deterministas (Playwright) con mocks de DB y Supabase
- [x] Quitar el error de hidratación.
- [x] Crear una buena gama de colores para los temas dark y light (Premium OKLCH).
- [x] Aplicar correctamente Tailwind 4.
- [x] Soportar Dark Mode por defecto del navegador.
- [x] Mostrar el avatar de Google en el menú de usuario.
- [x] Implementar barra de navegación central e iconos premium.
- [x] Añadir barra de progreso de nivel (Aspirante) al perfil.
- [x] Corregir error de estadísticas y normalizar datos.
- [x] Soportar preguntas de selección múltiple con lógica de puntuación proporcional (+1/-0.25)
- [x] Migrar proyecto a repositorio de GitHub (`thotluna/quiz_electric`)

### Perfil y Estadísticas
- [x] Implementar perfil de usuario con dashboard de estadísticas detallado
- [x] Visualizar historial de simulacros realizados

### Arquitectura Next.js 16
- [x] Refactorizar Auth Guard a Data Access Layer (DAL)
- [x] Migrar `middleware.ts` a `proxy.ts` (Next 16 standard)
- [x] Implementar ruta dedicada `/login` para separación de responsabilidades
- [x] Migrar Home a **Server Components** con carga progresiva (Suspense + Skeletons)
- [x] Desacoplar configuración de ejecución: Navegación basada en **URL Query Params**
- [x] Reorganizar arquitectura de componentes (Colocalización en carpetas privadas `app/_components`)
- [x] Implementar **tests E2E** para validación de estado inicial y flujo de navegación

## Desacoplamiento y Seguridad (Rich Domain Model)
- [x] Refactorizar Infraestructura y Seguridad (Domain-Driven Design)
    - [x] Implementar `IQuestionDataSource` y `QuestionRepository` desacoplados.
    - [x] Crear Server Actions seguras para evaluación y obtención de preguntas.
    - [x] Refactorizar store de Zustand para eliminar lógica de evaluación cliente.
    - [x] Actualizar componentes de UI para consumir datos seguros (`ClientQuestion`).
    - [x] Eliminar deuda técnica y tipos `any` en todo el flujo de datos.

## Selección Inteligente de Preguntas (Supabase + JSON)
- [x] Definir contrato `IUserStatsRepository` y modelo `QuestionStat`
- [x] Implementar `QuestionSelectorService` (Lógica de dominio para filtrado)
- [x] Implementar `SupabaseUserStatsRepository` (Infraestructura)
- [x] Refactorización de `stats.ts` a patrón Repositorio
- [x] Implementación de `SupabaseUserStatsRepository`
- [x] Implementación de `JsonQuestionRepository`
- [x] Creación de `QuizService` para lógica de negocio
- [x] Suite de tests unitarios completa (Mappers, Repositorios, Servicios)
- [x] Resolución de conflictos en UI y Store
- [/] Dashboard de Temas: Implementar lógica de progreso real
- [ ] Documentación de arquitectura en `README.md`
- [x] Refactorizar `getQuizQuestionsAction` para integrar ambos mundos

## Calidad y Testing
- [x] Actualizar tests unitarios de `QuestionRepository`
- [x] Crear tests unitarios para `SupabaseUserStatsRepository`
- [x] Crear tests de integración para `getQuizQuestionsAction`

## Estabilidad y Build
- [x] Corregir errores de tipado en `useQuizStore` (Zustand)
- [x] Refactorizar archivos legacy (`lib/queries/questions.ts`) para eliminar tipos rotos
- [x] Validar build de producción con `pnpm build`

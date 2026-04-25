# Tareas

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

## Autenticación y Perfil
- [x] Integrar Supabase Auth con Google
- [x] Crear página de inicio (Login) con diseño premium
- [x] Persistir estadísticas por pregunta (global + usuario) en Supabase
- [x] Timer por pregunta individual para métricas de tiempo
- [x] Migrar `Question.id` de `number` a `string` (formato `ITC-BT-XX-YY`)

## Estado y Persistencia
- [x] Migrar estado del quiz de `useState` a Zustand store
- [x] Persistir sesión de quiz en localStorage via middleware `persist`
- [x] Refactorizar Server Action a batch (guardar al finalizar)
- [x] Crear ResumeModal para retomar quiz incompleto
- [x] Integrar userId en el flujo del store
- [ ] Implementar perfil de usuario con dashboard de estadísticas
- [x] Implementar tests E2E deterministas (Playwright) con mocks de DB y Supabase
- [x] Soportar preguntas de selección múltiple con lógica de puntuación proporcional (+1/-0.25)
- [x] Migrar proyecto a repositorio de GitHub (`thotluna/quiz_electric`)

## Perfil y Estadísticas
- [ ] Implementar perfil de usuario con dashboard de estadísticas detallado
- [ ] Visualizar historial de simulacros realizados

# Academia Manager — panel estático del proyecto

Panel para coordinar el desarrollo del SaaS de cobranza y asistencia. Está preparado para Vercel y no usa base de datos ni servicios de autenticación propios.

## Funciones

- Resumen, cronograma de ocho días, tablero de tareas y responsables.
- Perfil local para filtrar trabajo de cada integrante; **no es un inicio de sesión seguro**.
- Estado común publicado desde `data/team-state.json`; cambios personales guardados en `localStorage`, con exportación/importación JSON para integrarlos por PR.
- Biblioteca de todos los `docs/*.md` con búsqueda y lectura en la web.
- Enlaces y comandos de Git para los dos repositorios: SaaS y panel.
- Actividad pública de GitHub cuando la API permita leer el repositorio. En repositorios privados, usa los enlaces a GitHub con la sesión de cada integrante.

## Desarrollo local

Requiere Node.js. No hay dependencias que instalar.

```powershell
npm run build
npm run preview
```

Abre `http://127.0.0.1:4173`. Para ver cambios, vuelve a ejecutar `npm run build` y actualiza la página.

## Despliegue en Vercel

Conecta `https://github.com/DACS-SLL/page_academy_manager`. Vercel ejecuta `npm run build` y publica `dist/` según `vercel.json`. El repositorio `https://github.com/DACS-SLL/cloud_project_academy` corresponde al **SaaS** y se enlaza desde el panel; no es el destino de despliegue de esta página.

## Documentación y tareas

Los Markdown compartidos viven en `docs/`. El build genera `docs/manifest.json` automáticamente. `docs/CONTRATO_FUNCIONAL_MVP.md` fija el flujo confirmado por Daniel y `docs/PLAN_FINAL.md` organiza el trabajo de ocho días. Para actualizarlos, abre un PR. Las tareas iniciales viven en `data/tasks.json` y siguen los ID del plan. La validación comercial está en pausa.

La web es solo frontend: los cambios del tablero no se comparten **hasta que `data/team-state.json` se integre por PR y Vercel vuelva a desplegar**. GitHub Issues y Pull Requests son el registro operativo compartido. No guardes información sensible en notas locales ni en el JSON exportado.

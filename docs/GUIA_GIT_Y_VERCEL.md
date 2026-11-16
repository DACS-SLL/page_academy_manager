# Guía de Git, ramas y despliegue

## Dos repositorios, dos propósitos

| Repositorio | URL | Qué se sube allí |
|---|---|---|
| Aplicación SaaS | [DACS-SLL/cloud_project_academy](https://github.com/DACS-SLL/cloud_project_academy) | Código del MVP, migraciones, pruebas, documentación técnica y README del SaaS. |
| Panel de gestión | [DACS-SLL/page_academy_manager](https://github.com/DACS-SLL/page_academy_manager) | Esta web, los archivos `docs/*.md`, tareas iniciales y guías. Vercel despliega **este** repositorio. |

En el espacio de trabajo actual, la aplicación SaaS está en `D:\cloud\academy_cloud` y el panel en `D:\cloud\dashboard-academia`. Los nombres locales no tienen que coincidir con los nombres de GitHub: verifica siempre el remoto antes de publicar.

**Antes de cada push:** ejecuta `git remote -v` dentro del proyecto. El remoto debe ser el de la fila correcta. El panel no se publica en el repositorio del SaaS.

**Convención del equipo:** los mensajes de commit se escriben en español. Se puede conservar un prefijo técnico como `feat`, `fix` o `docs`, seguido de la tarea y una descripción en español; por ejemplo, `docs(R01): ajustar el contrato funcional`.

## Flujo de una tarea

1. Selecciona una tarea con ID en el panel y confirma su dueño y criterio de aceptación.
2. Comprueba la rama base del repositorio en GitHub. Los comandos de abajo usan `main`; si el repositorio usa otra, sustituye `main` por esa rama.
3. Actualiza la rama base, crea una rama con nombre descriptivo y trabaja solo en el repositorio correspondiente.
4. Ejecuta las pruebas relacionadas y revisa `git diff` antes de registrar el cambio.
5. Publica **tu rama**, abre un pull request contra la rama base y solicita revisión. Indica ID de tarea, cambio, evidencia y riesgo.
6. Integra el PR tras revisión humana. Verifica el despliegue del SaaS o de Vercel según corresponda.

### Primera vez en un equipo Windows (PowerShell)

```powershell
git clone https://github.com/DACS-SLL/cloud_project_academy.git
git clone https://github.com/DACS-SLL/page_academy_manager.git
```

Entra con `cd cloud_project_academy` para el SaaS o `cd page_academy_manager` para el panel. No ejecutes comandos desde una carpeta distinta sin comprobar `git remote -v`.

### Ejemplo: tarea B03 del SaaS

```powershell
cd cloud_project_academy
git remote -v
git switch main
git pull origin main
git switch -c feat/B03-pagos-parciales
# Edita archivos y ejecuta las pruebas del módulo.
git status
git diff
git add .
git commit -m "feat(B03): registrar pagos parciales"
git push -u origin feat/B03-pagos-parciales
```

Abre [Pull requests del SaaS](https://github.com/DACS-SLL/cloud_project_academy/pulls) y crea un PR de `feat/B03-pagos-parciales` hacia `main`.

### Ejemplo: actualizar un documento del panel

```powershell
cd page_academy_manager
git remote -v
git switch main
git pull origin main
git switch -c docs/actualizar-plan
# Edita docs/PLAN_FINAL.md u otro archivo .md.
npm run build
git add docs/PLAN_FINAL.md
git commit -m "docs: actualizar plan de ejecución"
git push -u origin docs/actualizar-plan
```

Abre [Pull requests del panel](https://github.com/DACS-SLL/page_academy_manager/pulls) y crea un PR hacia `main`. Una vez integrado, Vercel reconstruirá el panel si el proyecto está conectado a ese repositorio.

## Formato recomendado del pull request

```text
Tarea: B03
Qué cambió: ...
Cómo se probó: ...
Resultado observado: ...
Riesgos o limitaciones: ...
Captura o enlace de evidencia: ...
Revisor solicitado: ...
```

No subas claves, contraseñas, archivos `.env` con valores reales ni datos personales de estudiantes. Usa `.env.example` con nombres de variables y valores vacíos. Si dos personas necesitan tocar el mismo archivo, acuerden el orden y actualicen su rama antes de abrir el PR.

## Vercel para este panel

1. En Vercel, importa **`DACS-SLL/page_academy_manager`**, no el repositorio del SaaS.
2. Configura **Build Command**: `npm run build` y **Output Directory**: `dist` (también están definidos en `vercel.json`). No se requiere base de datos ni variables secretas.
3. Mantén `main` como rama de producción si esa es la rama base del repositorio. Los PR pueden usar previews de Vercel.
4. Tras integrar un PR de documentación, verifica que el `.md` nuevo aparezca en «Documentos». El build descubre automáticamente todos los archivos `docs/*.md`.

El panel lee un estado común desde `data/team-state.json` de este repositorio. Cada cambio hecho en la web queda **en el navegador de quien lo hizo** hasta publicarlo:

1. En «Tablero», pulsa **Exportar estado**. Se descargará `team-state.json` con el estado publicado más tus cambios locales.
2. Revisa el archivo: las notas no deben contener datos sensibles ni información personal de alumnos.
3. En una rama de `page_academy_manager`, reemplaza `data/team-state.json` por el archivo exportado. Abre PR y solicita revisión.
4. Tras integrar el PR, Vercel publicará el mismo estado para todos. Los demás integrantes pueden pulsar **Usar estado publicado** para quitar sus cambios locales anteriores y ver la versión común.

GitHub Issues/PR sigue siendo el registro de decisiones y código. La sincronización mediante JSON es manual y puede tener conflictos si dos personas exportan estados distintos a la vez; Daniel coordina la integración.

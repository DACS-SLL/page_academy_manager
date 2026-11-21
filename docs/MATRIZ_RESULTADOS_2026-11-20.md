# Matriz de resultados y evidencia — corte del 20/11/2026, 23:30 (Lima)

**Responsable:** Daniel Casas. **Estado:** preparación de QA. Esta matriz separa código fusionado, pruebas comunicadas por integrantes y aceptación del recorrido completo. **Ningún caso `A01`–`A14` está aprobado.**

## Evidencia disponible

| ID | Hecho y fuente | Comprobación | Límite |
|---|---|---|---|
| `E-R01` | [Contrato funcional](#/documentos/CONTRATO_FUNCIONAL_MVP.md) y [acta](#/documentos/ACTA_CIERRE_R01.md) publicados en el tablero. | Alcance y reglas documentados por Daniel. | El contrato no prueba la aplicación. |
| `E-C01` | [PR #1](https://github.com/DACS-SLL/cloud_project_academy/pull/1) fusionado; [base en Pages](https://cloud-project-academy.pages.dev/) publicada por HTTPS. | Compilación y pantalla base observadas. | No demuestra conexión Supabase ni persistencia entre navegadores. |
| `E-B01` | [PR #2](https://github.com/DACS-SLL/cloud_project_academy/pull/2) revisado y fusionado: Auth, roles, RLS y Storage privado. | Fernando documentó pruebas de módulo; Daniel revisó código y correcciones. | A11/A12 se repetirán con todos los módulos conectados. |
| `E-B02` | [PR #3](https://github.com/DACS-SLL/cloud_project_academy/pull/3) revisado y fusionado: ciclos, cupos, matrícula, cargos y traslado base. | Fernando documentó 28/28 comprobaciones B02 y pruebas SQL; Daniel revisó invariantes y contratos. | A01/A02/A04 requieren interfaz y recorrido cloud; B06 añadirá historial y excepción. |
| `E-B03` | [PR #4](https://github.com/DACS-SLL/cloud_project_academy/pull/4) aprobado y fusionado en `main` (`8806744`): pago, saldo, activación y anulación. | Daniel revisó la corrección, validó sintaxis del script y observó el check de Cloudflare. Fernando documentó B03 27/27, SQL, lint y build. | Daniel no repitió las pruebas cloud; A05–A07 necesitan F02. El descarte inmediato de voucher está deshabilitado y la limpieza de huérfanos es posterior. |
| `E-B04` | [Rama B04](https://github.com/DACS-SLL/cloud_project_academy/tree/feature/B04-sesiones-asistencia) de Yony con dos RPC, contrato y pruebas SQL. | Revisión estática preliminar de Daniel; observaciones comunicadas a Yony. | Sin PR ni prueba ejecutada verificable. Debe actualizarse con `main`, probar traslado real e impedir sesiones duplicadas. |
| `E-F00` | Juan entregó F00V2 para revisión y comunicó avance de F01. | Comunicación del integrante. | No hay PR o documento F00/F01 publicado en el repositorio del SaaS al corte. |

## Casos de aceptación del MVP

**Regla:** una prueba parcial de backend o un check de despliegue no aprueba el caso completo. Daniel registrará la ejecución final sobre la versión integrada.

| Caso | Qué debe demostrarse | Evidencia parcial actual | Estado | Falta para aprobar |
|---|---|---|---|---|
| `A01` | Ciclo, grupo, curso, docente, alumno y cargos persisten. | Modelo y RPC B02 fusionados. | Pendiente | F01 conectado, recarga y evidencia cloud por rol. |
| `A02` | Inscripción pagada activa; solicitud impaga no ocupa cupo. | B02/B03 fusionados; pruebas de módulo comunicadas. | Pendiente | Flujo F01/F02 y conteo antes/después. |
| `A03` | Excepción con motivo/fecha ocupa cupo y mantiene asistencia al vencer. | B02 tiene estado `exception`. | Pendiente | B06, interfaz y aviso de deuda. |
| `A04` | Traslado acepta vacante, rechaza grupo lleno y conserva historial. | B02 sincroniza matrícula y grupo; prueba de cupo comunicada. | Pendiente | Historial B06 y recorrido desde interfaz. |
| `A05` | S/80 sobre S/200 deja S/120 y guarda voucher privado. | B03 fusionado; resultado de módulo comunicado. | Pendiente | F02, voucher real y saldo visible tras recarga. |
| `A06` | Efectivo, voucher ausente, monto negativo y sobrepago se rechazan. | B03 fusionado; negativos de módulo comunicados. | Pendiente | Rechazos por API y UI sin alterar saldo. |
| `A07` | Solo dirección anula con motivo y restituye saldo. | B03 fusionado; anulación de módulo comunicada. | Pendiente | F02, auditoría y rechazo a secretaría. |
| `A08` | Docente crea sesión, toma lista y tardanza sigue la regla del ciclo. | Código B04 en rama, sin fusionar. | Pendiente | PR B04, F02, conteos 10/15 y persistencia. |
| `A09` | Límite de faltas alerta a dirección sin desaprobación automática. | B04 devuelve umbrales en su rama. | Pendiente | B05, F03, alerta y decisión persistidas. |
| `A10` | No se duplica asistencia ni se toma lista de grupo ajeno. | B04 prueba duplicado por alumno en sesión; falta impedir sesión repetida. | Pendiente | Corrección B04 y negativos API/UI. |
| `A11` | Docente no lee finanzas, apoderados ni vouchers por API/Storage. | Políticas B01 y pruebas de módulo comunicadas. | Pendiente | Repetición independiente en Q01 con F02/F03. |
| `A12` | Academia B no lee ni modifica datos/vouchers de A. | Políticas B01 y pruebas de módulo comunicadas. | Pendiente | Repetición en Q01 con operaciones completas. |
| `A13` | Contactos persisten; deuda y faltas cierran según su regla. | Contrato definido; B05/F03 pendientes. | Pendiente | Historial, resolución por pago/decisión y cierre de ciclo. |
| `A14` | Recorrido HTTPS persiste entre navegadores. | C01 demuestra HTTPS de la base. | Pendiente | I01, dos navegadores y recorrido P0 completo. |

## Registro obligatorio de cada ejecución

Daniel anotará fecha y hora de Lima, URL y commit, rol y academia ficticia, pasos, resultado esperado y observado, captura o log enlazado, defecto y persona que repitió la prueba. Un fallo de cupo, saldo, voucher, permisos o persistencia mantiene el caso pendiente hasta su corrección y repetición.

## Próxima solicitud al equipo

Cada integrante enviará `tarea ID | enlace de PR o artefacto | prueba ejecutada y resultado | bloqueo concreto | dependencia`. Prioridad: PR B04 y B06 de Yony; F00/F01 y F02 de Juan; B05 de Fernando; integración I01 para que Daniel ejecute Q01. La validación comercial permanece en pausa.

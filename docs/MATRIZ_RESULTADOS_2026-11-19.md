# Matriz de resultados y evidencia — corte del 19/11/2026

**Responsable:** Daniel Casas. **Estado:** abierta para QA. Esta matriz distingue evidencia observada, resultados comunicados por un integrante y pruebas de aceptación pendientes. Ningún caso `A01`–`A14` está aprobado todavía.

## Evidencia disponible

| ID | Hecho y fuente | Nivel de comprobación | Límite |
|---|---|---|---|
| `E-R01` | Contrato funcional y acta R01 publicados en este tablero. | Documento revisado por Daniel. | Define lo que se probará; no prueba que la app lo haga. |
| `E-C01` | [PR #1](https://github.com/DACS-SLL/cloud_project_academy/pull/1) fusionado en `main` (`decdb78`); `npm run build` terminó correctamente y [Pages](https://cloud-project-academy.pages.dev/) abrió por HTTPS con la pantalla «La base está lista». | Compilación y apertura HTTPS comprobadas. | Supabase aparece pendiente; falta segundo navegador y no hay flujo ni persistencia del MVP. |
| `E-B01` | [PR #2](https://github.com/DACS-SLL/cloud_project_academy/pull/2) abierto en `5fba4ae`; `docs/B01_PRUEBAS.md` del PR registra `36/36` comprobaciones API/Storage y una prueba SQL de RLS en Supabase cloud. | Resultado comunicado y documentado por Fernando; revisión estática de migraciones y sintaxis del script por Daniel. | Daniel no repitió las pruebas cloud. Persisten las escrituras directas de alumnos señaladas en la revisión; B01 no está en `main`. |

## Casos de aceptación del MVP

**Regla de registro:** «Pendiente» significa que aún no hay ejecución de punta a punta en la versión cloud. Una prueba parcial de un módulo no convierte al caso completo en aprobado.

| Caso | Qué debe demostrarse | Evidencia actual | Estado | Evidencia que falta |
|---|---|---|---|---|
| `A01` | Ciclo, grupo, curso, docente, alumno y cargos persisten. | Ninguna de aplicación. | Pendiente | Recorrido por rol, recarga y registros cloud. |
| `A02` | Inscripción pagada activa; solicitud impaga no ocupa cupo. | Ninguna de aplicación. | Pendiente | Estados y conteo de cupos antes/después. |
| `A03` | Excepción de dirección con motivo y fecha ocupa cupo y conserva asistencia al vencer. | Ninguna de aplicación. | Pendiente | Registro, lista docente y aviso de deuda. |
| `A04` | Traslado autorizado acepta vacante, rechaza grupo lleno y conserva historial. | B01 propone una RPC de traslado; aún no representa matrícula activa/excepcional de B02. | Pendiente | Prueba de negocio con dos turnos, cupo e historial en cloud. |
| `A05` | S/80 sobre S/200 deja S/120 y guarda voucher privado. | B01 contiene datos ficticios y bucket privado. | Pendiente | RPC de pago, saldo y voucher del recorrido real. |
| `A06` | Efectivo, pago sin voucher, monto negativo y sobrepago se rechazan. | Ninguna de aplicación. | Pendiente | Cuatro rechazos sin cambio de saldo. |
| `A07` | Solo dirección anula pago con motivo y restituye saldo. | Ninguna de aplicación. | Pendiente | Anulación autorizada, rechazo a secretaría y auditoría. |
| `A08` | Docente crea sesión, toma lista y la tardanza sigue regla configurable. | B01 contiene tablas y lectura aislada; no hay RPC de escritura. | Pendiente | Sesión y asistencias guardadas; conteo 10/15. |
| `A09` | Límite de faltas alerta a dirección sin desaprobación automática. | Ninguna de aplicación. | Pendiente | Alerta, decisión y motivo persistidos. |
| `A10` | No se duplica asistencia ni se toma lista de grupo ajeno. | B01 limita lectura; no hay operación completa. | Pendiente | Dos intentos negativos por API y UI. |
| `A11` | Docente no lee finanzas, apoderados ni vouchers por API/Storage. | Fernando documentó pruebas B01 de acceso denegado; el PR sigue abierto. | Pendiente | Repetición independiente en Q01 con todos los módulos integrados. |
| `A12` | Academia B no lee ni modifica datos/vouchers de A. | Fernando documentó pruebas B01 entre dos academias. | Pendiente | Repetición en Q01 con tablas y operaciones completas. |
| `A13` | Contactos persisten; deuda y faltas cierran según su regla. | Ninguna de aplicación. | Pendiente | Casos, historial, pago y cierre de ciclo. |
| `A14` | Recorrido funciona por HTTPS y persiste entre navegadores. | `E-C01` prueba HTTPS de la pantalla base. | Pendiente | Segundo navegador y recorrido P0 completo con datos persistentes. |

## Registro para cada ejecución futura

Al ejecutar un caso, Daniel agregará: fecha y hora de Lima, entorno y versión/commit, rol y academia ficticia, pasos, resultado esperado, resultado observado, captura o log enlazado, defecto asociado y persona que lo verificó. Los casos con defectos de cupo, saldo, voucher, permisos o persistencia siguen **bloqueados** hasta repetir la prueba después de corregirlos.

## Próximo corte

**Solicitud diaria al equipo:** cada integrante debe enviar `tarea ID | enlace del PR o artefacto | prueba ejecutada y resultado | bloqueo concreto | persona o entrega de la que depende`. Daniel incorporará solo evidencia comprobable al siguiente corte.

1. Fernando corrige las escrituras directas de `students` y actualiza el PR #2 con pruebas negativas.
2. Yony verifica C01 en otro navegador y acuerda con Fernando el proyecto Supabase para integración.
3. Juan publica F00 y enlaza sus pantallas a las operaciones de B02–B04 conforme estén listas.
4. Daniel registra resultados reales sin convertir evidencia declarada o parcial en aprobación de A01–A14.

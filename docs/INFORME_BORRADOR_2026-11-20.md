# Informe final — borrador de trabajo al 20/11/2026

**Responsable de integración:** Daniel Casas. **Estado:** borrador; no es el PDF final. La [matriz de resultados](#/documentos/MATRIZ_RESULTADOS_2026-11-20.md) separa evidencia parcial de aceptación. Ningún caso `A01`–`A14` ha sido aprobado.

## Portada y control editorial

**Título provisional:** Plataforma cloud de matrícula, cobranza y asistencia para academias preuniversitarias. **Integrantes:** Juan Alexis Quispe Luque, Fernando Perez del Castillo, Yony Alex Vilca Mamani y Daniel Casas. **Pendiente:** datos institucionales, portada, índice, referencias y formato final exigido por la consigna.

## Capítulo I. Problema, objetivos y fundamentos

### Problema y alcance

El flujo descrito por Daniel a partir de su experiencia en academias reúne matrícula, pagos bancarios con voucher, asistencia y seguimiento de casos. Cuando estos registros están separados resulta difícil conocer el saldo, detectar ausencias a tiempo y conservar acuerdos con apoderados. El MVP acordado cubre solicitud y activación, excepción autorizada, traslado con cupo, pago, asistencia por clase, alertas y seguimiento. **La validación comercial externa está en pausa** por decisión del equipo; el informe no afirmará demanda ni rentabilidad sin evidencia.

### Objetivo

Demostrar en cloud un recorrido persistente de matrícula a resolución, con acceso diferenciado por dirección, secretaría y docente, y aislamiento entre academias. Los resultados se evaluarán mediante A01–A14.

### Marco teórico

**Pendiente de redactar con fuentes oficiales y referencias APA:** SaaS/PaaS, disponibilidad, escalabilidad, autenticación, PostgreSQL RLS, almacenamiento privado y responsabilidades del proveedor cloud. No se incorporarán cifras o afirmaciones sin fuente.

## Capítulo II. Propuesta funcional y técnica

### Usuarios y reglas

Dirección configura grupos y umbrales, autoriza excepciones y traslados, y registra la decisión académica. Secretaría matricula, registra pagos y contactos. El docente ve sus grupos y toma lista, sin finanzas, apoderados ni vouchers. El [contrato funcional](#/documentos/CONTRATO_FUNCIONAL_MVP.md) establece las reglas de cupo, deuda, tardanza y cierre de casos.

### Arquitectura y estado comprobado

La base del frontend usa React, TypeScript y Vite en Cloudflare Pages. Supabase aporta Auth, PostgreSQL con RLS y Storage privado. La URL y la clave publicable son las únicas variables previstas para el navegador; las credenciales privilegiadas quedan fuera del frontend.

| Bloque | Estado al corte | Límite de la evidencia |
|---|---|---|
| `C01` | [PR #1](https://github.com/DACS-SLL/cloud_project_academy/pull/1) fusionado; [pantalla base](https://cloud-project-academy.pages.dev/) publicada por HTTPS. | La versión visible aún no demuestra flujos conectados ni persistencia. |
| `B01` | [PR #2](https://github.com/DACS-SLL/cloud_project_academy/pull/2) fusionado con roles, RLS y Storage privado. | Pruebas de módulo comunicadas por Fernando; A11/A12 se repetirán en Q01. |
| `B02` | [PR #3](https://github.com/DACS-SLL/cloud_project_academy/pull/3) fusionado con ciclos, cupos, matrículas, cargos y traslado base. | Fernando documentó 28/28 comprobaciones; no equivale a A01/A02/A04 completos. |
| `B03` | [PR #4](https://github.com/DACS-SLL/cloud_project_academy/pull/4) aprobado y fusionado en `8806744`: pagos bancarios, saldo, activación y anulación auditada. | Fernando documentó 27/27, SQL, lint y build; Daniel revisó la corrección y el check de Cloudflare, sin repetir las pruebas cloud. |
| `B04` | Yony publicó [rama de sesiones y asistencia](https://github.com/DACS-SLL/cloud_project_academy/tree/feature/B04-sesiones-asistencia) con RPC y pruebas SQL. | Sin PR ni ejecución A08/A10 confirmada; hay observaciones de integración. |
| `F00/F01` | Juan entregó F00V2 y comunicó avance de F01. | No hay PR publicado para verificar interfaz o persistencia. |

En B03 se deshabilitó el descarte inmediato de vouchers porque podía competir con la confirmación del pago. Los archivos huérfanos se limpiarán administrativamente después; esta decisión y su efecto están documentados en el PR. B06 debe añadir historial de traslados y autorización de excepciones. B05 debe convertir deuda y umbrales de faltas en casos y decisiones persistentes.

### Seguridad y datos ficticios

Las políticas limitan la lectura por rol y academia. El seed y las pruebas de módulo usan academias y usuarios ficticios; las pruebas completas de aislamiento deben repetirse tras integrar todas las operaciones. **Pendiente:** evidencia de permisos por API/Storage en Q01, respaldo/restauración, configuración del entorno de entrega y revisión de que no haya secretos en código o ZIP.

## Capítulo III. Implementación y evaluación

### Estado del plan

R01, C01 y B01–B03 están cerrados como entregas de contrato, base y backend. F00/F01 están comunicados, pero no publicados en PR. B04 está en rama y requiere correcciones; B06, B05, F02/F03 e I01 siguen pendientes de integración. Daniel preparó la matriz y este borrador; Q01 no puede ejecutar el recorrido final hasta que los flujos estén conectados.

**Ruta crítica:** B04/B06 → F02/F03 y B05 → I01 desplegado → Q01 → PDF, diapositivas, ZIP y ensayo. F04, exportación CSV, es P1 y espera un MVP P0 estable. La entrega está prevista para el 23/11/2026; el objetivo interno es cargar antes de las 20:00.

### Resultados y límites

La [matriz](#/documentos/MATRIZ_RESULTADOS_2026-11-20.md) mantiene A01–A14 pendientes. C01 demuestra despliegue base HTTPS; B01–B03 aportan código fusionado y pruebas de módulo documentadas por Fernando. Estos resultados no demuestran todavía un flujo de punta a punta utilizable por los tres roles. **No hay mediciones cerradas** de rendimiento, carga, satisfacción, costo operativo o recuperación. Cada resultado final incluirá método, fecha, entorno, unidad y fuente.

### Riesgos inmediatos

1. B04 permite crear sesiones repetidas para el mismo grupo, curso y hora; Yony debe corregir y probar el reintento.
2. La prueba de traslado B04 usa una simulación anterior a la corrección fusionada de B02; debe ejercitar la operación real y conservar asistencia histórica.
3. Juan debe publicar F00/F01 y conectar pago y asistencia sin datos fijos; Fernando debe entregar B05; Yony debe entregar B06 e integrar.
4. La versión pública aún no demuestra matrícula, pago, asistencia, alertas ni persistencia entre navegadores.

### Conclusiones provisionales

El equipo publicó una base web y fusionó el backend de seguridad, matrícula y pagos. **Aún falta comprobar que el MVP resuelve el recorrido completo** y que cumple A01–A14. La oportunidad comercial no se dará por validada en este informe sin investigación externa.

## Referencias y anexos por completar

Fuentes APA, diagrama de arquitectura, proceso, modelo de datos, cronograma ejecutado, capturas y logs reales, costos trazables, instrucciones de instalación, ZIP reproducible y guion de exposición. Daniel verificará que PDF y ZIP abran y que la demo funcione antes de la carga final.

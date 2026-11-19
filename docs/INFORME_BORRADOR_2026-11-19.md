# Informe final — borrador de trabajo al 19/11/2026

**Responsable de integración:** Daniel Casas. **Estado:** borrador; no es el PDF final ni una afirmación de que el MVP pasó las pruebas. La [matriz de resultados](#/documentos/MATRIZ_RESULTADOS_2026-11-19.md) registra lo observado y lo pendiente.

## Portada y control editorial

**Título provisional:** Plataforma cloud de matrícula, cobranza y asistencia para academias preuniversitarias. Integrantes: Juan Alexis Quispe Luque, Fernando Perez del Castillo, Yony Alex Vilca Mamani y Daniel Casas. **Pendiente:** universidad, carrera, escudo, curso, docente, ciudad, portada final e índice numerado. Daniel ajustará el documento final al formato y referencias APA exigidos en `PLAN_FINAL.md`.

## Introducción

El equipo desarrolla una aplicación web para reunir matrícula, pagos bancarios con voucher, asistencia y seguimiento de casos de una academia. El problema y el flujo fueron definidos por Daniel a partir de su experiencia en academias. **No se ha realizado validación comercial externa** y el informe no afirmará demanda, satisfacción ni rentabilidad sin evidencia.

# Capítulo I. Problema, objetivos y fundamentos

## 1. Problema y alcance

En el flujo descrito por el equipo, los datos de matrícula, comprobantes, pagos y faltas pueden quedar en registros separados. Eso dificulta conocer el saldo, detectar ausencias a tiempo y conservar acuerdos con apoderados. El MVP acordado cubre solicitud y activación de matrícula, excepción autorizada, traslado con cupo, pago bancario y voucher privado, asistencia por clase, alertas y seguimiento. La validación comercial queda fuera de este sprint por decisión del equipo.

## 2. Objetivo general y objetivos específicos

**Objetivo general:** demostrar en cloud un recorrido de gestión académica y cobranza con datos persistentes y acceso diferenciado por rol y academia.

**Objetivos específicos:** (1) registrar solicitudes, matrículas y cargos; (2) conservar vouchers y pagos bancarios con saldo correcto; (3) registrar asistencia y detectar umbrales de faltas; (4) limitar datos por rol y academia; (5) demostrar el recorrido publicado por HTTPS y verificarlo con casos `A01`–`A14`.

## 3. Marco teórico y fuentes

**Pendiente de redactar y citar con precisión:** IaaS, PaaS, SaaS, regiones, zonas, disponibilidad, escalabilidad, autenticación, PostgreSQL RLS y almacenamiento privado. Se usarán fuentes oficiales realmente consultadas y referencias APA completas; no se añadirán afirmaciones técnicas o cifras sin fuente.

# Capítulo II. Propuesta funcional y técnica

## 4. Usuarios y reglas

Dirección configura grupos y reglas, autoriza excepciones y traslados, y decide los casos académicos. Secretaría registra alumnos, apoderados, vouchers, pagos y contactos. El docente ve sus grupos asignados y toma lista, sin acceso a finanzas, apoderados ni vouchers. El contrato funcional del tablero fija los estados y cierres de deuda y asistencia.

## 5. Arquitectura prevista y estado observado

El frontend es React + TypeScript con Vite y se publica en Cloudflare Pages. Supabase aporta Auth, PostgreSQL con RLS y Storage privado. El navegador solo debe recibir la URL del proyecto y una clave publicable; las credenciales privilegiadas permanecen fuera del frontend.

**Comprobado:** el [PR C01](https://github.com/DACS-SLL/cloud_project_academy/pull/1) fue fusionado en `main` (`decdb78`); la compilación terminó correctamente y la [pantalla base](https://cloud-project-academy.pages.dev/) abrió por HTTPS. La pantalla aún indica que Supabase está pendiente de configuración. Esto comprueba el despliegue base, no la persistencia del MVP.

**En revisión:** el [PR B01](https://github.com/DACS-SLL/cloud_project_academy/pull/2) contiene migraciones, roles, políticas RLS, Storage privado y scripts de prueba. Fernando documentó su ejecución en un proyecto cloud con dos academias ficticias y seis usuarios. Daniel revisó el código y la sintaxis del script, pero no repitió las pruebas cloud. B01 no está integrado en `main` y conserva un ajuste pendiente en la creación y eliminación directa de alumnos.

## 6. Seguridad y datos de prueba

El modelo propuesto lee la pertenencia y el rol desde la tabla `memberships`. La política busca impedir que un docente consulte pagos, apoderados o vouchers, y que un usuario de una academia consulte otra. La evidencia declarada de Fernando está en `docs/B01_PRUEBAS.md` del PR B01; las pruebas completas de aislamiento se repetirán en Q01. Las cuentas y la contraseña del seed son ficticias y pertenecen solo al proyecto demo; no se usarán con datos reales.

**Pendiente:** respaldo y restauración reproducibles, revisión final de permisos, configuración del entorno definitivo, estimación de capacidad y límites del plan cloud. El informe distinguirá el entorno demo del entorno de entrega.

# Capítulo III. Implementación, evaluación y conclusiones

## 7. Plan y estado de implementación

El plan va del 16 al 23 de noviembre de 2026. R01 está cerrado. C01 está publicado y requiere comprobación en un segundo navegador para completar su criterio. B01 está en revisión. Al corte de este borrador no hay PR publicado para F00 de Juan ni código integrado de los módulos B02–B06 y F01–F03. La versión pública aún no ejecuta matrícula, pago, asistencia ni seguimiento.

**Ruta crítica vigente:** cerrar B01 → implementar B02 (ciclo, matrícula y cupo) → B03/B04/B06 (pago, asistencia, excepción y traslado) → B05/F03 (alertas y casos) → I01 (integración cloud) → Q01 (pruebas) → D01/E01 (informe, ensayo y entrega). El equipo prioriza funciones P0 y pospone F04 si esa ruta no está estable.

## 8. Resultados, métricas y costos

La matriz `MATRIZ_RESULTADOS_2026-11-19.md` deja `A01`–`A14` pendientes. C01 aporta evidencia parcial de HTTPS; Fernando reportó pruebas de aislamiento B01, que Daniel debe repetir en Q01. **No hay aún resultados medidos** de rendimiento, carga, satisfacción, costos operativos o respaldo. Esta sección se completará con método, fecha, entorno, unidades y fuente de cada dato. Ningún valor se estimará como si fuera observado.

## 9. Riesgos y decisiones pendientes

- Falta el mapa F00 y la interfaz conectada por roles.
- El PR B01 requiere bloquear asignación directa de grupo y borrado de alumnos antes de integrarlo.
- El frontend publicado carece de configuración Supabase y de recorridos persistentes.
- La entrega del 23/11 exige cerrar la ruta crítica y ensayar una demo real; los respaldos visuales solo apoyarán la exposición, no sustituirán la aplicación.

## 10. Conclusiones provisionales

El equipo demostró que puede compilar y publicar la base web por HTTPS. Fernando aportó una propuesta de aislamiento por rol y academia con evidencia declarada en un entorno ficticio. **Todavía no hay evidencia suficiente para concluir que el MVP resuelve el recorrido completo ni que el negocio está validado.** Las conclusiones finales se redactarán después de Q01 y del ensayo.

## Referencias y anexos por completar

**Pendiente:** referencias APA de fuentes oficiales consultadas, diagrama de arquitectura, proceso, modelo de datos, cronograma, capturas reales, logs de pruebas, costos trazables, instrucciones de instalación, ZIP reproducible y guion de exposición de 50 minutos. Daniel verificará que el PDF final y el ZIP abran antes de la única carga en Classroom.

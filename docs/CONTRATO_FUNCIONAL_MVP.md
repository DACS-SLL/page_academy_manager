# Contrato funcional del MVP — Academia Manager

**Versión:** 1.0, 16 de noviembre de 2026.  
**Origen:** flujo descrito y decisiones confirmadas por Daniel Casas a partir de su experiencia en academias.  
**Estado:** base funcional validada por Daniel; Juan, Fernando y Yony revisarán viabilidad técnica, nombres de campos y reparto de implementación.  
**Prioridad:** este contrato prevalece sobre ejemplos o reglas anteriores del plan cuando describan el comportamiento del MVP. No incluye validación comercial.

## 1. Objetivo demostrable

Una academia organiza un ciclo, matricula alumnos en un grupo con cupos, registra pagos bancarios con voucher, toma asistencia por clase y da seguimiento a deudas y faltas. La demostración debe usar datos ficticios persistentes, reglas calculadas desde la base de datos y tres roles con acceso efectivo. Ningún indicador se simula con valores fijos en la interfaz.

## 2. Organización académica

- Un ciclo tiene nombre, fecha de inicio y fin, año escolar objetivo y reglas de asistencia. Ejemplo: **Ciclo verano**, tres meses, **5.º de secundaria**.
- Un grupo pertenece a un ciclo y tiene un turno (**mañana**, **tarde** o **noche**), identificador y capacidad. Ejemplo: **grupo B, mañana**. Los grupos se forman por matrícula y turno, no por curso.
- Un alumno ocupa como máximo un grupo activo dentro del mismo ciclo. Las matrículas activas y excepcionales ocupan cupo; una solicitud todavía no aprobada no lo ocupa.
- Dirección define los cursos del grupo y asigna docentes según su criterio. Un docente puede impartir cursos o trabajar con más de un grupo. No se impone una restricción por título académico.
- Para P0 no se genera un horario semanal. El docente crea cada sesión al dictar clase, con grupo, curso, fecha y hora; la duración de referencia es 45 minutos.
- Dirección autoriza cambios de turno o grupo solo si existe cupo en el destino. La operación conserva pagos, matrícula e historial de asistencias del grupo anterior.

## 3. Matrícula y pago inicial

1. Secretaría explica el servicio, turnos y precios, registra al alumno (nombre, DNI ficticio, colegio de procedencia y grado) y al menos un apoderado (nombre, DNI ficticio y teléfono ficticio; un segundo es opcional), y acuerda un precio individual **fijo para ese ciclo**.
2. Registra inscripción y mensualidades como cargos separados, con monto y vencimiento. Los materiales son informativos y quedan fuera del cobro P0.
3. El alumno o apoderado paga por un medio bancario externo y entrega el voucher. **No se acepta efectivo.** Secretaría sube la imagen del voucher y registra fecha, medio, referencia y monto; verifica el pago por el medio externo antes de confirmarlo.
4. La matrícula pasa a **activa** cuando se confirma el pago de la inscripción. Pagar la primera mensualidad no es requisito para activarla.
5. Dirección puede autorizar una matrícula **excepcional** antes del pago inicial. Registra motivo y nueva fecha de pago. El alumno ocupa cupo y puede asistir. Si vence la fecha sin pago, continúa asistiendo y secretaría ve una deuda pendiente para contactar a los apoderados. La confirmación posterior de la inscripción convierte la matrícula en activa.

Un pago confirmado se aplica a un cargo concreto. Se permiten pagos parciales de mensualidades y de inscripción; el saldo es el cargo menos la suma de pagos confirmados no anulados. Cada pago, incluido cada pago parcial, exige imagen de voucher. No se admite monto negativo ni superior al saldo. Dirección puede anular un registro erróneo con motivo; se conserva la auditoría y se recalcula el saldo. El descuento por pago completo y la mora automática quedan fuera de P0.

## 4. Asistencia y decisión académica

- El docente asignado abre una sesión de su grupo y curso con fecha y hora, y marca a cada alumno **presente**, **ausente** o **tardanza**. No puede operar otro grupo ni duplicar la asistencia de un alumno en la misma sesión.
- Dirección configura por ciclo el umbral de aviso y el límite de revisión, con valores de demostración **10** y **15** faltas respectivamente. También configura si una tardanza suma una falta. El conteo cubre todo el ciclo y se calcula desde las asistencias guardadas.
- Al alcanzar el umbral de aviso, aparece un caso de seguimiento para secretaría. Contactar a la familia registra una acción, pero no borra el caso ni el conteo.
- Al alcanzar el límite, el sistema **alerta a dirección**. No desaprueba automáticamente: dirección registra su decisión y un motivo. El alumno puede seguir apareciendo en el historial; ninguna decisión borra asistencias.
- Si no se llega al límite, el caso de faltas se cierra al finalizar el ciclo. Si se llega al límite, se cierra cuando dirección registra su decisión. Las notas y contactos permanecen para consulta.

## 5. Seguimiento de deuda y faltas

- Secretaría ve cargos vencidos con saldo pendiente, incluida la inscripción de una matrícula excepcional cuya nueva fecha ya pasó. Una deuda deja de estar activa solo cuando el saldo correspondiente llega a cero; contactar no equivale a cobrar.
- Secretaría ve casos de faltas desde el umbral del ciclo, registra llamada o WhatsApp, fecha, acuerdo o cita, y responsable. El sistema no envía mensajes automáticamente en P0.
- El tablero muestra separadamente importe vencido, alumnos con alerta de asistencia y casos que requieren decisión de dirección. Los indicadores provienen de pagos y asistencias confirmados, no de cifras preparadas en la UI.

## 6. Roles y acceso mínimo

| Rol | Acceso P0 |
|---|---|
| Dirección (`admin`) | Configura ciclos, grupos, cupos, cursos, docentes y reglas; autoriza matrículas excepcionales y cambios de turno; consulta finanzas, apoderados, vouchers y asistencia; anula pagos con motivo y registra decisiones académicas. |
| Secretaría (`cashier`) | Registra alumnos, apoderados, precio acordado, cargos y vouchers; confirma pagos verificados externamente; consulta deuda y asistencia; registra contactos y acuerdos. No autoriza excepciones, traslados ni anulaciones. |
| Docente (`teacher`) | Ve la lista mínima de sus grupos y cursos, abre sesiones y registra asistencia. No ve pagos, precios, vouchers, datos de apoderados ni grupos no asignados. |

Cada consulta y escritura se restringe por academia también en la base de datos; ocultar botones no sustituye la autorización. Los vouchers se almacenan en espacio privado y solo dirección y secretaría pueden abrirlos. La demo usa nombres, DNI y contactos **ficticios**; no se suben datos reales de menores ni claves al repositorio.

## 7. Alcance de ocho días

**P0 para demostrar valor:** autenticación y roles; ciclo, grupo, cupo y asignación de curso/docente; registro de alumno/apoderado y precio por ciclo; inscripción y mensualidades; voucher privado por cada pago bancario; confirmación, parcialidad, saldo y anulación auditada; matrícula activa o excepcional; cambio de turno con autorización y cupo; sesión y asistencia; reglas configurables de faltas; alertas de deuda y asistencia; contacto y decisión de dirección; despliegue cloud, persistencia y pruebas de aislamiento.

**P1 solo si P0 está estable:** exportación CSV y filtros adicionales.

**Fuera de este MVP:** cobro en efectivo, pasarela de pago, descuento automático por pago completo, mora automática, cargos de materiales, horario semanal automático, mensajes automáticos, portal de apoderados, facturación tributaria y aplicación móvil nativa. La validación comercial queda en pausa hasta un acuerdo del equipo.

## 8. Recorrido y pruebas de aceptación

1. Dirección crea un ciclo de tres meses, grupo B de mañana con cupo limitado, cursos, docente y reglas de 10/15 faltas. El segundo navegador ve los mismos datos.
2. Secretaría registra un alumno ficticio, apoderado, inscripción y tres mensualidades. Sube voucher bancario y confirma la inscripción; la matrícula queda activa.
3. Dirección aprueba otra matrícula excepcional con motivo y fecha. Ocupa cupo. Al vencer sin pago, sigue en la lista del docente y aparece deuda para secretaría.
4. Dirección traslada un alumno a un grupo con cupo; un traslado a grupo lleno se rechaza sin perder historial ni alterar los cupos.
5. Secretaría registra un pago parcial con voucher; el saldo y tablero cambian. Un sobrepago, efectivo o un pago sin voucher se rechazan. Una anulación autorizada restaura el saldo y conserva el motivo.
6. Docente crea una sesión de su grupo y curso y toma lista. El conjunto ficticio de sesiones permite demostrar el aviso al llegar a 10 faltas, la configuración de tardanza y la alerta a dirección al llegar a 15. La decisión de dirección queda registrada; no hay desaprobación automática.
7. Secretaría registra contacto y acuerdo. El caso de deuda sale de pendientes al pagarse; el caso de faltas conserva el contacto y se cierra según la regla del ciclo.
8. Un docente no puede leer vouchers o finanzas por API; un usuario de academia B no puede leer ni cambiar datos de academia A. Todo funciona desde la URL cloud tras recargar.

**Evidencia requerida:** URL, capturas de cada rol, resultado de cada prueba, registro de errores y correcciones, migraciones, datos ficticios reproducibles y explicación de servicios cloud en el informe.

## 9. Decisiones de implementación pendientes del equipo técnico

Fernando define el esquema, transacciones, políticas por fila y almacenamiento privado que cumplan estas reglas. Juan define pantallas y estados de carga/error. Yony integra y despliega. Daniel revisa el recorrido y los casos de prueba. Ningún ajuste técnico debe cambiar los resultados funcionales anteriores sin registrar la decisión con Daniel. La confirmación de viabilidad técnica por el equipo es la siguiente puerta de salida de `R01`.

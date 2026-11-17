# Acta de cierre R01 - contrato funcional del MVP

**Fecha:** 17 de noviembre de 2026.  
**Decisión:** Daniel cierra `R01` como definición funcional y autoriza avanzar con el MVP.  
**Base:** respuestas técnicas de Fernando y Yony; Juan aún no respondió. Sus decisiones de interfaz pasan a `F01`, `F02` y `F03` y deben revisarse antes de integrar esas pantallas.  
**Alcance del cierre:** reglas de negocio, recorrido de demostración, responsables técnicos y pruebas previstas. No acredita código implementado, servicios cloud configurados, pruebas aprobadas ni validación comercial.

## Decisiones registradas

| Responsable | Decisión para implementar | Trabajo asociado |
|---|---|---|
| Daniel | Se mantiene el [contrato funcional](CONTRATO_FUNCIONAL_MVP.md): matrícula con inscripción confirmada o excepción, cupos y traslado autorizados, pagos bancarios con voucher, asistencia por sesión, alertas y seguimiento. | Supervisar `RF01`-`RF12` y ejecutar `Q01`. |
| Yony | React + TypeScript, Supabase Auth/PostgreSQL/Storage privado y Cloudflare Pages para el SaaS. Preparará dos academias ficticias, los tres roles, datos reproducibles y la comprobación HTTPS entre navegadores. | `C01`, `B04`, `B06`, `I01`; pruebas `A11`, `A12`, `A14` junto a Daniel y Fernando. |
| Fernando | Migraciones en `supabase/migrations/`; RPC transaccionales para cupos y pagos; restricciones en BD, RLS por academia y rol, bucket privado. | `B01`, `B02`, `B03`, `B05`; pruebas `A02`, `A04`-`A06`, `A11`, `A12`. |
| Juan | Respuesta técnica pendiente. Daniel puede explicar el recorrido; Juan definirá pantallas, estados y mensajes de error al ejecutar sus tareas. | `F01`, `F02`, `F03`; revisión de `RF01` y `RF10`. |

La web de coordinación sigue en el repositorio `page_academy_manager` y se despliega en Vercel. Cloudflare Pages corresponde a la **aplicación SaaS** del repositorio `cloud_project_academy`.

## Contrato de integración mínimo

Los nombres definitivos de tablas y RPC se fijan en las migraciones. El comportamiento y el rol autorizado son obligatorios para frontend y backend.

| Operación | Rol que la inicia | Resultado exigido | Rechazo que debe verse en la interfaz |
|---|---|---|---|
| Registrar solicitud y cargos | Secretaría | Alumno, apoderado, inscripción y mensualidades persistidos; solicitud sin cupo ocupado. | Datos incompletos o academia/grupo ajeno. |
| Confirmar pago bancario | Secretaría | Referencia, monto, fecha y voucher privado vinculados al cargo; saldo actualizado. Si termina de pagar la inscripción, activa matrícula **solo después** de asegurar cupo. | Efectivo, falta de voucher, monto no positivo, sobrepago o grupo lleno. |
| Autorizar excepción | Dirección | Motivo y fecha límite guardados; cupo ocupado y alumno visible al docente. | Grupo lleno, rol indebido o segunda matrícula activa del mismo alumno/ciclo. |
| Trasladar de grupo/turno | Dirección | Vacante comprobada; grupo actual cambia y el historial anterior permanece. | Destino lleno o de otra academia/ciclo. |
| Crear sesión y marcar asistencia | Docente asignado | Sesión por grupo/curso/fecha/hora y marcas persistidas. | Grupo ajeno, docente no asignado o marca duplicada. |
| Consultar alertas y resolver casos | Secretaría / Dirección según acción | Deuda y faltas calculadas desde datos; contacto y decisión registrados. | Acceso indebido o cierre sin cumplir la regla del caso. |

## Precisiones técnicas para `B01`-`B03`

1. **Academia y rol.** La expresión `auth.jwt().academy_id` de la respuesta de Fernando es una intención, no sintaxis SQL final. Si se usa `app_metadata`, la política leerá una ruta como `auth.jwt() -> 'app_metadata' ->> 'academy_id'`, con tipo compatible con la columna. Los valores de autorización deben ser asignados por un proceso privilegiado; `user_metadata` es editable por el usuario y no sirve para autorizar. Un cambio de academia o rol requiere renovar el JWT o consultar membresía en BD. [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [usuarios y metadatos](https://supabase.com/docs/guides/auth/users).
2. **Cupo.** Bloquear el grupo y volver a contar cupos en la misma transacción al **activar por inscripción pagada**, autorizar excepción y trasladar. La solicitud pendiente no ocupa cupo. Toda ruta que modifique capacidad o grupo debe respetar el mismo control; el índice único parcial impide dos matrículas activas o excepcionales del mismo alumno en el ciclo. El traslado entre grupos debe adquirir bloqueos en orden estable. [PostgreSQL: bloqueo de filas](https://www.postgresql.org/docs/current/explicit-locking.html).
3. **Pago.** `voucher_id NOT NULL` y `amount > 0` ayudan, pero la RPC debe comprobar que el objeto privado existe, corresponde a esa academia/cargo y que `amount <= saldo` dentro de la transacción. La confirmación de inscripción y ocupación de cupo debe ser atómica; si falla, no queda pago confirmado. Definir cómo limpiar un voucher cargado cuando la RPC rechaza el pago.
4. **RPC y permisos.** Si una función usa `SECURITY DEFINER`, fijar `search_path`, restringir `EXECUTE` y comprobar dentro de ella `auth.uid()`, rol, academia y propiedad de cada fila. Impedir altas directas que eludan la RPC. La clave privilegiada nunca se entrega al navegador. [Supabase: seguridad de funciones](https://supabase.com/docs/guides/database/functions).
5. **Vouchers.** Bucket privado con políticas de subida/lectura por rol y academia. Una URL firmada se emite tras autorizar al solicitante, dura poco y puede ser usada por quien la posea hasta vencer; por eso no se guarda como URL permanente. También puede usarse descarga autenticada con JWT y RLS. [Supabase: buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [descarga y URLs firmadas](https://supabase.com/docs/guides/storage/serving/downloads).

## Siguientes comprobaciones

- **Fernando y Yony:** publicar esquema inicial, políticas, firmas de operaciones y `.env.example` sin secretos en el repositorio del SaaS. Los bloqueos informados por Yony pasan a `B01` y `C01`; no se consideran resueltos por esta acta.
- **Juan:** acordar con ellos el orden de pantallas y los estados de solicitud pendiente, matrícula activa, excepción vencida, pago rechazado, grupo lleno y alerta. Su falta de respuesta no bloquea `R01`, pero sí la aceptación de `F01`-`F03`.
- **Daniel:** ejecutar y guardar evidencia de `A02`, `A04`-`A06`, `A11`, `A12` y `A14` cuando exista software. Ninguna prueba se marca aprobada en esta acta.

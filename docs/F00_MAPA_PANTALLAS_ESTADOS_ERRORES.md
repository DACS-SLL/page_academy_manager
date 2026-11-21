# F00 — Mapa de pantallas, estados y errores (dirección, secretaría y docente)

**Responsable:** Juan Alexis Quispe Luque (interfaz y experiencia)  
**Fecha:** 19 de noviembre de 2026 · **Estado:** borrador para revisión de Daniel; contratos de operación por acordar con Fernando y Yony  
**Bases:** [contrato funcional](CONTRATO_FUNCIONAL_MVP.md), [acta R01](ACTA_CIERRE_R01.md) y [plan final](PLAN_FINAL.md) (secciones 4, 7 y 8).  
**Desbloquea:** `F01`, `F02` y `F03`. Esta tarea recoge la revisión de interfaz de `R01` que no se respondió a tiempo.

> Este documento es el **mapa general**. El detalle de pantallas, formularios, estados, errores y operaciones está dividido por entrega. Lo marcado como **propuesta** es una decisión de interfaz que el contrato no fija. Ninguna pantalla está implementada todavía.

## 1. Cómo se divide el trabajo

| Entrega | Documento | Pantallas | Depende de | Pruebas | Fecha |
|---|---|---|---|---|---|
| `F00` | Este documento | Mapa, principios, estados transversales, recorrido de demo | `R01` | Revisión de Daniel | Día 2 |
| `F01` | [Ciclo y matrícula](F01_PANTALLAS_CICLO_MATRICULA.md) | S00, D02, D03, C02, C03 | `F00`, `C01`, `B02` | A01, A02 (parte) | Día 3 |
| `F02` | [Pagos y asistencia](F02_PANTALLAS_PAGOS_ASISTENCIA.md) | C04, D06, D06a, T01–T04 | `F00`, `B03`, `B04` | A05, A06, A07 (UI), A08, A10, A11 | Día 4 |
| `F03` | [Tablero, casos y decisión](F03_PANTALLAS_TABLERO_CASOS.md) | D01, D04, D04a, D05a, D07, C01, C05–C07 | `F00`, `B05`, `B06` | A03, A04, A09, A13 | Día 5 |

## 2. Principios de interfaz (valen para las tres entregas)

1. **La interfaz no es la seguridad.** Ocultar botones mejora la experiencia, pero cada acción puede ser rechazada por la base de datos; toda pantalla debe poder mostrar un rechazo del servidor.
2. **Ningún indicador es fijo.** Saldos, cupos, faltas, deuda y alertas se leen de la base de datos; la UI no calcula ni inventa cifras.
3. **El estado nunca depende solo del color.** Cada estado lleva texto e icono.
4. **Un formulario que falla conserva lo escrito**, incluido el archivo seleccionado.
5. **Sin doble envío:** mientras una operación de pago, cupo o traslado está en curso, su botón queda deshabilitado.
6. **Cada rol ve solo su menú.** El docente no recibe precios, pagos, vouchers ni datos de apoderados, y esos datos tampoco deben viajar en sus respuestas.
7. **Datos ficticios:** el pie muestra «Datos de demostración» mientras el MVP sea una demo.

## 3. Mapa de navegación por rol

Las rutas son una propuesta; Yony puede ajustarlas sin cambiar el mapa lógico.

```
SESIÓN
 └─ S00 Iniciar sesión ──► (según rol)
        ├─ DIRECCIÓN  (admin)
        │    ├─ D01 Tablero de dirección ........ F03
        │    ├─ D02 Ciclos y reglas ............. F01
        │    ├─ D03 Grupos y cupos .............. F01
        │    ├─ D04 Matrículas / D04a excepción . F03
        │    ├─ D05 Traslados / D05a ............ F03
        │    ├─ D06 Finanzas / D06a anular ...... F02
        │    └─ D07 Casos de faltas / D07a ...... F03
        │
        ├─ SECRETARÍA (cashier)
        │    ├─ C01 Tablero de secretaría ....... F03
        │    ├─ C02 Nueva matrícula ............. F01
        │    ├─ C03 Alumnos y ficha ............. F01 (+ pagos F02, contactos F03)
        │    ├─ C04 Registrar pago .............. F02
        │    ├─ C05 Deuda ....................... F03
        │    ├─ C06 Casos de faltas ............. F03
        │    └─ C07 Asistencia (consulta) ....... F03
        │
        └─ DOCENTE (teacher)
             ├─ T01 Mis grupos y cursos ......... F02
             ├─ T02 Nueva sesión ................ F02
             ├─ T03 Pasar lista ................. F02
             └─ T04 Mis sesiones ................ F02
```

**Pantallas comunes:** `S00` inicio de sesión; `S01` sin permiso; `S02` no encontrado; `S03` sesión caducada; `S04` error de conexión o servicio no disponible.

### Matriz de acceso a pantallas

| Pantalla o acción | Dirección | Secretaría | Docente |
|---|:-:|:-:|:-:|
| Configurar ciclo, grupos, cursos, docentes y reglas (D02, D03) | Escribe | — | — |
| Autorizar excepción (D04a) | Escribe | Solo lectura | — |
| Traslados (D05a) | Escribe | — | — |
| Nueva matrícula, precio y cargos (C02) | Lectura | Escribe | — |
| Registrar pago con voucher (C04) | Lectura | Escribe | — |
| Anular pago (D06a) | Escribe, con motivo | **No** | — |
| Abrir voucher | Sí | Sí | **No** |
| Deuda y contactos (C05, C06) | Lectura | Escribe | — |
| Decisión al límite de faltas (D07a) | Escribe, con motivo | Lectura | — |
| Crear sesión y pasar lista (T02, T03) | — | — | Escribe, solo sus grupos y cursos |
| Consultar asistencia | Sí | Sí | Solo la propia (T04) |
| Datos de apoderados | Sí | Sí | **No** |

## 4. Estados y errores transversales

### Estados de pantalla

| Situación | Presentación |
|---|---|
| Cargando datos | Esqueleto de tabla o formulario; sin cifras inventadas |
| Sin datos | Mensaje con la siguiente acción posible («Aún no hay sesiones. Crea la primera.») |
| Operación en curso | Botón deshabilitado con indicador; formulario bloqueado |
| Operación exitosa | Aviso verde con los valores devueltos por el servidor («Pago de S/80 confirmado. Saldo: S/120») |
| Error de validación | Mensaje bajo el campo y resumen arriba |
| Rechazo del servidor | Aviso rojo con el mensaje de la entrega correspondiente; el formulario conserva sus datos |
| Sin conexión o 5xx al **leer** | `S04` con «Reintentar»; no se pierde lo escrito |
| Conexión perdida o 5xx al **escribir** | Estado «Verificando…»: la UI **no afirma ni éxito ni fallo** hasta consultar el estado real al servidor (ver E23) |
| Sesión caducada | `S03`: volver a iniciar sesión y regresar a la pantalla anterior |
| Sin permiso | `S01`: «Tu rol no tiene acceso a esta sección» (no revela si el dato existe) |

### Errores transversales

| Código | Cuándo | Mensaje propuesto | Pantalla | Prueba |
|---|---|---|---|---|
| E16 | Docente intenta ver finanzas o vouchers | «Tu rol no tiene acceso a esta sección.» | `S01` | A11 |
| E17 | Usuario de otra academia pide datos ajenos | «No encontrado» (no confirma que el dato exista) | `S02` | A12 |
| E22 | Sesión caducada | «Tu sesión terminó. Inicia sesión de nuevo; tus datos no se perdieron.» | `S03` | A14 |
| E23a | Sin conexión al **leer** | «No pudimos conectar. Revisa tu conexión y reintenta.» | `S04` | A14 |
| E23b | Conexión perdida o 5xx al **escribir** (pago, matrícula, excepción, traslado, asistencia) | «Perdimos la conexión y no podemos confirmar si se guardó. Estamos consultando el estado actual; no reintentes todavía.» | Aviso en el formulario | A14 |
| E23c | Tras consultar: ya estaba guardado | «Sí se guardó: [resumen con los valores del servidor].» | Aviso verde | A14 |
| E23d | Tras consultar: no estaba guardado | «No se guardó. Tus datos siguen en el formulario; puedes reintentar.» | Aviso ámbar | A14 |
| E23e | No se pudo consultar | «Todavía no podemos confirmar el estado. Revisa [la ficha / la lista de pagos] antes de reintentar.» + botón «Consultar de nuevo»; el reintento queda bloqueado | Aviso ámbar | A14 |

**Regla de E23b–E23e:** una escritura que pierde la respuesta puede haberse completado en el servidor. Mientras no se consulte, el botón de enviar sigue bloqueado para evitar un doble pago o una doble matrícula. La consulta usa una **clave de operación** generada por la UI al abrir el formulario (por ejemplo, la referencia bancaria del pago o un id de solicitud). Que el servidor acepte y devuelva esa clave es una petición a Fernando y Yony (decisión 5 de la sección 7).

Los errores de cada operación (E01–E15, E18–E21, E24–E26) están en la entrega que construye esa pantalla: F01 (E01, E02, E24, E25), F02 (E03–E07, E09, E12–E15, E20, E21) y F03 (E08–E11, E18, E19, E26).

**Garantía en todo rechazo explícito del servidor:** la pantalla vuelve a leer saldo, cupo o lista desde el servidor y muestra que **nada cambió**; no se actualiza de forma optimista. Si no hubo respuesta del servidor (E23b), no se afirma que nada cambió hasta consultarlo.

**Requisito para Fernando y Yony:** el servidor devuelve un **código de error estable**, con los valores relevantes (saldo, capacidad), para que la UI muestre el mensaje correcto sin calcular nada.

## 5. Recorrido de demostración (10–15 minutos)

Sigue el guion de la sección 8 del plan; los tiempos son una propuesta para llegar a unos 14 minutos con margen.

| # | Tiempo | Rol | Pantallas (entrega) | Qué se muestra | Estado o error que debe aparecer | Prueba |
|---|---|---|---|---|---|---|
| 1 | 2:30 | Dirección | S00 → D02, D03 (F01) → D04a (F03) | Ciclo con 10/15, grupo B con cupo, curso y docente; **autoriza en vivo la solicitud pendiente precargada** y el cupo sube | «Excepción hasta dd/mm»; cupo actualizado | A01, A03 |
| 2 | 3:00 | Secretaría | C02, C03 (F01) → C04 (F02) | Alumno, precio, inscripción y 3 mensualidades; voucher y confirmación → «Activa»; pago parcial de S/80 sobre S/200 | Saldo S/120; sin voucher → E04 | A01, A02, A05, A06 |
| 3 | 2:00 | Dirección | D05a (F03) | Traslado con cupo; traslado a grupo lleno rechazado | E10 con «nada cambió» | A04 |
| 4 | 3:00 | Docente | S00 → T01–T03 (F02) | Sesión y décima falta; intento de abrir finanzas | Aviso en el tablero; E16 | A08, A10, A11 |
| 5 | 2:30 | Secretaría → Dirección | C06, D01, D07a (F03) | Contacto; alerta al límite y decisión con motivo | «Requiere decisión» → «Cerrado»; sin desaprobación automática | A09, A13 |
| 6 | 1:00 | Cualquiera | Recarga, segundo navegador, academia B | Persistencia y aislamiento | E17 si se fuerza un id | A12, A14 |

El *seed* (Yony, plan §8) necesita:

- un alumno con **9 faltas** y otro con **14**;
- una **solicitud de matrícula pendiente, precargada**, que dirección autoriza como excepción en el paso 1. No se crea en vivo: el contrato exige que la excepción se autorice sobre una solicitud ya registrada y sin pago, y crearla consumiría tiempo del paso 2. Esa solicitud no ocupa cupo hasta que dirección la autoriza;
- una **excepción ya vencida** (fecha pasada y saldo de inscripción > 0), precargada, para mostrar sin esperar que el alumno sigue en la lista del docente y que secretaría ve la deuda (A03). La demo no puede esperar a que venza una fecha real.

Estos dos casos son propuesta pendiente de confirmación de Daniel y Yony. Si prefieren crear la solicitud en vivo, el paso 1 pasa a 4:00 y el recorrido a unos 15:30 minutos, fuera del margen.

## 6. Trazabilidad requisito → pantallas

| Requisito | Pantallas | Entrega | Evidencia de interfaz |
|---|---|---|---|
| RF01 Ciclo, grupo, cupo, curso y docente persisten | D02, D03 | F01 | Capturas antes y después de recargar |
| RF02 Solo inscripción confirmada o excepción permite asistir | C03, D04, T03 | F01, F02, F03 | Estados de matrícula, lista del docente y cupos |
| RF03 Excepción con motivo, fecha, cupo y deuda vencida | D04a, C05, T03 | F03, F02 | Autorización, deuda y lista del docente |
| RF04 Traslado autorizado con vacante e historial | D05a, C03 | F03 | Traslado válido, rechazo E10 y cupos |
| RF05 Inscripción y mensualidades separadas, precio fijo | C02, C03 | F01 | Ficha y cargos persistidos |
| RF06 Pago bancario con voucher privado; saldo correcto | C04, C03 | F02 | Pago parcial, voucher, E03–E06 |
| RF07 Solo dirección anula con motivo y auditoría | D06a | F02 | Saldo restaurado y anulación; E13 |
| RF08 Docente crea sesión de su grupo sin duplicados | T02, T03 | F02 | Sesión, lista guardada, E14, E15 |
| RF09 Faltas y tardanzas por regla; alerta sin desaprobación | D02, T03, C06, D07 | F01, F02, F03 | Conteos 10/15 y decisión |
| RF10 Contactos persisten; casos cierran por resolución | C05, C06, D07a | F03 | Historial, saldo cero, cierre |
| RF11 Rol y academia ajena sin acceso a datos privados | S01, S02 | Todas | E16 y E17 |
| RF12 Cloud con HTTPS y datos entre navegadores | Todas | Todas | URL y recorrido en dos sesiones |

## 7. Decisiones abiertas que cruzan entregas

| # | Pregunta | Para | Propuesta |
|---|---|---|---|
| 1 | ¿El servidor devuelve **códigos de error estables** con los valores en el mensaje? | Fernando | Sí, un código por regla |
| 2 | ¿Qué pasa con la imagen del voucher si el pago se rechaza después de subirla? | Fernando / Yony | Se elimina; el formulario permite volver a elegirla |
| 3 | ¿El docente ve su conteo de faltas, marcas de excepción o deuda? | Daniel | No (lista mínima, contrato §6) |
| 4 | ¿Rutas del SaaS y organización de `src/`? | Yony | Una carpeta por rol dentro de `src/pages/` |
| 5 | ¿Las escrituras aceptan una **clave de operación** para consultar el estado real tras perder la conexión? | Fernando / Yony | Sí: la referencia del pago o un id generado por la UI |
| 6 | ¿La solicitud excepcional de la demo está precargada o se crea antes de autorizarla? | Daniel / Yony | Precargada por el seed (sección 5) |


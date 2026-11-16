# Reglas de trabajo del equipo

## Prioridad

1. El recorrido del MVP debe cumplir `CONTRATO_FUNCIONAL_MVP.md` en cloud con datos persistentes: matrícula activa o excepcional → pago bancario con voucher → asistencia → alerta → contacto y decisión.
2. Los errores de voucher, cupo, saldo, autorización, aislamiento entre academias y persistencia son bloqueantes.
3. Las mejoras P1 se empiezan solo cuando las tareas P0 y sus pruebas están estables.
4. Informe, diapositivas y evidencia se redactan en paralelo al código. La validación comercial permanece en pausa hasta un nuevo acuerdo del equipo.

## Responsables

| Integrante | Lidera | Revisa junto con |
|---|---|---|
| Juan Alexis Quispe Luque | Interfaz y experiencia | Yony en integración; Daniel en pruebas |
| Fernando Perez del Castillo | Backend, datos y seguridad | Yony en integración; Daniel en pruebas |
| Yony Alex Vilca Mamani | Integración, cloud y despliegue | Fernando en reglas; Juan en interfaz |
| Daniel Casas | Dirección, documentación y QA | Los tres líderes de módulo |

## Reunión diaria de 15 minutos

Cada integrante responde: qué quedó integrado ayer, qué terminará hoy, qué bloquea y qué evidencia puede mostrar. Al cierre del día se demuestra la versión integrada, no una maqueta ni una rama aislada.

## Definición de terminado

Una tarea P0 solo está terminada cuando funciona en la versión publicada, usa datos persistentes, respeta permisos, pasa su criterio de aceptación y el informe la describe correctamente. El agente de IA puede ayudar a producir código, texto o pruebas; el responsable humano revisa y demuestra el resultado.

## Documentos

- `PLAN_FINAL.md`: alcance, cronograma, backlog y criterios académicos.
- `CONTRATO_FUNCIONAL_MVP.md`: flujo y reglas confirmados por Daniel; base para pantallas, datos y pruebas.
- `GUIA_GIT_Y_VERCEL.md`: qué subir a cada repositorio y cómo abrir PR.
- `REGLAS_DE_EQUIPO.md`: acuerdos de operación.

Para publicar documentación nueva en el panel, agrega un archivo `.md` a esta carpeta y abre un PR en `page_academy_manager`. No hace falta editar un índice manual: el build lo incorpora a la biblioteca.

El tablero lee `data/team-state.json` como estado común. Los cambios hechos desde la web son locales hasta exportar el JSON y fusionarlo por PR en el repositorio del panel. Daniel coordina esa integración para evitar que un estado antiguo sobrescriba avances ajenos.

# Portada pública y página de servicios

## Objetivo
Reemplazar la demostración clínica de la entrada por una portada pública clara, futurista y centrada en el producto. Mantener los datos reales exclusivamente en el panel privado.

## Cambios
- Crear una navegación pública con acceso a **Inicio**, **Servicios** y **Mi panel**.
- Convertir `/` en una portada con imagen médica futurista, propuesta de valor, acceso al panel y un resumen visible de los servicios.
- Crear `/servicios` con páginas informativas sobre lectura de PDF/JPG, línea de tiempo clínica, riesgo explicable y acceso médico de solo lectura.
- Reutilizar la identidad azul/lima, Libre Baskerville e IBM Plex Sans, con adaptación para celular y escritorio.
- Presentar HL7 FHIR como preparación para interoperabilidad y datos estructurados, sin afirmar certificación ni cumplimiento validado.
- Mantener intactos el análisis clínico, la base de datos, los permisos y la carga de exámenes.

## Verificación
- Comprobar navegación y lectura visual en escritorio y celular.
- Confirmar que `/`, `/servicios`, `/auth` y `/panel` mantienen sus accesos esperados.
- Confirmar metadatos propios para Inicio y Servicios, sin errores de compilación o ejecución.

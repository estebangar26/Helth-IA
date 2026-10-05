# Separar las interfaces por función

## Objetivo
Organizar el espacio del paciente en pantallas independientes, sin cambiar el diseño, la autenticación ni los espacios ya separados de médico y administración.

## Cambios
- Mantener `/paciente` como resumen principal con estado general, avisos, perfil y accesos rápidos.
- Crear `/paciente/examenes` para subir archivos y consultar la línea de tiempo.
- Crear `/paciente/resultados` para biomarcadores y clasificación de riesgo.
- Crear `/paciente/recomendaciones` para las recomendaciones personales y el aviso médico.
- Añadir una navegación común del paciente para moverse entre Inicio, Exámenes, Resultados, Recomendaciones y Especialistas.
- Reutilizar los componentes, datos y controles de acceso actuales; médico y administración permanecen independientes.

## Validación
- Comprobar que cada enlace abre su pantalla y que un paciente no entra a los espacios médico o administrativo.
- Revisar escritorio y móvil, la carga de un examen y los estados sin información.
- Confirmar compilación sin errores.

## Detalles técnicos
- Cada pantalla será una ruta hija de `/_authenticated/paciente` con metadatos propios.
- Todas usarán el mismo panel obtenido por el servidor; no se duplicará lógica clínica ni almacenamiento.

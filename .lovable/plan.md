# Pantalla médica e invitación por correo

## Objetivo
Permitir que el paciente invite a una doctora por correo y comparta, de forma revocable y solo lectura, sus exámenes y la clasificación de riesgo.

## Lo que se construirá
- Agregar permisos de acceso médico con estados pendiente, activo y revocado.
- Proteger los datos desde la base: la doctora podrá leer únicamente los pacientes que la invitaron, sin editar ni borrar información.
- Incorporar en el panel del paciente una sección para invitar por correo, ver el estado y revocar el acceso.
- Crear una pantalla clínica para la doctora con sus pacientes compartidos, riesgo, biomarcadores y línea de exámenes.
- Adaptar el acceso para que una invitación pendiente se active al entrar con el mismo correo invitado.
- Crear un correo de invitación de marca con enlace de acceso.

## Seguridad y privacidad
- La invitación se asociará al correo normalizado y después a la cuenta autenticada de la doctora.
- El permiso se validará en cada consulta; conocer una dirección o identificador no dará acceso.
- La doctora tendrá acceso de solo lectura. El paciente conservará el control para revocar.
- No se afirmará certificación HL7/FHIR; se mantendrá el lenguaje clínico responsable actual.

## Detalles técnicos
- Nueva tabla de accesos médicos con permisos por fila, claves foráneas, índices y concesiones explícitas.
- Funciones protegidas para invitar, listar, aceptar automáticamente por correo verificado, revocar y consultar el panel compartido.
- Rutas privadas separadas para la gestión del paciente y la vista médica.
- Correo enviado desde el servidor mediante el servicio administrado de la aplicación, con plantilla propia e identificador para evitar duplicados.
- Verificación final de compilación, acceso no autorizado, estado de invitación y visualización en escritorio y móvil.

## Requisito externo
El envío comenzará cuando se configure y verifique un dominio de correo propio. El resto del flujo podrá quedar listo antes de esa verificación.

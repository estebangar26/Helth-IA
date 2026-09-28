# Espacios por rol y contenidos clínicos de HelthIA

## Alcance
- Separar el acceso autenticado en `/paciente` y `/medico`, con redirección según rol y bloqueo cruzado tanto en pantalla como en las operaciones de datos.
- Ampliar el perfil del paciente con tipo de atención y campos condicionales para EPS o atención privada.
- Añadir un directorio de especialistas colombianos con ocho registros ficticios y filtros por enfermedad y especialidad.
- Incorporar el aviso médico fijo en resultados y recomendaciones, las tres tarjetas informativas solicitadas y un carrusel local de cuatro mensajes en el panel.
- Sustituir el nombre visible “Copiloto de Salud” por “HelthIA” en toda la plataforma, sin cambiar la identidad visual ni el sistema de acceso existente.

## Seguridad y datos
- Mantener el rol en una tabla de roles separada para impedir que pueda manipularse desde el perfil; la aplicación lo tratará como parte de la identidad del perfil.
- Conservar como pacientes a las cuentas actuales, excepto las que ya estén vinculadas como médicos en accesos activos.
- Aplicar permisos por fila: pacientes consultan su perfil y especialistas; médicos solo consultan pacientes que les dieron acceso.

## Pantallas
- `/paciente`: panel actual, perfil de atención, carrusel y acceso a especialistas.
- `/paciente/especialistas`: listado filtrable.
- `/medico`: lista de pacientes compartidos y sus resultados de solo lectura.
- El acceso redirigirá automáticamente al espacio correcto después de iniciar sesión.

## Validación
- Comprobar compilación, rutas, bloqueo por rol y presentación en escritorio y móvil.
- No se harán cambios manuales de Git: el entorno de Lovable administra el historial y la sincronización del proyecto.

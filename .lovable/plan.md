# Mejorar exclusivamente Mis medicaciones

## Alcance y conservación de datos
- Conservar la pantalla actual y su estilo; cambiar únicamente Mis medicaciones y sus archivos exclusivos.
- Mantener nombres, dosis, frecuencias, notas e identificadores existentes. Convertir solo datos inequívocos; marcar las dosis u horarios ambiguos para revisión, sin inventar unidades ni activar recordatorios.
- No modificar exámenes, extracción, rangos, clasificación, alimentación, historial clínico, login, navegación global ni Mi perfil.

## Registro y lista de tratamientos
- Formulario colapsable adaptado a celular: identificación, médico que prescribe, dosis numérica y unidad seleccionada, fechas, frecuencia, instrucciones, seguridad, inventario, notas y foto opcional privada.
- Confirmación de dosis y unidad antes de guardar; advertencia de duplicados sin bloquear tratamientos legítimos.
- Estados Activo, Pausado y Finalizado; fin automático por fecha sin eliminar registros. Próxima toma, duración, días restantes y alertas de existencias o vencimiento.
- Alergias dentro de Mis medicaciones y alerta por coincidencia del principio activo declarado. Sin sugerencias de IA ni datos médicos inventados.
- Conservar tratamientos al finalizarlos; confirmar antes de borrar.

## Tomas, síntomas e historial del medicamento
- Vista Hoy con tomas programadas y acciones Tomada, Omitida y Posponer 15 minutos; registrar hora real.
- Adherencia de 7 y 30 días basada en dosis programadas y registradas, sin contar como tomada una dosis sin confirmar.
- Registro de síntomas por medicamento, gravedad, relación con toma y notas; aviso de atención inmediata ante gravedad o señales de alarma.
- Línea de tiempo de tomas y síntomas y exportación PDF, únicamente de datos reales del medicamento.

## Recordatorios y privacidad
- Revisiones cada **15 minutos**, como elegiste: hasta 96 revisiones diarias mientras haya recordatorios pendientes, con retraso de hasta 15 minutos. Detener revisiones cuando no queden pendientes y reactivarlas al programar un tratamiento.
- Respetar inicio, fin, pausa, zona horaria y silencio; los tratamientos Vitales omiten el silencio. Un reintento desde los 30 minutos sin confirmación, sujeto a la ventana de revisión.
- Correo mediante Resend, como pide el documento; requiere conectar la cuenta y verificar el remitente. WhatsApp queda desactivado hasta contar con credenciales, plantilla aprobada, verificación del número y consentimiento.
- Preparar confirmación segura desde los mensajes, sin ejecutar acciones al abrir enlaces: confirmar Tomada, Omitida o Posponer mediante una acción explícita.
- Contacto de apoyo opcional: no enviar información hasta verificar su consentimiento.
- Consentimiento explícito para datos de salud; mensajes sin síntomas ni diagnósticos, dosis solo si el usuario autoriza. Opciones de canales y borrado de datos del módulo, no de otras áreas.
- Aviso visible: “Esta app no reemplaza la indicación de tu médico. No cambies dosis ni suspendas medicamentos sin consultar.”

## Detalles técnicos
- Ampliar de forma aditiva `medicaciones`, manteniendo el contrato actual y el acceso médico existente, en lugar de crear una copia independiente en `medications`.
- Añadir tablas exclusivas para horarios, tomas, síntomas, preferencias y registro idempotente de notificaciones; permisos por propietario y validación de datos tanto en pantalla como en servidor.
- Reutilizar autenticación existente y funciones autenticadas. Usar una ruta programada de TanStack con el verificador de llamadas existente, no una Edge Function.
- Fotos en almacenamiento privado, si la política del espacio permite crear el bucket; de lo contrario mantener la opción desactivada y explicar el bloqueo.
- No activar envíos ni revisiones recurrentes hasta que exista un canal operativo y un tratamiento con consentimiento y horario válido.

## Comprobaciones
- Pruebas de unidades, fechas, cálculo de horarios, finalización, silencio, Vitales, reintento único, posposición, duplicados, inventario, adherencia y síntomas graves.
- Verificar conservación de registros y controles de acceso; recorrer creación, confirmación, edición, toma, síntoma, historial y finalización con una cuenta real.
- Revisar celular y escritorio, errores de ejecución y que los demás módulos permanezcan sin cambios.
- Informar por separado lo implementado, lo verificado y cualquier envío o foto bloqueado por servicios externos.
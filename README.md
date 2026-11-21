# HelthIA

**HelthIA** es un prototipo de plataforma web para organizar exámenes médicos, consultar longitudinalmente resultados de laboratorio y facilitar su comprensión antes de la consulta profesional.

La aplicación combina lectura documental asistida por inteligencia artificial, reglas explicables de clasificación y orientación alimentaria basada en un catálogo colombiano. También incorpora espacios diferenciados para pacientes y profesionales, seguimiento de medicamentos, una tienda de dispositivos médicos conectados y acceso local a un monitor biomédico desarrollado con ESP32-S3.

> **Aviso importante:** HelthIA es un prototipo de apoyo informativo. No diagnostica enfermedades, no prescribe tratamientos y no reemplaza la valoración ni el criterio de un profesional de la salud.

## Demo

**Aplicación publicada:** [https://helthicorp.tech](https://helthicorp.tech)

## Objetivo de investigación

Desarrollar y evaluar técnica y funcionalmente un prototipo de plataforma web que integre longitudinalmente los exámenes de laboratorio de personas con diabetes tipo 2, incluidos biomarcadores tumorales, empleando inteligencia artificial para apoyar la lectura de documentos y la comunicación comprensible de los hallazgos, y reglas explicables para clasificar los resultados con base en los rangos reportados por el laboratorio.

El propósito es facilitar la preparación de la consulta médica, sin sustituir la valoración ni el criterio profesional.

## Alcance actual

Aunque la investigación se centra inicialmente en diabetes tipo 2 y biomarcadores tumorales, el prototipo reconoce **71 variables de laboratorio organizadas en nueve categorías**:

| Categoría | Ejemplos de variables |
|---|---|
| Metabolismo de la glucosa | Glucemia, HbA1c, insulina, péptido C y fructosamina |
| Hemograma completo | Hemoglobina, hematocrito, leucocitos y plaquetas |
| Función renal | Creatinina, filtración glomerular, urea y BUN |
| Función hepática | ALT, AST, bilirrubinas y albúmina |
| Perfil lipídico | Colesterol total, HDL, LDL y triglicéridos |
| Electrolitos y minerales | Sodio, potasio, calcio, magnesio y fósforo |
| Función tiroidea | TSH, T4 libre y T3 libre |
| Evaluación hormonal | Testosterona, SHBG, LH, FSH y estradiol |
| Marcadores tumorales | PSA, CA 125, CA 15-3, CA 19-9, CEA y AFP |

Los biomarcadores tumorales procesados por HelthIA **no equivalen a marcadores genéticos**. El sistema no analiza variantes de ADN como BRCA1 o BRCA2.

## Funcionalidades principales

### Paciente

- Registro, inicio de sesión y recuperación de contraseña.
- Perfil personal y validación del documento de identidad.
- Carga de exámenes en formatos PDF, JPG, PNG y WEBP.
- Extracción asistida de resultados y revisión de los valores obtenidos.
- Línea cronológica ordenada por fecha y hora de cargue.
- Identificación separada de la fecha de cargue y la fecha del laboratorio.
- Resultados agrupados por categoría, con búsqueda, filtros e historial.
- Comparación porcentual frente a mediciones anteriores.
- Clasificación según los rangos reportados por cada laboratorio.
- Orientación alimentaria colombiana relacionada con resultados alterados.
- Registro de medicamentos, horarios, tomas, síntomas y adherencia.
- Asistente virtual para navegación y orientación general.

### Profesional de la salud

- Invitaciones de acceso compartidas y revocables por el paciente.
- Interfaz independiente con la lista de pacientes compartidos.
- Consulta de exámenes, resultados, filtros e historial.
- Acceso de **solo lectura**, sin posibilidad de modificar datos clínicos.
- Registro de observaciones asociadas a exámenes.
- Notificación por correo al paciente sin incluir información clínica sensible.

### Alimentación recomendada

- Catálogo editable de **59 alimentos**, **8 reglas** y **63 lugares**.
- Fotografías reales con autoría y licencia.
- Reglas de compatibilidad y restricciones cruzadas entre resultados.
- Orientación calculada localmente, sin consumir IA en cada consulta.
- Acceso a lugares de Colombia mediante Google Maps.
- Panel administrativo para alimentos, reglas, lugares y fotografías.

### Medicaciones

- Médico prescriptor, dosis, frecuencia y horarios.
- Registro de tomas, síntomas, adherencia e inventario.
- Fotografías privadas y exportación de información en PDF.
- Integración con Telegram para recordatorios.
- Conservación de registros antiguos hasta su revisión estructurada.

### Tienda y dispositivos IoTM

- Catálogo de nueve productos conectado con Shopify Storefront.
- Precios de referencia en pesos colombianos.
- Carrito persistente y generación del enlace de pago.
- Información editorial y enlaces a fabricantes.
- Acceso local al monitor biomédico basado en ESP32-S3.

## Arquitectura

```text
Navegador
   │
   ├── React + TanStack Router + TanStack Query
   │
   ├── Formularios y validación con Zod
   │
   ▼
TanStack Start
   │
   ├── Funciones de servidor autenticadas
   ├── Rutas HTTP para integraciones
   └── Validación de sesión y permisos
   │
   ▼
Lovable Cloud
   │
   ├── PostgreSQL
   ├── Autenticación
   ├── Control de acceso por fila — RLS
   └── Almacenamiento privado
   │
   ├── Inteligencia artificial
   ├── Correo transaccional
   ├── Shopify Storefront API
   ├── Telegram
   └── MCP + OAuth 2.1
```

El frontend utiliza componentes declarativos de React. El backend se implementa con **TanStack Start**, sin Express. La aplicación publicada se ejecuta en **Cloudflare Workers**; Node.js se utiliza como apoyo durante el desarrollo local.

## Tecnologías

### Frontend

- React 19
- TypeScript
- Vite 8
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui y Radix UI
- React Hook Form
- Zod
- Zustand
- Recharts y SVG
- Lucide React
- Sonner

### Backend y servicios

- TanStack Start
- Cloudflare Workers
- Lovable Cloud
- PostgreSQL
- Autenticación y almacenamiento privado
- Shopify Storefront API
- Telegram
- MCP con OAuth 2.1
- Correo transaccional
- Inteligencia artificial para lectura documental y comunicación

## Estructura del proyecto

```text
src/
├── assets/                  # Recursos visuales
├── components/
│   ├── ui/                  # Componentes base reutilizables
│   ├── copiloto/            # Exámenes, resultados y navegación
│   ├── alimentacion/        # Orientación alimentaria
│   └── tienda/              # Carrito de compras
├── hooks/                   # Hooks compartidos
├── integrations/            # Clientes generados de servicios
├── lib/
│   ├── copiloto/            # Modelos y lógica de exámenes
│   ├── alimentacion/        # Reglas y acceso al catálogo
│   ├── medicaciones/        # Horarios, tomas y adherencia
│   ├── telegram/            # Recordatorios y comunicación
│   ├── shopify/             # Productos y carrito
│   └── email-templates/     # Plantillas transaccionales
├── routes/                  # Páginas y endpoints por archivos
├── stores/                  # Estado persistente del carrito
├── router.tsx               # Configuración del enrutador
├── start.ts                 # Middleware de autenticación y CSRF
└── styles.css               # Sistema visual y tokens de diseño
```

## Rutas destacadas

| Ruta | Contenido |
|---|---|
| `/` | Página principal |
| `/servicios` | Servicios y alcance de la plataforma |
| `/paciente` | Panel del paciente |
| `/paciente/examenes` | Carga y línea cronológica |
| `/paciente/resultados` | Variables, filtros e historial |
| `/paciente/recomendaciones` | Alimentación recomendada |
| `/paciente/medicaciones` | Medicamentos y seguimiento |
| `/medico` | Pacientes compartidos |
| `/tienda` | Catálogo y carrito IoTM |
| `/dispositivos` | Acceso local al ESP32-S3 |
| `/sobre-nosotros` | Biografía, contacto y PQRS |
| `/mcp` | Herramientas MCP autenticadas |

## Seguridad y privacidad

- Base de datos con **20 tablas públicas y RLS habilitada**.
- Separación de información por cuenta y propietario.
- Permisos médicos revocables y de solo lectura.
- Roles almacenados en tablas protegidas.
- Validación de entradas en cliente y servidor.
- Middleware de autenticación y protección CSRF.
- Fotografías privadas mediante URLs firmadas.
- Correos de aviso sin resultados ni diagnósticos.
- Registro privado de contactos y PQRS.

Estas medidas no sustituyen una auditoría de seguridad, pruebas de penetración ni una evaluación jurídica para el tratamiento de datos de salud.

## Requisitos para desarrollo local

- Una versión reciente de Node.js.
- Bun como gestor de paquetes recomendado.
- Acceso a la configuración de Lovable Cloud utilizada por el proyecto.
- Variables de entorno y credenciales configuradas fuera del control de versiones.

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
bun install
bun run dev
```

La aplicación estará disponible en la dirección local indicada por Vite.

### Variables de entorno

Para una ejecución independiente se deben configurar las variables públicas correspondientes al backend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

Las credenciales privadas de Telegram, correo, inteligencia artificial y otros servicios deben almacenarse como secretos del entorno.

**No incluyas archivos `.env`, contraseñas, tokens ni datos reales de pacientes en el repositorio.**

Clonar el repositorio no reproduce automáticamente la base de datos, los usuarios, el almacenamiento ni las integraciones externas.

## Comandos

```bash
# Servidor de desarrollo
bun run dev

# Compilación de producción
bun run build

# Revisión estática
bun run lint

# Pruebas automatizadas
bunx vitest run
```

## Verificación

En la consolidación técnica de noviembre de 2026 se obtuvieron:

- **9 archivos de pruebas superados.**
- **72 pruebas automatizadas superadas.**
- **0 pruebas fallidas.**

Las pruebas cubren reglas de medicación, alimentación, lectura de resultados, recuperación de contraseña, rangos de referencia, Telegram, contacto/PQRS y notificaciones médicas.

También se realizaron recorridos funcionales de carga de exámenes, acceso médico, observaciones, alimentación, administración de imágenes, PQRS, carrito, generación de checkout y envío de mensajes por Telegram.

## Estado de las integraciones

| Integración | Estado actual |
|---|---|
| Lovable Cloud | Activa |
| Lectura documental con IA | Implementada |
| Asistente virtual | Implementado |
| Correo transaccional | Implementado para flujos específicos |
| Telegram | Conectado; recordatorios automáticos pausados |
| Shopify | Tienda de desarrollo con carrito y checkout |
| ESP32-S3 | Funcionamiento local, sin sincronización con la nube |
| MCP | Herramientas disponibles; sin asistente externo específico |
| WhatsApp Business | No conectado |
| Google Ads y Meta | No conectados |

## Interoperabilidad

El modelo organiza valores, unidades, fechas, referencias y observaciones tomando como orientación los principios de interoperabilidad de **HL7 FHIR**.

HelthIA **no implementa actualmente una integración FHIR completa** y no debe presentarse como un sistema certificado bajo ese estándar.

## Limitaciones conocidas

- No se ha realizado validación clínica con una muestra representativa.
- No se ha medido el impacto en desenlaces de salud.
- La clasificación de resultados no constituye diagnóstico ni cálculo integral del riesgo de enfermedad.
- La exactitud de la extracción puede variar según la calidad y estructura del documento.
- Los precios de la tienda son de referencia.
- No se ha completado una compra real.
- El ESP32-S3 funciona en red local y no envía telemetría clínica a HelthIA.
- Los especialistas incluidos son registros ficticios de demostración.
- Los recordatorios por WhatsApp y correo de medicación no están operativos.

## Próximos pasos

1. Evaluar la extracción con exámenes anonimizados y acompañamiento profesional.
2. Ampliar las pruebas funcionales y de seguridad.
3. Revisar la normatividad colombiana aplicable a los datos de salud.
4. Validar comprensibilidad y usabilidad con pacientes y profesionales.
5. Definir los requisitos de una integración FHIR completa.
6. Evaluar una conexión segura del ESP32-S3 con servicios remotos.
7. Completar los canales de notificación antes de un piloto controlado.

## Investigación

HelthIA se desarrolla bajo el enfoque **Design Science Research — DSR**, que orienta el diseño, construcción y evaluación de un artefacto de software para responder a un problema práctico del entorno de la salud.

El resultado actual corresponde a un artefacto tecnológico evaluado funcionalmente. La validación clínica y la evaluación de impacto constituyen etapas posteriores.

## Autor

**Esteban García Otálvaro**  
Estudiante de Bioingeniería  
Universidad de Antioquia — Facultad de Ingeniería  
Participante del Bootcamp de Desarrollo de Software de Jóvenes Creativos de Sofka

El proyecto integra ingeniería biomédica y clínica, análisis de datos, sistemas embebidos y desarrollo de software aplicado a la salud.

## Aviso médico

> Esta información es orientativa y debe ser validada por un profesional de la salud. No reemplaza el criterio médico.

---

**HelthIA · Información clínica conectada**  
Proyecto académico y tecnológico · 2026

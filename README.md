# HealthIA

**HealthIA** es una plataforma web de apoyo a la prevención y el monitoreo de la salud mediante la integración de datos clínicos, reglas de clasificación de riesgo e inteligencia artificial.

El proyecto busca facilitar el seguimiento longitudinal de la información médica del paciente, integrando **exámenes, biomarcadores, antecedentes familiares y factores de riesgo** en una línea de tiempo unificada. Además, incorpora un motor de reglas determinístico para apoyar la clasificación de riesgo y un componente de inteligencia artificial orientado exclusivamente a generar **recomendaciones nutricionales personalizadas**.

## Objetivo

HealthIA nace como una propuesta de salud preventiva y predictiva orientada inicialmente al seguimiento de **diabetes mellitus tipo 2**, con una arquitectura que puede extenderse posteriormente a otras condiciones como cáncer y salud sexual.

El sistema busca:

* Centralizar la información clínica del paciente en una línea de tiempo.
* Identificar niveles de riesgo mediante reglas clínicas determinísticas.
* Facilitar la comprensión de los resultados de exámenes.
* Generar recomendaciones nutricionales personalizadas utilizando información de productos alimenticios colombianos.
* Proporcionar un resumen útil para preparar la consulta médica.
* Contextualizar el riesgo individual frente a información epidemiológica de Colombia.

> **Importante:** HealthIA es un prototipo de apoyo informativo y no reemplaza el diagnóstico, criterio ni consulta de un profesional de la salud. Durante el desarrollo se contempla el uso de datos simulados o anonimizados.

## Tecnologías y arquitectura

El proyecto contempla una arquitectura orientada a la interoperabilidad de datos clínicos, tomando como referencia el estándar **HL7 FHIR**, junto con un motor de reglas clínicas y un componente de inteligencia artificial para recomendaciones nutricionales.

La aplicación web fue desarrollada inicialmente utilizando **Lovable**, permitiendo sincronizar los cambios del proyecto directamente con este repositorio.

## Demo

**Live app:**
helthicorp.tech


## Instalación

Para ejecutar HealthIA localmente:

```bash
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

Se requiere tener instalado **Node.js** y **npm**.

## Estado del proyecto

HealthIA se encuentra en fase de **prototipo y desarrollo**. El alcance actual prioriza la implementación y validación del seguimiento de diabetes tipo 2, mientras que la arquitectura contempla futuras extensiones a otras áreas de salud.

## Investigación

El desarrollo de HealthIA forma parte de una propuesta de investigación bajo el enfoque **Design Science Research (DSR)**, cuyo objetivo es diseñar, desarrollar y evaluar un artefacto de software para abordar un problema práctico de salud.

**Universidad de Antioquia — Facultad de Ingeniería — Bioingeniería**

2026


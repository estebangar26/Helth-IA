/** Aviso sin contenido clínico: el mensaje solo se lee tras iniciar sesión. */
import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  enlace?: string
}

const MensajeMedico = ({ enlace }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tiene un nuevo mensaje en HelthIA</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevo mensaje de su médico</Heading>
        <Text style={text}>Un médico autorizado le dejó un nuevo mensaje en su espacio de HelthIA.</Text>
        <Text style={text}>Por seguridad, el contenido no se incluye en este correo. Inicie sesión para consultarlo.</Text>
        <Button href={enlace ?? 'https://helthicorp.tech/paciente/resultados'} style={button}>Consultar mensaje en HelthIA</Button>
        <Text style={small}>Si no esperaba este aviso, puede ignorarlo. No responda a este correo con información médica.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MensajeMedico,
  subject: 'Tiene un nuevo mensaje de su médico en HelthIA',
  displayName: 'Aviso de mensaje médico',
  previewData: { enlace: 'https://helthicorp.tech/paciente/resultados' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"IBM Plex Sans", Arial, sans-serif' }
const container = { padding: '28px 25px', maxWidth: '560px' }
const h1 = { color: '#16324F', fontFamily: 'Georgia, serif', fontSize: '24px' }
const text = { color: '#33475B', fontSize: '15px', lineHeight: '24px' }
const button = { backgroundColor: '#246BCE', color: '#ffffff', borderRadius: '6px', padding: '12px 20px', fontWeight: 600 }
const small = { color: '#6B7C8F', fontSize: '12px', marginTop: '24px' }

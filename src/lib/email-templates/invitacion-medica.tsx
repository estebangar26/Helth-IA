/** Correo que recibe el médico cuando un paciente lo invita. */
import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  paciente?: string
  enlace?: string
}

const InvitacionMedica = ({ paciente, enlace }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{paciente ?? 'Un paciente'} le compartió sus exámenes en HelthIA</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invitación a HelthIA</Heading>
        <Text style={text}>
          {paciente ?? 'Un paciente'} le invitó a consultar sus exámenes y su nivel de riesgo en modo de solo lectura.
        </Text>
        <Text style={text}>Inicie sesión o regístrese con este mismo correo para acceder a la interfaz médica.</Text>
        <Button href={enlace ?? 'https://helthicorp.tech/auth'} style={button}>Ingresar como médico</Button>
        <Text style={small}>La información es orientativa y no reemplaza el criterio médico.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvitacionMedica,
  subject: (d: Record<string, any>) => `${d.paciente ?? 'Un paciente'} le compartió sus exámenes en HelthIA`,
  displayName: 'Invitación médica',
  previewData: { paciente: 'Ana Pérez', enlace: 'https://helthicorp.tech/auth' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"IBM Plex Sans", Arial, sans-serif' }
const container = { padding: '28px 25px', maxWidth: '560px' }
const h1 = { color: '#16324F', fontFamily: 'Georgia, serif', fontSize: '24px' }
const text = { color: '#33475B', fontSize: '15px', lineHeight: '24px' }
const button = { backgroundColor: '#246BCE', color: '#ffffff', borderRadius: '6px', padding: '12px 20px', fontWeight: 600 }
const small = { color: '#6B7C8F', fontSize: '12px', marginTop: '24px' }

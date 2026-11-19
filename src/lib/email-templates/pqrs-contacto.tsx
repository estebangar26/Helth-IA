import React from "react";
import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  radicado?: string;
  nombre?: string;
  email?: string;
  tipo?: string;
  mensaje?: string;
}

const etiquetas: Record<string, string> = {
  contacto: "Contacto general",
  opinion: "Opinión",
  peticion: "Petición",
  queja: "Queja",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
};

const PqrsContacto = ({ radicado, nombre, email, tipo, mensaje }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo mensaje desde la página Sobre nosotros de HelthIA</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevo contacto o PQRS</Heading>
        <Text style={text}><strong>Radicado:</strong> {radicado ?? "Sin radicado"}</Text>
        <Text style={text}><strong>Tipo:</strong> {etiquetas[tipo ?? ""] ?? "Contacto general"}</Text>
        <Text style={text}><strong>Nombre:</strong> {nombre ?? "No informado"}</Text>
        <Text style={text}><strong>Correo para responder:</strong> {email ?? "No informado"}</Text>
        <Text style={text}><strong>Mensaje:</strong></Text>
        <Text style={mensajeEstilo}>{mensaje ?? "Sin mensaje"}</Text>
        <Text style={small}>Puedes responder directamente a este correo para escribir a la persona que envió el mensaje.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PqrsContacto,
  subject: (data: Record<string, unknown>) => `HelthIA · ${etiquetas[String(data["tipo"])] ?? "Contacto"} · ${String(data["radicado"] ?? "")}`,
  displayName: "Aviso de contacto o PQRS",
  previewData: { radicado: "A1B2C3D4", nombre: "María Pérez", email: "maria@example.com", tipo: "opinion", mensaje: "Me gustó la claridad de la página." },
  to: "estebangarcia2604@gmail.com",
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: '"IBM Plex Sans", Arial, sans-serif' };
const container = { padding: "28px 25px", maxWidth: "560px" };
const h1 = { color: "#16324F", fontFamily: "Georgia, serif", fontSize: "24px" };
const text = { color: "#33475B", fontSize: "15px", lineHeight: "24px" };
const mensajeEstilo = { ...text, whiteSpace: "pre-wrap" as const, padding: "14px", backgroundColor: "#F4F7FA", borderRadius: "6px" };
const small = { color: "#6B7C8F", fontSize: "12px", marginTop: "24px" };

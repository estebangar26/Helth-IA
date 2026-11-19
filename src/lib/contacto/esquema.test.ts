import { describe, expect, it } from "vitest";
import { contactoSchema } from "./esquema";

const valido = {
  nombre: "María Pérez",
  email: "maria@example.com",
  tipo: "opinion",
  mensaje: "La página me pareció clara y útil.",
  website: "",
};

describe("contacto y PQRS", () => {
  it("acepta una opinión completa y normaliza el correo", () => {
    const resultado = contactoSchema.parse({ ...valido, email: " MARIA@EXAMPLE.COM " });
    expect(resultado.email).toBe("maria@example.com");
  });

  it("rechaza un correo inválido", () => {
    expect(contactoSchema.safeParse({ ...valido, email: "correo-invalido" }).success).toBe(false);
  });

  it("rechaza mensajes de menos de 10 caracteres", () => {
    expect(contactoSchema.safeParse({ ...valido, mensaje: "Muy corto" }).success).toBe(false);
  });

  it("rechaza mensajes que superen 2000 caracteres", () => {
    expect(contactoSchema.safeParse({ ...valido, mensaje: "a".repeat(2001) }).success).toBe(false);
  });
});

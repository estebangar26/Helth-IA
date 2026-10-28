import { describe, expect, it } from "vitest";
import { numerosRangoImpreso } from "./rango-impreso";

describe("Números en rangos impresos", () => {
  it("clasifica leucocitos 7800 dentro de 4,500–11,000", () => {
    const rango = numerosRangoImpreso("4,500–11,000", "Leucocitos");
    expect(rango).toEqual([4500, 11000]);
    expect(7800 >= rango[0] && 7800 <= rango[1]).toBe(true);
  });
  it("clasifica plaquetas 260000 dentro de 150,000–450,000", () => {
    const rango = numerosRangoImpreso("150,000–450,000", "Plaquetas");
    expect(rango).toEqual([150000, 450000]);
    expect(260000 >= rango[0] && 260000 <= rango[1]).toBe(true);
  });
  it("conserva hemoglobina 14.2 dentro de 12.0–16.0", () => {
    const rango = numerosRangoImpreso("12.0–16.0", "Hemoglobina");
    expect(rango).toEqual([12, 16]);
    expect(14.2 >= rango[0] && 14.2 <= rango[1]).toBe(true);
  });
  it("admite puntos para miles en conteos", () => {
    expect(numerosRangoImpreso("4.500 - 11.000", "Leucocitos")).toEqual([4500, 11000]);
  });
  it("conserva comas decimales cuando no es un conteo", () => {
    expect(numerosRangoImpreso("0,600–1,200", "Creatinina")).toEqual([0.6, 1.2]);
  });
});
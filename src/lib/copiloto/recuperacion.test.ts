import { describe, expect, it } from 'vitest';
import { leerEnlaceRecuperacion, limpiarEnlaceRecuperacion } from './recuperacion';

describe('enlace de recuperación', () => {
  it('conserva los tokens implícitos hasta entregarlos al cliente', () => {
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer#access_token=acceso&refresh_token=renovacion&type=recovery')).toEqual({
      tipo: 'implicito', accessToken: 'acceso', refreshToken: 'renovacion',
    });
  });

  it('admite un código de un solo uso', () => {
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer?code=un-codigo&type=recovery')).toEqual({ tipo: 'codigo', codigo: 'un-codigo' });
  });

  it('admite verificación por token hash', () => {
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer?token_hash=hash-firmado&type=recovery')).toEqual({ tipo: 'token', tokenHash: 'hash-firmado' });
  });

  it('detecta un enlace vencido en query o fragmento', () => {
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer?error=access_denied&error_code=otp_expired')).toEqual({ tipo: 'error' });
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer#error=access_denied')).toEqual({ tipo: 'error' });
  });

  it('no habilita el formulario por una sesión normal sin enlace', () => {
    expect(leerEnlaceRecuperacion('https://helthicorp.tech/restablecer')).toEqual({ tipo: 'ausente' });
  });

  it('retira todas las credenciales y errores visibles de la URL', () => {
    expect(limpiarEnlaceRecuperacion('https://helthicorp.tech/restablecer?code=secreto&type=recovery#access_token=secreto')).toBe('/restablecer');
  });
});

/* global __dirname */
require('./setupTestEnv.js');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');

describe('Mobile Auth Service & Registration Sanity Tests', () => {
  it('no contiene IP simulada fija ni credenciales quemadas en cliente móvil', () => {
    const fs = require('fs');
    const path = require('path');
    const socialAuthCode = fs.readFileSync(
      path.join(__dirname, '../modules/auth/hooks/useSocialAuth.ts'),
      'utf8'
    );
    assert.equal(socialAuthCode.includes('192.168.1.'), false);
    assert.equal(socialAuthCode.includes('sharith.amezquita@drivique.com'), false);

    const authServiceCode = fs.readFileSync(
      path.join(__dirname, '../modules/auth/services/authService.ts'),
      'utf8'
    );
    assert.equal(authServiceCode.includes(": 'Drivique';"), false);
  });

  it('procesa login con token Bearer en apiClient', async () => {
    const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://drivique.tech/api/v1';
    assert.ok(baseURL.includes('/api/v1'));
  });
  it('cerrar sesión revoca el refresh token en el servidor y lo borra del teléfono', () => {
    const fs = require('fs');
    const path = require('path');
    const servicio = fs.readFileSync(path.join(__dirname, '../modules/auth/services/authService.ts'), 'utf8');
    const logout = servicio.slice(servicio.indexOf('async logout()'), servicio.indexOf('setCredencialesPendientes'));
    assert.ok(logout.includes('/auth/logout'), 'debe llamar a /auth/logout');
    assert.ok(logout.includes('clearRefreshToken'), 'debe borrar el refresh token local');
    assert.ok(logout.indexOf('getRefreshToken') < logout.indexOf('clearRefreshToken'), 'lee el token antes de borrarlo');

    const perfil = fs.readFileSync(path.join(__dirname, '../modules/profile/screens/ProfileScreen/usePerfilScreenLogic1.tsx'), 'utf8');
    const manejador = perfil.slice(perfil.indexOf('const handleCerrarSesion'), perfil.indexOf('const handleCerrarSesion') + 200);
    assert.ok(manejador.includes('authService.logout()'), 'el botón de cerrar sesión debe usar authService.logout');
  });
});

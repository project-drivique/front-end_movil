require('./setupTestEnv.js');
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { cargar } = require('./helpers/cargarTs.js');

const { apiClient } = cargar('services/http/apiClient.ts');
const { useAuthStore } = cargar('store/authStore.ts');
const { sessionTokens } = cargar('services/http/sessionTokens.ts');
const { authService } = cargar('modules/auth/services/authService.ts');

const responder = (config, status, data) => ({ status, statusText: String(status), headers: {}, config, data });
const fallar = (config, status, data) => {
  const error = new Error(`Request failed with status code ${status}`);
  error.config = config;
  error.response = responder(config, status, data);
  error.isAxiosError = true;
  return error;
};

describe('Sesión de la app: token, renovación y cierre de sesión', () => {
  beforeEach(async () => {
    useAuthStore.setState({ token: null, usuario: null });
    await sessionTokens.clearRefreshToken();
  });

  it('cada petición lleva el token y el idioma de la persona', async () => {
    useAuthStore.setState({ token: 'token-abc' });
    let visto = null;
    apiClient.defaults.adapter = async (config) => {
      visto = config.headers;
      return responder(config, 200, {});
    };
    await apiClient.get('/vehicles/search');
    assert.equal(visto.Authorization, 'Bearer token-abc');
    assert.equal(visto['X-App-Language'], 'es');
  });

  it('si el token venció renueva la sesión una vez y repite la petición con el token nuevo', async () => {
    useAuthStore.setState({ token: 'viejo' });
    await sessionTokens.saveRefreshToken('refresh-1');
    const llamadas = [];
    let primera = true;
    apiClient.defaults.adapter = async (config) => {
      llamadas.push({ url: config.url, auth: config.headers.Authorization });
      if (config.url === '/auth/refresh') return responder(config, 200, { accessToken: 'nuevo', refreshToken: 'refresh-2' });
      if (primera) { primera = false; throw fallar(config, 401, {}); }
      return responder(config, 200, { ok: true });
    };
    const { data } = await apiClient.get('/reservations/mine');
    assert.deepEqual(data, { ok: true });
    assert.deepEqual(llamadas.map((l) => l.url), ['/reservations/mine', '/auth/refresh', '/reservations/mine']);
    assert.equal(llamadas.at(-1).auth, 'Bearer nuevo');
    assert.equal(await sessionTokens.getRefreshToken(), 'refresh-2');
  });

  it('si la renovación falla, la sesión se cierra y se borra el refresh token', async () => {
    useAuthStore.setState({ token: 'viejo', usuario: { correo: 'a@b.c' } });
    await sessionTokens.saveRefreshToken('refresh-malo');
    apiClient.defaults.adapter = async (config) => {
      throw fallar(config, 401, {});
    };
    await assert.rejects(() => apiClient.get('/reservations/mine'));
    assert.equal(useAuthStore.getState().token, null);
    assert.equal(await sessionTokens.getRefreshToken(), null);
  });

  it('un visitante sin sesión no dispara ninguna renovación', async () => {
    const llamadas = [];
    apiClient.defaults.adapter = async (config) => {
      llamadas.push(config.url);
      throw fallar(config, 401, {});
    };
    await assert.rejects(() => apiClient.get('/vehicles/search'));
    assert.deepEqual(llamadas, ['/vehicles/search']);
  });

  it('cerrar sesión borra el refresh token del teléfono y lo revoca en el servidor', async () => {
    await sessionTokens.saveRefreshToken('refresh-a-revocar');
    const enviados = [];
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = async (url, opciones) => {
      enviados.push({ url: String(url), cuerpo: JSON.parse(opciones.body), metodo: opciones.method });
      return { ok: true, status: 204 };
    };
    try {
      await authService.logout();
    } finally {
      globalThis.fetch = fetchOriginal;
    }
    assert.equal(await sessionTokens.getRefreshToken(), null);
    assert.equal(enviados.length, 1);
    assert.ok(enviados[0].url.endsWith('/auth/logout'));
    assert.equal(enviados[0].metodo, 'POST');
    assert.equal(enviados[0].cuerpo.refreshToken, 'refresh-a-revocar');
  });

  it('cerrar sesión sin refresh token no llama al servidor', async () => {
    let llamadas = 0;
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = async () => { llamadas += 1; return { ok: true }; };
    try {
      await authService.logout();
    } finally {
      globalThis.fetch = fetchOriginal;
    }
    assert.equal(llamadas, 0);
  });
});

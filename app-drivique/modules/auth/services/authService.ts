const BASE_URL = 'https://tu-api.com/api/v1';

export const authService = {
  async login(correo: string, contrasena: string) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
    if (!response.ok) throw new Error('Credenciales incorrectas');
    return response.json();
  },

  async registro(datos: object) {
    const response = await fetch(`${BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error en el registro');
    return response.json();
  },

  async recuperarContrasena(correo: string) {
    const response = await fetch(`${BASE_URL}/auth/recuperar-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo }),
    });
    if (!response.ok) throw new Error('Correo no registrado');
    return response.json();
  },

  async cambiarContrasena(
    token: string,
    datos: { contrasenaActual: string; nuevaContrasena: string },
  ) {
    const response = await fetch(`${BASE_URL}/auth/cambiar-contrasena`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.mensaje || 'No fue posible actualizar la contraseña');
    }
    return response.json();
  },
};

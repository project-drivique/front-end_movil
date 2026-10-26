// Token de un solo uso que entrega el captcha (Cloudflare Turnstile). El servidor lo valida al crear la reserva.
let token: string | null = null;
const listeners = new Set<() => void>();

export const captchaTokenStore = {
  set(value: string | null | undefined) {
    token = value || null;
  },
  get(): string | null {
    return token;
  },
  // Al usarse (con éxito o con error) el token ya no sirve: se limpia y el widget se reinicia solo
  consume(): string | null {
    const value = token;
    token = null;
    listeners.forEach((listener) => listener());
    return value;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

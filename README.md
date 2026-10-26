## Drivique — App móvil
> *Alquila fácil, conduce libre*

Aplicación móvil del sistema de alquiler de vehículos **Drivique**, desarrollada con **React Native + Expo**. También se exporta como web.

La documentación del proyecto (guías, pruebas de pago, arquitectura) vive en el repositorio **Documentation**
(`docs/06-mobile/`), no en este repositorio.

---

## Tecnologías

- React Native 0.86
- Expo ~57
- Expo Router — navegación por archivos
- TypeScript
- Zustand — estado global
- i18next — 5 idiomas (es, en, pt, br, fr)

---

## Instalación

```bash
git clone <url-del-repositorio>
cd front-end_movil/app-drivique
npm install
npm run start
```

## Scripts

```bash
npm run start       # Iniciar servidor Expo
npm run android     # Ejecutar en Android
npm run web         # Ejecutar en navegador
npm run lint        # Revisión de código
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL de la API (por defecto `http://localhost:8080/api/v1`) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Inicio de sesión con Google |
| `EXPO_PUBLIC_FACEBOOK_APP_ID` | Inicio de sesión con Facebook |

## Estructura

```text
app-drivique/
├── app/        # Pantallas (Expo Router)
├── modules/    # Módulos por dominio (auth, catálogo, reservas, perfil…)
├── components/ # Componentes reutilizables
├── services/   # Cliente HTTP
└── store/      # Estado global
```

---

## Equipo

| Nombre | Contacto |
|---|---|
| Laura Vanessa Pérez Perdomo | p.laurav2@gmail.com |
| Emily Sharith Amézquita Saavedra | sharithamezquita81@gmail.com |
| Danna Valentina Barrios Penagos | dannabarrios0820@gmail.com |

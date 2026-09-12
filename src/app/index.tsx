import { Redirect } from 'expo-router';

/**
 * Punto de entrada. Aquí se decidirá a dónde va el usuario al abrir la app:
 *
 *   sesión válida en SecureStore  → /(tabs)
 *   perfil de invitado local      → /(tabs)
 *   nada                          → /welcome
 *
 * Mientras no exista la capa de sesión, siempre entra por la bienvenida.
 */
export default function Index() {
  return <Redirect href="/welcome" />;
}

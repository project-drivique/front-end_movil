import { useOnboarding } from "@/modules/onboarding/hooks/use-onboarding";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { hasCompletedOnboarding, _hasHydrated: onboardingHydrated } = useOnboarding();
  const usuario = useAuthStore((s) => s.usuario);
  const authHydrated = useAuthStore((s) => s._hasHydrated);

  if (!onboardingHydrated || !authHydrated) return null;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (usuario) {
    return <Redirect href="/(tabs)/catalog" />;
  }

  return <Redirect href="/(auth)/login" />;
}


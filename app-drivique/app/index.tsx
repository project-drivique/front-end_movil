import { useOnboarding } from "@/modules/onboarding/hooks/use-onboarding";
import { Redirect } from "expo-router";

export default function Index() {
  const { hasCompletedOnboarding, _hasHydrated } = useOnboarding();

  if (!_hasHydrated) return null;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(auth)/login" />;
}

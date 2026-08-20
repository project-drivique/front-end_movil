import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import PagerView from "@/modules/onboarding/components/cross-pager";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboarding } from "@/modules/onboarding/hooks/use-onboarding";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import OnboardingNavigation from "@/modules/onboarding/components/navigation";
import OnboardingPagination from "@/modules/onboarding/components/pagination";
import OnboardingScreen1 from "@/modules/onboarding/screens/screen-1";
import OnboardingScreen2 from "@/modules/onboarding/screens/screen-2";
import OnboardingScreen3 from "@/modules/onboarding/screens/screen-3";
import OnboardingScreen4 from "@/modules/onboarding/screens/screen-4";
import OnboardingScreen5 from "@/modules/onboarding/screens/screen-5";

const SCREENS = [
  OnboardingScreen1,
  OnboardingScreen2,
  OnboardingScreen3,
  OnboardingScreen4,
  OnboardingScreen5,
];

export default function OnboardingFlow() {
  const c = useTemaColores();
  const { page } = useLocalSearchParams<{ page?: string }>();
  const initialPage = Math.min(
    Math.max(Number(page) || 0, 0),
    SCREENS.length - 1,
  );
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();

  const goToLogin = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (currentPage < SCREENS.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      completeOnboarding();
      router.replace("/(auth)/register");
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  };

  const isLast = currentPage === SCREENS.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={c.oscuro ? "light-content" : "dark-content"} backgroundColor={c.bg} />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={initialPage}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {SCREENS.map((Screen, i) => (
          <View key={i} style={styles.page}>
            <Screen />
          </View>
        ))}
      </PagerView>

      {!isLast && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: c.bg, borderTopColor: c.borderLight }]}>
          <OnboardingPagination total={SCREENS.length} current={currentPage} />
          <OnboardingNavigation
            currentPage={currentPage}
            totalPages={SCREENS.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={goToLogin}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});





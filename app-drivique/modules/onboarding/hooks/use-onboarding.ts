import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
}

const getInitialOnboarding = (): { hasCompletedOnboarding: boolean; currentStep: number; _hasHydrated: boolean } => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem("onboarding-storage-v7");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
          return {
            hasCompletedOnboarding: Boolean(parsed.state.hasCompletedOnboarding),
            currentStep: Number(parsed.state.currentStep) || 0,
            _hasHydrated: true,
          };
        }
      }
    } catch {
      // Ignorar error
    }
  }
  return {
    hasCompletedOnboarding: false,
    currentStep: 0,
    _hasHydrated: false,
  };
};

const initialOnboarding = getInitialOnboarding();

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: initialOnboarding.hasCompletedOnboarding,
      _hasHydrated: initialOnboarding._hasHydrated,
      currentStep: initialOnboarding.currentStep,
      setCurrentStep: (step: number) => set({ currentStep: step }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, currentStep: 0 }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "onboarding-storage-v7",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);


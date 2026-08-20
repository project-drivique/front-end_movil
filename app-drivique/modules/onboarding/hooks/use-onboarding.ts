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

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      _hasHydrated: false,
      currentStep: 0,
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

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  role: string; // e.g., "Particulier", "Gérant", "Directeur"
  company: string; // Optional company name
}

interface UserProfileState {
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (data: Partial<UserProfile>) => void;
  resetProfile: () => void;
  setLoaded: (loaded: boolean) => void;
}

const defaultProfile: UserProfile = {
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "France",
  phone: "",
  role: "Particulier",
  company: "",
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: { ...defaultProfile },
      isLoaded: false,

      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      resetProfile: () =>
        set({
          profile: { ...defaultProfile },
        }),

      setLoaded: (loaded) => set({ isLoaded: loaded }),
    }),
    {
      name: "juridique-user-profile",
      onRehydrateStorage: () => (state) => {
        state?.setLoaded(true);
      },
    }
  )
);

// Helper to format full address
export function formatFullAddress(profile: UserProfile): string {
  const parts = [profile.address];
  if (profile.postalCode || profile.city) {
    parts.push(`${profile.postalCode} ${profile.city}`.trim());
  }
  if (profile.country && profile.country !== "France") {
    parts.push(profile.country);
  }
  return parts.filter(Boolean).join("\n");
}

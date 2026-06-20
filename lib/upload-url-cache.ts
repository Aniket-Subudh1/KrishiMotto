import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@krishimotto/asset-public-urls';

const publicUrlByAssetKey = new Map<string, string>();
let hydratePromise: Promise<void> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

async function hydrateCache() {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [assetKey, publicUrl] of Object.entries(parsed)) {
        if (assetKey && publicUrl) {
          publicUrlByAssetKey.set(assetKey, publicUrl);
        }
      }
    } catch {
      // Ignore corrupt cache entries.
    }
  })();

  return hydratePromise;
}

function schedulePersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(() => {
    persistTimer = null;
    const entries = Object.fromEntries(publicUrlByAssetKey.entries());
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, 250);
}

export async function ensureUploadUrlCacheHydrated() {
  await hydrateCache();
}

export function rememberAssetPublicUrl(assetKey: string, publicUrl: string) {
  publicUrlByAssetKey.set(assetKey, publicUrl);
  schedulePersist();
}

export function getAssetPublicUrl(assetKey?: string | null): string | undefined {
  if (!assetKey) {
    return undefined;
  }

  return publicUrlByAssetKey.get(assetKey);
}

export function resolveProfilePhotoUrl(profile?: {
  profilePicKey?: string | null;
  profilePicUrl?: string | null;
}): string | undefined {
  if (!profile) {
    return undefined;
  }

  if (profile.profilePicUrl) {
    if (profile.profilePicKey) {
      rememberAssetPublicUrl(profile.profilePicKey, profile.profilePicUrl);
    }
    return profile.profilePicUrl;
  }

  return getAssetPublicUrl(profile.profilePicKey);
}

export function withResolvedProfilePhoto<T extends {
  profilePicKey?: string | null;
  profilePicUrl?: string | null;
}>(profile: T): T {
  const profilePicUrl = resolveProfilePhotoUrl(profile);
  return profilePicUrl ? { ...profile, profilePicUrl } : profile;
}

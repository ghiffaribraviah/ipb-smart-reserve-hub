const accessTokenKey = 'ipb_srh_access_token';
let memoryAccessToken: string | null = null;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window.localStorage;

    if (
      typeof storage.getItem !== 'function' ||
      typeof storage.setItem !== 'function' ||
      typeof storage.removeItem !== 'function'
    ) {
      return null;
    }

    return storage;
  } catch {
    return null;
  }
}

export const authSession = {
  getAccessToken(): string | null {
    try {
      return getStorage()?.getItem(accessTokenKey) ?? memoryAccessToken;
    } catch {
      return memoryAccessToken;
    }
  },

  setAccessToken(accessToken: string): void {
    memoryAccessToken = accessToken;

    try {
      getStorage()?.setItem(accessTokenKey, accessToken);
    } catch {
      // In-memory storage keeps tests and storage-restricted browsers usable.
    }
  },

  clearAccessToken(): void {
    memoryAccessToken = null;

    try {
      getStorage()?.removeItem(accessTokenKey);
    } catch {
      // In-memory storage was already cleared.
    }
  },
};

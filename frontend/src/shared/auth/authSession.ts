const accessTokenKey = 'ipb_srh_access_token';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export const authSession = {
  getAccessToken(): string | null {
    return getStorage()?.getItem(accessTokenKey) ?? null;
  },

  setAccessToken(accessToken: string): void {
    getStorage()?.setItem(accessTokenKey, accessToken);
  },

  clearAccessToken(): void {
    getStorage()?.removeItem(accessTokenKey);
  },
};

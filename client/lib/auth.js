const TOKEN_KEY = 'nex_auth_token';
const USER_KEY = 'nex_auth_user';

export const saveAuth = (token, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getAuthUser = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


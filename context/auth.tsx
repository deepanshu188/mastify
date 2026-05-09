import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'auth', encryptionKey: 'mastify-auth-v1' });

type AuthState = {
  token: string | null;
  instance: string | null;
  avatar: string | null;
};

type AuthContextValue = {
  auth: AuthState;
  signIn: (instance: string, token: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): AuthState {
  return {
    token: storage.getString('token') ?? null,
    instance: storage.getString('instance') ?? null,
    avatar: storage.getString('avatar') ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const segments = useSegments();
  const router = useRouter();

  const navigateRef = useRef<() => void>(null);
  navigateRef.current = () => {
    const inAuthGroup = segments[0] === '(tabs)';
    if (!auth.token && inAuthGroup) {
      router.replace('/login');
    } else if (auth.token && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    navigateRef.current?.();
  }, [auth.token, segments]);

  useEffect(() => {
    if (!auth.token || !auth.instance || auth.avatar) return;
    fetch(`https://${auth.instance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((account) => {
        const avatar = account?.avatar ?? null;
        if (avatar) {
          storage.set('avatar', avatar);
          setAuth((prev) => ({ ...prev, avatar }));
        }
      })
      .catch(() => {});
  }, [auth.token, auth.instance]);

  async function signIn(instance: string, token: string) {
    storage.set('token', token);
    storage.set('instance', instance);
    let avatar: string | null = null;
    try {
      const res = await fetch(`https://${instance}/api/v1/accounts/verify_credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const account = await res.json();
        avatar = account.avatar ?? null;
        if (avatar) storage.set('avatar', avatar);
      }
    } catch {}
    setAuth({ token, instance, avatar });
  }

  function signOut() {
    storage.remove('token');
    storage.remove('instance');
    storage.remove('avatar');
    setAuth({ token: null, instance: null, avatar: null });
  }

  return <AuthContext.Provider value={{ auth, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

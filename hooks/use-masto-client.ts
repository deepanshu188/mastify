import { useAuth } from '@/context/auth';
import { createRestAPIClient, mastodon } from 'masto';

export function useMastoClient(): mastodon.rest.Client | null {
  const { auth } = useAuth();
  if (!auth.token || !auth.instance) return null;
  return createRestAPIClient({
    url: `https://${auth.instance}`,
    accessToken: auth.token,
  });
}

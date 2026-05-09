import * as WebBrowser from 'expo-web-browser';
import { Redirect } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  return <Redirect href="/login" />;
}

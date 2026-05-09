import { NAME, VERSION } from '@/constants/app';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createOAuthAPIClient, createRestAPIClient } from 'masto';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useAuth } from '@/context/auth';

const SCOPES = 'read write follow push';

export default function LoginScreen() {
  const [instance, setInstance] = useState('androiddev.social');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleLogin() {
    const host = instance.trim().replace(/^https?:\/\//, '');
    if (!host) return;

    const redirectUri = Linking.createURL('oauth');
    Alert.alert('Debug', `Redirect URI: ${redirectUri}`);

    setLoading(true);
    try {
      const rest = createRestAPIClient({ url: `https://${host}` });

      const app = await rest.v1.apps.create({
        clientName: NAME,
        redirectUris: redirectUri,
        scopes: SCOPES,
        website: 'https://mastify.app',
      });

      const authUrl =
        `https://${host}/oauth/authorize?` +
        new URLSearchParams({
          client_id: app.clientId!,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: SCOPES,
        }).toString();

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      Alert.alert('Debug', `Result type: ${result.type}\n${JSON.stringify(result)}`);

      if (result.type !== 'success') {
        setLoading(false);
        return;
      }

      const code = new URL(result.url).searchParams.get('code');
      if (!code) throw new Error('No authorization code in redirect');

      const oauth = createOAuthAPIClient({ url: `https://${host}` });
      const token = await oauth.token.create({
        grantType: 'authorization_code',
        clientId: app.clientId!,
        clientSecret: app.clientSecret!,
        redirectUri: redirectUri,
        code,
        scope: SCOPES,
      });

      signIn(host, token.accessToken);
    } catch (err) {
      Alert.alert('Login failed', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* decorative blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* logo + branding */}
        <View style={styles.brandSection}>
          <Image
            source={require('@/assets/logo.png')}
            style={styles.icon}
            contentFit="contain"
          />
          <Text style={styles.appName}>Mastify</Text>
          <Text style={styles.tagline}>A feature-rich Mastodon Android client</Text>
        </View>

        {/* login form */}
        <View style={styles.formSection}>
          <View style={styles.inputRow}>
            <MaterialIcons name="link" size={20} color="#9BA1A6" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={instance}
              onChangeText={setInstance}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="Instance URL"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Log in {instance && 'to'} {instance}</Text>
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* version footer */}
      <View style={styles.footer}>
        <Text style={styles.footerAppName}>{NAME}</Text>
        <Text style={styles.footerVersion}>v{VERSION}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.85,
  },
  blobTopLeft: {
    width: 220,
    height: 220,
    backgroundColor: '#F4758B',
    top: -80,
    left: -60,
  },
  blobTopRight: {
    width: 180,
    height: 180,
    backgroundColor: '#5B6EE8',
    top: -40,
    right: -50,
  },
  blobBottomRight: {
    width: 140,
    height: 140,
    backgroundColor: '#5DC96E',
    bottom: 60,
    right: -40,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 40,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#11181C',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
  },
  formSection: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#11181C',
  },
  button: {
    height: 48,
    backgroundColor: '#4B7FD6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 2,
  },
  footerAppName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#687076',
  },
  footerVersion: {
    fontSize: 12,
    color: '#9BA1A6',
  },
});

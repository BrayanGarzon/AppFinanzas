import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { User } from '@supabase/supabase-js';

import Colors from '@/constants/Colors';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function SupabaseAccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [permissionCheck, setPermissionCheck] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setUser(data.session?.user ?? null); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !user) { setPermissionCheck(''); return; }
    let alive = true;
    setPermissionCheck('Verificando acceso privado…');
    supabase.from('profiles').select('id').eq('id', user.id).maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      setPermissionCheck(error ? `Falló la prueba RLS: ${error.message}` : data ? 'RLS verificado: solo se ve tu perfil.' : 'Sesión activa, pero aún no aparece el perfil. Aplica la migración SQL.');
    });
    return () => { alive = false; };
  }, [user]);

  const authenticate = async (mode: 'sign-in' | 'sign-up') => {
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const result = mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: email.split('@')[0] } } });
      if (result.error) throw result.error;
      if (mode === 'sign-up' && !result.data.session) setMessage('Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesión.');
      else setMessage(mode === 'sign-up' ? 'Cuenta creada e iniciada.' : 'Sesión iniciada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo completar el acceso.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : 'Sesión cerrada.');
  };

  if (!isSupabaseConfigured || !supabase) {
    return <View style={styles.card}>
      <Text style={styles.heading}>Cuenta y sincronización</Text>
      <Text style={styles.body}>La app sigue funcionando localmente. Configura la URL y la clave publicable de Supabase en el archivo .env para habilitar la cuenta remota.</Text>
    </View>;
  }

  return <View style={styles.card}>
    <Text style={styles.heading}>Cuenta Supabase</Text>
    {user ? <>
      <Text style={styles.body}>Sesión activa como {user.email ?? 'usuario'}</Text>
      <Text style={styles.status}>{permissionCheck}</Text>
      <Pressable style={styles.secondaryButton} onPress={signOut}><Text style={styles.secondaryLabel}>Cerrar sesión</Text></Pressable>
    </> : <>
      <Text style={styles.body}>Inicia sesión o crea una cuenta para comprobar la conexión y el acceso privado.</Text>
      <TextInput accessibilityLabel="Correo electrónico" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Correo electrónico" placeholderTextColor={Colors.light.muted} style={styles.input} value={email} onChangeText={setEmail}/>
      <TextInput accessibilityLabel="Contraseña" autoCapitalize="none" autoComplete="new-password" secureTextEntry placeholder="Contraseña (mínimo 8 caracteres)" placeholderTextColor={Colors.light.muted} style={styles.input} value={password} onChangeText={setPassword}/>
      {busy ? <ActivityIndicator color={Colors.light.tint} style={styles.spinner}/> : <>
        <Pressable style={styles.primaryButton} onPress={() => authenticate('sign-in')}><Text style={styles.primaryLabel}>Iniciar sesión</Text></Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => authenticate('sign-up')}><Text style={styles.secondaryLabel}>Crear cuenta</Text></Pressable>
      </>}
    </>}
    {!!message && <Text accessibilityRole="alert" style={styles.status}>{message}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 18, padding: 16, marginTop: 16 },
  heading: { color: Colors.light.ink, fontSize: 15, fontWeight: '700' },
  body: { color: Colors.light.muted, fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 12 },
  input: { minHeight: 48, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 12, paddingHorizontal: 12, color: Colors.light.ink, fontSize: 13, marginBottom: 9, backgroundColor: Colors.light.background },
  primaryButton: { minHeight: 46, backgroundColor: Colors.light.tint, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryButton: { minHeight: 44, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondaryLabel: { color: Colors.light.ink, fontSize: 12, fontWeight: '600' },
  status: { color: Colors.light.inkSoft, fontSize: 11, lineHeight: 17, marginTop: 10 },
  spinner: { paddingVertical: 14 },
});

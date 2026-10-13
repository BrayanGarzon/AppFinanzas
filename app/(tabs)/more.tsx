import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import SupabaseAccountPanel from '@/components/SupabaseAccountPanel';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>POCKETFLOW</Text>
        <Text style={styles.title}>Más opciones</Text>
        <View style={styles.list}>
          {['Cuentas', 'Categorías', 'Deudas y cuotas', 'Metas de ahorro', 'Respaldo de datos'].map((item) => (
            <View key={item} style={styles.row}><Text style={styles.rowText}>{item}</Text><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.muted} size={15} /></View>
          ))}
        </View>
        <SupabaseAccountPanel />
        <Text style={styles.note}>Estas secciones se construirán en sus fases correspondientes.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.light.background }, content: { flex: 1, padding: 22, paddingTop: 18 }, kicker: { color: Colors.light.tint, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }, title: { color: Colors.light.ink, fontSize: 30, fontWeight: '700', marginTop: 7, marginBottom: 25 }, list: { backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 18, paddingHorizontal: 16 }, row: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: Colors.light.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, rowText: { color: Colors.light.ink, fontSize: 13, fontWeight: '600' }, note: { color: Colors.light.muted, fontSize: 10, textAlign: 'center', marginTop: 'auto', marginBottom: 12 } });

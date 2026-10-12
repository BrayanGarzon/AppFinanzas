import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>TU DINERO, EN ORDEN</Text>
        <Text style={styles.title}>Actividad</Text>
        <View style={styles.month}><Text style={styles.monthText}>Octubre 2026</Text><SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor={Colors.light.inkSoft} size={15} /></View>
        <View style={styles.empty}>
          <View style={styles.icon}><SymbolView name={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }} tintColor={Colors.light.tint} size={25} /></View>
          <Text style={styles.emptyTitle}>Tus movimientos aparecerán aquí</Text>
          <Text style={styles.emptyText}>Cuando registres ingresos y gastos podrás revisar el historial por mes y categoría.</Text>
        </View>
        <Text style={styles.note}>El historial local se implementa en la fase 04.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.light.background }, content: { padding: 22, paddingTop: 18, flexGrow: 1 }, kicker: { color: Colors.light.tint, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }, title: { color: Colors.light.ink, fontSize: 30, fontWeight: '700', marginTop: 7 }, month: { alignSelf: 'flex-start', flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 22 }, monthText: { color: Colors.light.ink, fontSize: 12, fontWeight: '600' }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, minHeight: 360 }, icon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.softGreen, marginBottom: 17 }, emptyTitle: { color: Colors.light.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' }, emptyText: { color: Colors.light.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 }, note: { color: Colors.light.muted, fontSize: 10, textAlign: 'center', marginBottom: 8 } });

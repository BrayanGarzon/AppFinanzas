import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

export default function BudgetsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.kicker}>PLANEA CON CALMA</Text>
        <Text style={styles.title}>Presupuesto</Text>
        <View style={styles.empty}>
          <View style={styles.icon}><SymbolView name={{ ios: 'chart.pie.fill', android: 'pie_chart', web: 'pie_chart' }} tintColor={Colors.light.tint} size={25} /></View>
          <Text style={styles.emptyTitle}>Un plan para cada peso</Text>
          <Text style={styles.emptyText}>Aquí podrás definir límites mensuales y ver cuánto llevas en cada categoría.</Text>
        </View>
        <Text style={styles.note}>Los presupuestos se habilitan en la fase 06.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.light.background }, content: { flex: 1, padding: 22, paddingTop: 18 }, kicker: { color: Colors.light.tint, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }, title: { color: Colors.light.ink, fontSize: 30, fontWeight: '700', marginTop: 7 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }, icon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.softGreen, marginBottom: 17 }, emptyTitle: { color: Colors.light.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' }, emptyText: { color: Colors.light.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 }, note: { color: Colors.light.muted, fontSize: 10, textAlign: 'center', marginBottom: 8 } });

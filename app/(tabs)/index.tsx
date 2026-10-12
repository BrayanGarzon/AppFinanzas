import { SymbolView } from 'expo-symbols';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { getFinanceDashboard } from '@/services/finance';
import type { StoredTransaction } from '@/types/finance';
import { formatCop } from '@/utils/money';

const displayMonth = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date()).toLocaleUpperCase('es-CO');

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<{ realBalanceCop: number; incomeCop: number; expenseCop: number }>({ realBalanceCop: 0, incomeCop: 0, expenseCop: 0 });
  const [recent, setRecent] = useState<StoredTransaction[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    getFinanceDashboard(db).then((data) => { if (active) { setSummary(data.summary); setRecent(data.recent); } }).catch(() => Alert.alert('Error', 'No se pudo cargar el resumen.'));
    return () => { active = false; };
  }, [db]));
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>{displayMonth}</Text>
            <Text style={styles.greeting}>Hola 👋</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Perfil" style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Saldo total</Text>
            <SymbolView name={{ ios: 'eye', android: 'visibility', web: 'visibility' }} tintColor="#CBE8D9" size={20} />
          </View>
          <Text style={styles.balanceValue}>{formatCop(summary.realBalanceCop)}</Text>
          <Text style={styles.balanceCaption}>COP · en todas tus cuentas</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceFooter}>
            <View style={styles.balanceMetric}>
              <Text style={styles.metricLabel}>Ingresos</Text>
              <Text style={styles.metricValue}>↗ {formatCop(summary.incomeCop)}</Text>
            </View>
            <View style={styles.metricSeparator} />
            <View style={styles.balanceMetric}>
              <Text style={styles.metricLabel}>Gastos</Text>
              <Text style={styles.metricValue}>↘ {formatCop(summary.expenseCop)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Accesos rápidos</Text></View>
        <View style={styles.quickActions}>
          <Link href={{ pathname: '/transaction/new', params: { type: 'expense' } }} asChild>
            <Pressable style={styles.quickAction}>
              <View style={[styles.actionIcon, styles.expenseIcon]}><SymbolView name={{ ios: 'arrow.up.right', android: 'arrow_upward', web: 'arrow_upward' }} tintColor={Colors.light.danger} size={20} /></View>
              <Text style={styles.actionLabel}>Agregar gasto</Text>
            </Pressable>
          </Link>
          <Link href={{ pathname: '/transaction/new', params: { type: 'income' } }} asChild>
            <Pressable style={styles.quickAction}>
              <View style={[styles.actionIcon, styles.incomeIcon]}><SymbolView name={{ ios: 'arrow.down.left', android: 'arrow_downward', web: 'arrow_downward' }} tintColor={Colors.light.tint} size={20} /></View>
              <Text style={styles.actionLabel}>Agregar ingreso</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.quickAction}>
            <View style={[styles.actionIcon, styles.transferIcon]}><SymbolView name={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }} tintColor={Colors.light.gold} size={20} /></View>
            <Text style={styles.actionLabel}>Transferir</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Actividad reciente</Text><Text style={styles.sectionSubtitle}>Tus últimos movimientos</Text></View>
          <Link href="/(tabs)/activity" asChild><Pressable><Text style={styles.seeAll}>Ver todo</Text></Pressable></Link>
        </View>
        <View style={styles.activityCard}>
          {recent.length === 0 ? <Text style={styles.emptyText}>Tus movimientos recientes aparecerán aquí.</Text> : recent.map((item, index) => (
            <Link key={item.id} href={{ pathname: '/transaction/new', params: { id: item.id } }} asChild><Pressable style={[styles.activityRow, index > 0 && styles.activityBorder]}>
              <View style={styles.activityIcon}><SymbolView name={{ ios: item.categorySymbol as never, android: item.kind === 'income' ? 'add_circle' : 'sell', web: item.kind === 'income' ? 'add_circle' : 'sell' }} tintColor={Colors.light.inkSoft} size={19} /></View>
              <View style={styles.activityDescription}><Text style={styles.activityTitle}>{item.description || item.categoryName}</Text><Text style={styles.activityDetail}>{item.date} · {item.categoryName}</Text></View>
              <Text style={[styles.activityAmount, item.kind === 'income' ? styles.incomeText : styles.expenseText]}>{item.kind === 'income' ? '+' : '−'} {formatCop(item.amountCop)}</Text>
            </Pressable></Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background }, content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  eyebrow: { color: Colors.light.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 }, greeting: { color: Colors.light.ink, fontSize: 27, fontWeight: '700', marginTop: 5 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.light.softGreen, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: Colors.light.tint, fontSize: 17, fontWeight: '700' },
  balanceCard: { backgroundColor: Colors.light.forest, borderRadius: 24, padding: 22, marginBottom: 28 }, balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#CBE8D9', fontSize: 13, fontWeight: '500' }, balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', letterSpacing: -0.7, marginTop: 10 }, balanceCaption: { color: '#CBE8D9', fontSize: 12, marginTop: 3 },
  balanceDivider: { height: 1, backgroundColor: '#FFFFFF2A', marginVertical: 19 }, balanceFooter: { flexDirection: 'row', alignItems: 'center' }, balanceMetric: { flex: 1 },
  metricLabel: { color: '#B8D6C8', fontSize: 11, marginBottom: 6 }, metricValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' }, metricSeparator: { width: 1, height: 34, backgroundColor: '#FFFFFF2A', marginHorizontal: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, sectionTitle: { color: Colors.light.ink, fontSize: 17, fontWeight: '700' }, sectionSubtitle: { color: Colors.light.muted, fontSize: 12, marginTop: 4 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }, quickAction: { width: '31%', minHeight: 94, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.light.border, paddingHorizontal: 5 },
  actionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }, expenseIcon: { backgroundColor: '#FCECE8' }, incomeIcon: { backgroundColor: Colors.light.softGreen }, transferIcon: { backgroundColor: '#FFF5DF' }, actionLabel: { color: Colors.light.ink, fontSize: 11, fontWeight: '600' },
  seeAll: { color: Colors.light.tint, fontSize: 12, fontWeight: '700' }, activityCard: { backgroundColor: Colors.light.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.light.border, paddingHorizontal: 15 }, emptyText: { color: Colors.light.muted, fontSize: 12, paddingVertical: 20 },
  activityRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center' }, activityBorder: { borderTopWidth: 1, borderTopColor: Colors.light.border }, activityIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityDescription: { flex: 1 }, activityTitle: { color: Colors.light.ink, fontSize: 13, fontWeight: '600' }, activityDetail: { color: Colors.light.muted, fontSize: 11, marginTop: 4 }, activityAmount: { fontSize: 12, fontWeight: '700' }, incomeText: { color: Colors.light.tint }, expenseText: { color: Colors.light.danger }, demoNote: { textAlign: 'center', color: Colors.light.muted, fontSize: 10, marginTop: 16 },
});

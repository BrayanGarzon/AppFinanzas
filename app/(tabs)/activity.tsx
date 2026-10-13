import { SymbolView } from 'expo-symbols';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { getCategories, getTransactions } from '@/services/finance';
import type { Category, StoredTransaction } from '@/types/finance';
import { getMonthTitle } from '@/utils/dates';
import { formatCop } from '@/utils/money';

export default function ActivityScreen() {
  const db = useSQLiteContext();
  const [month, setMonth] = useState(() => new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [items, setItems] = useState<StoredTransaction[]>([]);
  const refresh = useCallback(() => getTransactions(db, { month, categoryId }).then(setItems).catch(() => Alert.alert('Error', 'No se pudo cargar la actividad.')), [db, month, categoryId]);
  useEffect(() => { getCategories(db).then(setCategories); }, [db]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const moveMonth = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>TU DINERO, EN ORDEN</Text><Text style={styles.title}>Actividad</Text>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => moveMonth(-1)} style={styles.monthArrow}><SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} tintColor={Colors.light.inkSoft} size={15}/></Pressable>
          <Text style={styles.monthText}>{getMonthTitle(month)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => moveMonth(1)} style={styles.monthArrow}><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.inkSoft} size={15}/></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Pressable onPress={() => setCategoryId(undefined)} style={[styles.filter, !categoryId && styles.filterActive]}><Text style={[styles.filterText, !categoryId && styles.filterActiveText]}>Todas</Text></Pressable>
          {categories.map((category) => <Pressable key={category.id} onPress={() => setCategoryId(category.id === categoryId ? undefined : category.id)} style={[styles.filter, categoryId === category.id && styles.filterActive]}><Text style={[styles.filterText, categoryId === category.id && styles.filterActiveText]}>{category.name}</Text></Pressable>)}
        </ScrollView>
        {items.length === 0 ? <View style={styles.empty}><View style={styles.icon}><SymbolView name={{ ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' }} tintColor={Colors.light.tint} size={25}/></View><Text style={styles.emptyTitle}>Sin movimientos este mes</Text><Text style={styles.emptyText}>Agrega ingresos y gastos para consultar aquí tu historial.</Text></View> : <View style={styles.card}>
          {items.map((item, index) => <Link key={item.id} href={{ pathname: '/transaction/new', params: { id: item.id } }} asChild><Pressable style={StyleSheet.flatten([styles.row, index > 0 ? styles.rowBorder : undefined])}>
            <View style={[styles.itemIcon, { backgroundColor: item.kind === 'income' ? Colors.light.softGreen : '#FCECE8' }]}><SymbolView name={{ ios: item.categorySymbol as never, android: item.kind === 'income' ? 'add_circle' : 'sell', web: item.kind === 'income' ? 'add_circle' : 'sell' }} tintColor={item.kind === 'income' ? Colors.light.tint : Colors.light.danger} size={18}/></View>
            <View style={styles.description}><Text style={styles.itemTitle}>{item.description || item.categoryName}</Text><Text style={styles.itemDetail}>{item.date} · {item.categoryName}</Text></View>
            <Text style={[styles.amount, { color: item.kind === 'income' ? Colors.light.tint : Colors.light.danger }]}>{item.kind === 'income' ? '+' : '−'} {formatCop(item.amountCop)}</Text>
          </Pressable></Link>)}
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.light.background }, content: { padding: 22, paddingTop: 18, flexGrow: 1 }, kicker: { color: Colors.light.tint, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }, title: { color: Colors.light.ink, fontSize: 30, fontWeight: '700', marginTop: 7 }, monthRow: { alignSelf: 'flex-start', flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, marginTop: 22 }, monthArrow: { padding: 5 }, monthText: { color: Colors.light.ink, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }, filters: { gap: 7, paddingVertical: 15 }, filter: { borderRadius: 16, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, paddingHorizontal: 12, paddingVertical: 8 }, filterActive: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint }, filterText: { color: Colors.light.inkSoft, fontSize: 11 }, filterActiveText: { color: '#fff' }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, minHeight: 330 }, icon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.softGreen, marginBottom: 17 }, emptyTitle: { color: Colors.light.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' }, emptyText: { color: Colors.light.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 9 }, card: { backgroundColor: Colors.light.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.light.border, paddingHorizontal: 13 }, row: { minHeight: 70, flexDirection: 'row', alignItems: 'center' }, rowBorder: { borderTopWidth: 1, borderTopColor: Colors.light.border }, itemIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, description: { flex: 1 }, itemTitle: { color: Colors.light.ink, fontSize: 12, fontWeight: '600' }, itemDetail: { color: Colors.light.muted, fontSize: 10, marginTop: 4 }, amount: { fontSize: 11, fontWeight: '700' } });

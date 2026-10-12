import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

type TransactionType = 'expense' | 'income';

export default function NewTransactionScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();
  const [type, setType] = useState<TransactionType>(params.type === 'income' ? 'income' : 'expense');

  useEffect(() => setType(params.type === 'income' ? 'income' : 'expense'), [params.type]);

  const isIncome = type === 'income';
  const tint = isIncome ? Colors.light.tint : Colors.light.danger;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => router.back()} style={styles.close}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={Colors.light.ink} size={17} />
          </Pressable>
          <Text style={styles.headerTitle}>Nuevo movimiento</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.typeSwitch}>
            <Pressable accessibilityRole="button" onPress={() => setType('expense')} style={[styles.typeOption, !isIncome && styles.expenseSelected]}><Text style={[styles.typeLabel, !isIncome && styles.selectedLabel]}>Gasto</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => setType('income')} style={[styles.typeOption, isIncome && styles.incomeSelected]}><Text style={[styles.typeLabel, isIncome && styles.selectedLabel]}>Ingreso</Text></Pressable>
          </View>

          <View style={styles.amountBlock}>
            <Text style={styles.fieldLabel}>¿Cuánto?</Text>
            <View style={styles.amountInputRow}><Text style={[styles.currency, { color: tint }]}>$</Text><TextInput accessibilityLabel="Valor del movimiento" placeholder="0" placeholderTextColor="#AAB5AE" keyboardType="decimal-pad" style={[styles.amountInput, { color: tint }]} /></View>
            <Text style={styles.currencyCode}>PESOS COLOMBIANOS · COP</Text>
          </View>

          <View style={styles.fields}>
            <Text style={styles.fieldLabel}>Detalles</Text>
            <View style={styles.textField}><TextInput placeholder="Descripción" placeholderTextColor={Colors.light.muted} style={styles.textInput} /></View>
            <Pressable style={styles.selectField}><View style={styles.selectIcon}><SymbolView name={{ ios: isIncome ? 'tag.fill' : 'cart.fill', android: 'sell', web: 'sell' }} tintColor={tint} size={17} /></View><Text style={styles.selectText}>Categoría</Text><Text style={styles.selectValue}>Seleccionar</Text><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.muted} size={14} /></Pressable>
            <Pressable style={styles.selectField}><View style={[styles.selectIcon, styles.accountIcon]}><SymbolView name={{ ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' }} tintColor={Colors.light.tint} size={17} /></View><Text style={styles.selectText}>Cuenta</Text><Text style={styles.selectValue}>Seleccionar</Text><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.muted} size={14} /></Pressable>
            <Pressable style={styles.selectField}><View style={[styles.selectIcon, styles.dateIcon]}><SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={Colors.light.gold} size={17} /></View><Text style={styles.selectText}>Fecha</Text><Text style={styles.selectValue}>Hoy</Text><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.muted} size={14} /></Pressable>
          </View>

          <Pressable style={[styles.saveButton, { backgroundColor: tint }]} onPress={() => Alert.alert('Formulario de muestra', 'El guardado local se habilitará en la fase 04.')}>
            <Text style={styles.saveLabel}>Guardar {isIncome ? 'ingreso' : 'gasto'}</Text>
          </Pressable>
          <Text style={styles.demoNote}>Diseño de formulario · aún no guarda movimientos</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background }, header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.light.border }, close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.light.surface }, headerTitle: { color: Colors.light.ink, fontSize: 15, fontWeight: '700' }, headerSpacer: { width: 32 },
  content: { padding: 22, paddingBottom: 30 }, typeSwitch: { flexDirection: 'row', padding: 4, backgroundColor: '#E9EEEA', borderRadius: 14, marginBottom: 26 }, typeOption: { flex: 1, minHeight: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center' }, expenseSelected: { backgroundColor: Colors.light.danger }, incomeSelected: { backgroundColor: Colors.light.tint }, typeLabel: { color: Colors.light.muted, fontSize: 13, fontWeight: '700' }, selectedLabel: { color: '#FFFFFF' },
  amountBlock: { alignItems: 'center', paddingVertical: 19, borderRadius: 20, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface }, fieldLabel: { color: Colors.light.inkSoft, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 12 }, amountInputRow: { flexDirection: 'row', alignItems: 'center' }, currency: { fontSize: 34, fontWeight: '600', marginRight: 8 }, amountInput: { minWidth: 150, padding: 0, fontSize: 42, fontWeight: '700', textAlign: 'center' }, currencyCode: { color: Colors.light.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 7 },
  fields: { marginTop: 25 }, textField: { height: 54, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 14, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 10 }, textInput: { color: Colors.light.ink, fontSize: 13 }, selectField: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 14, marginBottom: 10 }, selectIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCECE8', marginRight: 11 }, accountIcon: { backgroundColor: Colors.light.softGreen }, dateIcon: { backgroundColor: '#FFF5DF' }, selectText: { color: Colors.light.ink, fontSize: 12, fontWeight: '600', flex: 1 }, selectValue: { color: Colors.light.muted, fontSize: 11, marginRight: 7 },
  saveButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 14 }, saveLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }, demoNote: { color: Colors.light.muted, fontSize: 10, textAlign: 'center', marginTop: 12 },
});

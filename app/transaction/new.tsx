import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { SymbolView } from 'expo-symbols';
import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { deleteTransaction, getCategories, getTransaction, saveTransaction } from '@/services/finance';
import type { Category } from '@/types/finance';
import { getLocalDateKey } from '@/utils/dates';
import { formatCop } from '@/utils/money';

const schema = z.object({
  kind: z.enum(['income', 'expense']),
  amount: z.string().trim().min(1, 'Ingresa un valor').refine((value) => /^\d+$/.test(value.replace(/[.\s]/g, '')), 'Usa pesos enteros'),
  description: z.string().trim().max(100, 'Máximo 100 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida'),
});
type FormValues = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [datePicker, setDatePicker] = useState(false);
  const editingId = typeof params.id === 'string' ? params.id : undefined;
  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind: params.type === 'income' ? 'income' : 'expense', amount: '', description: '', categoryId: '', date: getLocalDateKey() },
  });
  const type = watch('kind');
  const categoryId = watch('categoryId');
  const isIncome = type === 'income';
  const tint = isIncome ? Colors.light.tint : Colors.light.danger;
  const amountValue = watch('amount');
  const displayAmount = useMemo(() => {
    const digits = amountValue.replace(/\D/g, '');
    return digits ? new Intl.NumberFormat('es-CO').format(Number(digits)) : '';
  }, [amountValue]);

  useEffect(() => {
    getCategories(db, type).then(setCategories).catch(() => Alert.alert('Error', 'No se pudieron cargar las categorías.'));
  }, [db, type]);
  useEffect(() => {
    if (!editingId) return;
    getTransaction(db, editingId).then((item) => {
      if (item) reset({ kind: item.kind, amount: String(item.amountCop), description: item.description, categoryId: item.categoryId, date: item.date });
    }).catch(() => Alert.alert('Error', 'No se pudo cargar el movimiento.'));
  }, [db, editingId, reset]);
  useEffect(() => {
    if (!categories.some((category) => category.id === categoryId)) setValue('categoryId', categories[0]?.id ?? '');
  }, [categories, categoryId, setValue]);

  const submit = handleSubmit(async (values) => {
    const amountCop = Number(values.amount.replace(/[.\s]/g, ''));
    try {
      await saveTransaction(db, { id: editingId, kind: values.kind, categoryId: values.categoryId, amountCop, date: values.date, description: values.description });
      router.back();
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Inténtalo de nuevo.');
    }
  });
  const confirmDelete = () => {
    if (!editingId) return;
    Alert.alert('Eliminar movimiento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteTransaction(db, editingId); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => router.back()} style={styles.close}><SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={Colors.light.ink} size={17} /></Pressable>
          <Text style={styles.headerTitle}>{editingId ? 'Editar movimiento' : 'Nuevo movimiento'}</Text><View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!editingId && <View style={styles.typeSwitch}>
            {(['expense', 'income'] as const).map((kind) => <Pressable key={kind} accessibilityRole="button" onPress={() => { setValue('kind', kind); setValue('categoryId', ''); }} style={[styles.typeOption, type === kind && (kind === 'income' ? styles.incomeSelected : styles.expenseSelected)]}><Text style={[styles.typeLabel, type === kind && styles.selectedLabel]}>{kind === 'income' ? 'Ingreso' : 'Gasto'}</Text></Pressable>)}
          </View>}
          <View style={styles.amountBlock}>
            <Text style={styles.fieldLabel}>¿Cuánto?</Text>
            <View style={styles.amountInputRow}><Text style={[styles.currency, { color: tint }]}>$</Text><Controller control={control} name="amount" render={({ field: { onChange, ...field } }) => <TextInput {...field} accessibilityLabel="Valor del movimiento" placeholder="0" placeholderTextColor="#AAB5AE" keyboardType="number-pad" style={[styles.amountInput, { color: tint }]} value={displayAmount} onChangeText={(value) => onChange(value.replace(/\D/g, ''))} />}/></View>
            <Text style={styles.currencyCode}>PESOS COLOMBIANOS · COP</Text>{errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}
          </View>
          <View style={styles.fields}>
            <Text style={styles.fieldLabel}>Detalles</Text>
            <Controller control={control} name="description" render={({ field: { onChange, value } }) => <View style={styles.textField}><TextInput placeholder="Descripción (opcional)" placeholderTextColor={Colors.light.muted} style={styles.textInput} value={value} onChangeText={onChange} maxLength={100}/></View>}/>
            <Text style={styles.fieldLabel}>Categoría</Text>
            <View style={styles.categoryList}>{categories.map((category) => <Pressable accessibilityRole="button" key={category.id} onPress={() => setValue('categoryId', category.id)} style={[styles.categoryChip, category.id === categoryId && { borderColor: tint, backgroundColor: isIncome ? Colors.light.softGreen : '#FCECE8' }]}><Text style={[styles.categoryText, category.id === categoryId && { color: tint }]}>{category.name}</Text></Pressable>)}</View>
            {errors.categoryId && <Text style={styles.error}>{errors.categoryId.message}</Text>}
            <Controller control={control} name="date" render={({ field: { value, onChange } }) => <>
              <Pressable style={styles.selectField} onPress={() => setDatePicker(true)}><View style={[styles.selectIcon, styles.dateIcon]}><SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} tintColor={Colors.light.gold} size={17}/></View><Text style={styles.selectText}>Fecha</Text><Text style={styles.selectValue}>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))}</Text><SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={Colors.light.muted} size={14}/></Pressable>
              {datePicker && <DateTimePicker value={new Date(`${value}T12:00:00`)} mode="date" maximumDate={new Date()} onChange={(event, date) => { setDatePicker(Platform.OS === 'ios'); if (date && event.type !== 'dismissed') onChange(getLocalDateKey(date)); }}/ >}
            </>}/>
          </View>
          <Pressable disabled={isSubmitting} style={[styles.saveButton, { backgroundColor: tint, opacity: isSubmitting ? 0.6 : 1 }]} onPress={submit}><Text style={styles.saveLabel}>{editingId ? 'Guardar cambios' : `Guardar ${isIncome ? 'ingreso' : 'gasto'}`}</Text></Pressable>
          {editingId && <Pressable style={styles.deleteButton} onPress={confirmDelete}><Text style={styles.deleteText}>Eliminar movimiento</Text></Pressable>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background }, header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.light.border }, close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.light.surface }, headerTitle: { color: Colors.light.ink, fontSize: 15, fontWeight: '700' }, headerSpacer: { width: 32 },
  content: { padding: 22, paddingBottom: 30 }, typeSwitch: { flexDirection: 'row', padding: 4, backgroundColor: '#E9EEEA', borderRadius: 14, marginBottom: 26 }, typeOption: { flex: 1, minHeight: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center' }, expenseSelected: { backgroundColor: Colors.light.danger }, incomeSelected: { backgroundColor: Colors.light.tint }, typeLabel: { color: Colors.light.muted, fontSize: 13, fontWeight: '700' }, selectedLabel: { color: '#FFFFFF' },
  amountBlock: { alignItems: 'center', padding: 19, borderRadius: 20, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface }, fieldLabel: { color: Colors.light.inkSoft, fontSize: 12, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 12 }, amountInputRow: { flexDirection: 'row', alignItems: 'center' }, currency: { fontSize: 34, fontWeight: '600', marginRight: 8 }, amountInput: { minWidth: 150, padding: 0, fontSize: 42, fontWeight: '700', textAlign: 'center' }, currencyCode: { color: Colors.light.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 7 }, error: { color: Colors.light.danger, fontSize: 11, alignSelf: 'flex-start', marginTop: 6 },
  fields: { marginTop: 25 }, textField: { height: 54, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 14, paddingHorizontal: 15, justifyContent: 'center', marginBottom: 18 }, textInput: { color: Colors.light.ink, fontSize: 13 }, categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }, categoryChip: { borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }, categoryText: { color: Colors.light.inkSoft, fontSize: 11, fontWeight: '600' }, selectField: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, borderRadius: 14, marginBottom: 10 }, selectIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, dateIcon: { backgroundColor: '#FFF5DF' }, selectText: { color: Colors.light.ink, fontSize: 12, fontWeight: '600', flex: 1 }, selectValue: { color: Colors.light.muted, fontSize: 11, marginRight: 7 },
  saveButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 14 }, saveLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }, deleteButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 }, deleteText: { color: Colors.light.danger, fontSize: 13, fontWeight: '700' },
});

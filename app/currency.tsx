import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getExchangeRates, currencies } from '../utils/currencyApi';
import { useHistory } from '../hooks/useHistory';

export default function CurrencyScreen() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('MXN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({});
  const [lastUpdate, setLastUpdate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'from' | 'to'>('from');
  
  const { addHistory } = useHistory();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRates();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fromCurrency]);

  useEffect(() => {
    if (result) {
      Animated.sequence([
        Animated.timing(resultAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(resultAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const data = await getExchangeRates(fromCurrency);
      setRates(data.conversion_rates);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener las tasas de cambio');
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = useCallback(() => {
    try {
      if (!rates[toCurrency as keyof typeof rates]) {
        Alert.alert('Error', 'Tasa de cambio no disponible');
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Error', 'Ingresa un monto válido');
        return;
      }

      const rate = rates[toCurrency as keyof typeof rates] as number;
      const converted = numAmount * rate;
      const formattedResult = converted.toFixed(2);
      
      setResult(formattedResult);

      // Guardar en el historial
      addHistory({
        type: 'conversion',
        fromCurrency,
        toCurrency,
        amount: numAmount.toString(),
        convertedAmount: formattedResult,
        expression: `${numAmount} ${fromCurrency} → ${toCurrency}`,
        result: `${formattedResult} ${toCurrency}`,
      });

    } catch (error) {
      Alert.alert('Error', 'Error al convertir');
      console.error(error);
    }
  }, [amount, fromCurrency, toCurrency, rates, addHistory]);

  const handleSwapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('');
  }, [fromCurrency, toCurrency]);

  const openModal = (type: 'from' | 'to') => {
    setModalType(type);
    setModalVisible(true);
  };

  const selectCurrency = (code: string) => {
    if (modalType === 'from') {
      setFromCurrency(code);
    } else {
      setToCurrency(code);
    }
    setResult('');
    setModalVisible(false);
  };

  const CurrencySelector = ({ 
    label, 
    value, 
    onPress 
  }: { 
    label: string; 
    value: string; 
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.selectorButton} onPress={onPress}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorValueContainer}>
        <Text style={styles.selectorValue}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color="#a29bfe" />
      </View>
    </TouchableOpacity>
  );

  const renderCurrencyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Seleccionar {modalType === 'from' ? 'moneda origen' : 'moneda destino'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={Object.keys(currencies)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      (modalType === 'from' ? fromCurrency : toCurrency) === item && styles.modalItemSelected
                    ]}
                    onPress={() => selectCurrency(item)}
                  >
                    <Text style={styles.modalItemCode}>{item}</Text>
                    <Text style={styles.modalItemName}>
                      {currencies[item as keyof typeof currencies]}
                    </Text>
                    {(modalType === 'from' ? fromCurrency : toCurrency) === item && (
                      <Ionicons name="checkmark-circle" size={24} color="#6c5ce7" />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Conversor de Monedas</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Monto</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
                <Text style={styles.currencyLabel}>{fromCurrency}</Text>
              </View>
            </View>

            <View style={styles.currencyContainer}>
              <View style={styles.selectorWrapper}>
                <CurrencySelector 
                  label="De" 
                  value={fromCurrency} 
                  onPress={() => openModal('from')} 
                />
              </View>

              <TouchableOpacity 
                style={styles.swapButton} 
                onPress={handleSwapCurrencies}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#6c5ce7', '#a29bfe']}
                  style={styles.swapGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="swap-horizontal" size={24} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.selectorWrapper}>
                <CurrencySelector 
                  label="A" 
                  value={toCurrency} 
                  onPress={() => openModal('to')} 
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.convertButton} 
              onPress={convertCurrency}
              disabled={loading}
            >
              <LinearGradient
                colors={['#6c5ce7', '#a29bfe']}
                style={styles.convertGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.convertButtonText}>
                  {loading ? 'Cargando...' : 'Convertir'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {result !== '' && !loading && (
              <Animated.View 
                style={[
                  styles.resultContainer,
                  { transform: [{ scale: resultAnim }] }
                ]}
              >
                <Text style={styles.resultText}>
                  {amount} {fromCurrency} =
                </Text>
                <Text style={styles.resultValue}>
                  {result} {toCurrency}
                </Text>
              </Animated.View>
            )}

            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={fetchRates}
              disabled={loading}
            >
              <Ionicons name="refresh-outline" size={18} color="#a29bfe" />
              <Text style={styles.refreshText}>Actualizar tasas</Text>
            </TouchableOpacity>

            {lastUpdate && (
              <Text style={styles.updateText}>
                Última actualización: {lastUpdate}
              </Text>
            )}
          </Animated.View>

          <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
            <Text style={styles.infoTitle}>Tasas de cambio populares</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#6c5ce7" />
            ) : (
              Object.entries(rates)
                .slice(0, 5)
                .map(([code, rate]) => (
                  <View key={code} style={styles.rateItem}>
                    <Text style={styles.rateCode}>{code}</Text>
                    <Text style={styles.rateValue}>{(rate as number).toFixed(4)}</Text>
                  </View>
                ))
            )}
          </Animated.View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      {renderCurrencyModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    paddingVertical: 14,
  },
  currencyLabel: {
    color: '#a29bfe',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  selectorWrapper: {
    flex: 1,
  },
  selectorButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    padding: 12,
  },
  selectorLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 4,
  },
  selectorValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  swapButton: {
    marginHorizontal: 4,
  },
  swapGradient: {
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  convertGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resultContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  resultText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  resultValue: {
    color: '#a29bfe',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  refreshText: {
    color: '#a29bfe',
    fontSize: 14,
    marginLeft: 8,
  },
  updateText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.1)',
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rateCode: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  rateValue: {
    color: '#a29bfe',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 75,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  modalItemCode: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    width: 50,
  },
  modalItemName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
});
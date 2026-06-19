import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHistory } from '../hooks/useHistory';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = Math.min((width - 60) / 4, 80);

export default function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [newNumber, setNewNumber] = useState(true);
  const { addHistory } = useHistory();

  // Optimizado: sin animaciones para mejor rendimiento
  const handleNumber = useCallback((num: string) => {
    try {
      if (newNumber) {
        setDisplay(num);
        setNewNumber(false);
      } else {
        if (display.length < 15) {
          setDisplay(prev => prev + num);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error al ingresar el número');
      console.error(error);
    }
  }, [display, newNumber]);

  const handleOperator = useCallback((op: string) => {
    try {
      setExpression(display + ' ' + op + ' ');
      setNewNumber(true);
    } catch (error) {
      Alert.alert('Error', 'Error al ingresar el operador');
      console.error(error);
    }
  }, [display]);

  const handleCalculate = useCallback(() => {
    try {
      if (expression && !newNumber) {
        const fullExpression = expression + display;
        // Usar Function con más seguridad
        const result = Function('"use strict"; return (' + fullExpression + ')')();
        
        if (!isFinite(result)) {
          Alert.alert('Error', 'Operación inválida');
          return;
        }

        const formattedResult = Number.isInteger(result) 
          ? result.toString() 
          : result.toFixed(4);

        addHistory({
          type: 'calculation',
          expression: fullExpression,
          result: formattedResult,
        });
        
        setDisplay(formattedResult);
        setExpression('');
        setNewNumber(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al calcular');
      console.error(error);
      setDisplay('Error');
      setExpression('');
      setNewNumber(true);
    }
  }, [expression, display, addHistory, newNumber]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  }, [display]);

  const renderButton = useCallback((label: string, onPress: () => void, type: 'number' | 'operator' | 'function' | 'equals' = 'number') => {
    const getButtonStyle = () => {
      switch(type) {
        case 'operator':
          return styles.operatorButton;
        case 'function':
          return styles.functionButton;
        case 'equals':
          return styles.equalsButton;
        default:
          return styles.numberButton;
      }
    };

    const getTextStyle = () => {
      switch(type) {
        case 'operator':
          return styles.operatorText;
        case 'function':
          return styles.functionText;
        case 'equals':
          return styles.equalsText;
        default:
          return styles.numberText;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={[styles.buttonText, getTextStyle()]}>{label}</Text>
      </TouchableOpacity>
    );
  }, []);

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.displayContainer}>
          <Text style={styles.expressionText}>{expression}</Text>
          <Text style={styles.displayText} numberOfLines={1}>
            {display}
          </Text>
        </View>

        <View style={styles.buttonsGrid}>
          <View style={styles.row}>
            {renderButton('AC', handleClear, 'function')}
            {renderButton('⌫', handleDelete, 'function')}
            {renderButton('÷', () => handleOperator('/'), 'operator')}
          </View>

          <View style={styles.row}>
            {renderButton('7', () => handleNumber('7'))}
            {renderButton('8', () => handleNumber('8'))}
            {renderButton('9', () => handleNumber('9'))}
            {renderButton('×', () => handleOperator('*'), 'operator')}
          </View>

          <View style={styles.row}>
            {renderButton('4', () => handleNumber('4'))}
            {renderButton('5', () => handleNumber('5'))}
            {renderButton('6', () => handleNumber('6'))}
            {renderButton('-', () => handleOperator('-'), 'operator')}
          </View>

          <View style={styles.row}>
            {renderButton('1', () => handleNumber('1'))}
            {renderButton('2', () => handleNumber('2'))}
            {renderButton('3', () => handleNumber('3'))}
            {renderButton('+', () => handleOperator('+'), 'operator')}
          </View>

          <View style={styles.row}>
            {renderButton('0', () => handleNumber('0'), 'number')}
            {renderButton('.', () => handleNumber('.'), 'operator')}
            {renderButton('=', handleCalculate, 'equals')}
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </SafeAreaView>
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
  displayContainer: {
    flex: 0.8,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  expressionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 8,
  },
  displayText: {
    color: '#ffffff',
    fontSize: 48,
    textAlign: 'right',
    fontWeight: '200',
    letterSpacing: 1,
  },
  buttonsGrid: {
    flex: 2.4,
    paddingHorizontal: 12,
    paddingBottom: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 26,
    fontWeight: '500',
  },
  numberButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  numberText: {
    color: '#ffffff',
  },
  operatorButton: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
  },
  operatorText: {
    color: '#a29bfe',
  },
  functionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  functionText: {
    color: '#ff6b6b',
  },
  equalsButton: {
    backgroundColor: '#6c5ce7',
  },
  equalsText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 75,
  },
});
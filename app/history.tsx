import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistory, HistoryEntry } from '../hooks/useHistory';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

// Componente separado para cada item del historial
const HistoryItem = ({ item, index }: { item: HistoryEntry; index: number }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  const { getNumberInSystem } = useLanguage();

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const getIcon = () => {
    if (item.type === 'conversion') {
      return <Ionicons name="swap-horizontal" size={20} color="#6c5ce7" />;
    }
    return <Ionicons name="calculator" size={20} color="#6c5ce7" />;
  };

  const getDisplayText = () => {
    if (item.type === 'conversion') {
      return `${getNumberInSystem(item.amount || '')} ${item.fromCurrency} → ${getNumberInSystem(item.convertedAmount || '')} ${item.toCurrency}`;
    }
    return `${item.expression} = ${getNumberInSystem(item.result || '')}`;
  };

  return (
    <Animated.View
      style={[
        styles.historyItem,
        {
          opacity: itemAnim,
          transform: [
            {
              translateX: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(108, 92, 231, 0.1)', 'rgba(108, 92, 231, 0.02)']}
        style={styles.itemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.itemIconContainer}>
          {getIcon()}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.expressionText}>{getDisplayText()}</Text>
          <View style={styles.itemFooter}>
            <Text style={styles.timestampText}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            {item.type === 'conversion' && (
              <View style={styles.conversionBadge}>
                <Text style={styles.conversionBadgeText}>Conversión</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const { history, clearHistory } = useHistory();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClearAll = () => {
    Alert.alert(
      t('clearAll'),
      t('clearConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deleteAll'), onPress: clearHistory, style: 'destructive' },
      ]
    );
  };

  const renderHistoryItem = ({ item, index }: { item: HistoryEntry; index: number }) => (
    <HistoryItem item={item} index={index} />
  );

  const renderEmpty = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calculator-outline" size={80} color="rgba(108, 92, 231, 0.3)" />
      </View>
      <Text style={styles.emptyText}>{t('noHistory')}</Text>
      <Text style={styles.emptySubText}>
        {t('noHistorySub')}
      </Text>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.05)']}
              style={styles.clearGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
              <Text style={styles.clearText}>{t('clearAll')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  historyItem: {
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.1)',
  },
  itemGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  expressionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestampText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
  },
  conversionBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  conversionBadgeText: {
    color: '#a29bfe',
    fontSize: 9,
    fontWeight: '600',
  },
  clearButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  clearGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  clearText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 70,
  },
});
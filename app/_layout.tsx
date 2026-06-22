import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HistoryProvider } from '../hooks/useHistory';
import { LanguageProvider, useLanguage } from '../hooks/useLanguage';
import { View, StyleSheet, Platform, TouchableOpacity, Modal, FlatList, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react'; // ← IMPORTANTE: useState viene de react

// Componente interno con el selector de idioma
function LayoutContent() {
  const { t } = useTranslation();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false); // ← Ahora funciona
  const [navbarAnimation] = useState(new Animated.Value(1));
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    const toValue = isNavbarVisible ? 0 : 1;
    setIsNavbarVisible(!isNavbarVisible);
    
    Animated.spring(navbarAnimation, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getLanguageFlag = (code: string) => {
    const lang = availableLanguages.find(l => l.code === code);
    return lang ? lang.flag : '🌐';
  };

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6c5ce7',
          tabBarInactiveTintColor: '#b2bec3',
          tabBarStyle: {
            position: 'absolute',
            bottom: 12,
            left: 16,
            right: 16,
            height: 60,
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            borderRadius: 20,
            borderTopWidth: 0,
            paddingHorizontal: 8,
            paddingBottom: 4,
            transform: [
              {
                translateY: navbarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: navbarAnimation,
            ...Platform.select({
              ios: {
                shadowColor: '#6c5ce7',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              },
              android: {
                elevation: 12,
                borderWidth: 1,
                borderColor: 'rgba(108, 92, 231, 0.1)',
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: 1,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: '#0f0c29',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(108, 92, 231, 0.1)',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
          headerTintColor: '#6c5ce7',
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                style={styles.languageButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#6c5ce7', '#a29bfe']}
                  style={styles.languageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.languageFlag}>{getLanguageFlag(language)}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={toggleNavbar}
                style={styles.toggleButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(108, 92, 231, 0.3)', 'rgba(108, 92, 231, 0.1)']}
                  style={styles.toggleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name={isNavbarVisible ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#a29bfe" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        
        <Tabs.Screen
          name="calculator"
          options={{
            title: t('calculator'),
            tabBarIcon: ({ focused, color, size }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
                <Ionicons 
                  name={focused ? 'calculator' : 'calculator-outline'} 
                  size={focused ? 24 : size} 
                  color={color} 
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('history'),
            tabBarIcon: ({ focused, color, size }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
                <Ionicons 
                  name={focused ? 'list' : 'list-outline'} 
                  size={focused ? 24 : size} 
                  color={color} 
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="currency"
          options={{
            title: t('currency'),
            tabBarIcon: ({ focused, color, size }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
                <Ionicons 
                  name={focused ? 'cash' : 'cash-outline'} 
                  size={focused ? 24 : size} 
                  color={color} 
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
      </Tabs>

      {/* Modal para seleccionar idioma */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    language === item.code && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemFlag}>{item.flag}</Text>
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  {language === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#6c5ce7" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// Layout principal con providers
export default function RootLayout() {
  return (
    <HistoryProvider>
      <LanguageProvider>
        <LayoutContent />
      </LanguageProvider>
    </HistoryProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    width: 16,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#6c5ce7',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 8,
  },
  languageButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  languageGradient: {
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  languageFlag: {
    fontSize: 18,
  },
  toggleButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleGradient: {
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  modalItemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  modalItemName: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
});
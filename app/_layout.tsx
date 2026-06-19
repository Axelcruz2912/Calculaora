import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HistoryProvider } from '../hooks/useHistory';
import { View, StyleSheet, Platform } from 'react-native';

export default function RootLayout() {
  return (
    <HistoryProvider>
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
        }}
      >
        {/* Ocultar el index del navbar */}
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Esto oculta la pestaña
          }}
        />
        
        <Tabs.Screen
          name="calculator"
          options={{
            title: 'Calculadora',
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
            title: 'Historial',
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
            title: 'Monedas',
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
});
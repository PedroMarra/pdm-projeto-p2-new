import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext';

import LoginScreen from './src/screens/LoginScreen';
import ListScreen from './src/screens/ListScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#0A0A0A',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#666666',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'List') {
            iconName = 'list-outline';
          } else if (route.name === 'Summary') {
            iconName = 'pie-chart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="List" 
        component={ListScreen} 
        options={{ title: 'Movimentações' }} 
      />
      <Tab.Screen 
        name="Summary" 
        component={SummaryScreen} 
        options={{ title: 'Resumo' }} 
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <LoginScreen />;
  }

  return <MainNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppContent />
        </NavigationContainer>
      </TransactionProvider>
    </AuthProvider>
  );
}
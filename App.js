import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
       <AuthProvider>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
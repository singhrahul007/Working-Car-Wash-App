import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from './src/store';
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
       {/* <AuthProvider> */}
        <Provider store={store}>
           <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
      {/* </AuthProvider> */}
        </Provider>
         
    </GestureHandlerRootView>
  );
}
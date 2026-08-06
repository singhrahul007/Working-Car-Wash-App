import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import OtpScreen from '../screens/OtpScreen';
import ProductsScreen from '../screens/ProductsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ACServiceScreen from '../screens/ACServiceScreen';
import SofaCleaningScreen from '../screens/SofaCleaningScreen';
import CarpetCleaningScreen from '../screens/CarpetCleaningScreen';
import SupportScreen from '../screens/SupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import OffersScreen from '../screens/OffersScreen';
import SavedCardsScreen from '../screens/SavedCardsScreen';import PlumbingScreen from '../screens/PlumbingScreen';
// Imports for User Management (Make sure these files exist in the specified path)
// Alternative: Import from index file
import {
  WelcomeScreen,
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  GuestCheckoutScreen,
  OTPVerificationScreen,
  TwoFactorAuthScreen
} from '../screens/UserManagement';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CameraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Camera</Text>
      <Text>Camera features will appear here</Text>
    </View>
  );
}

// Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') {
            icon = '🏠';
          } else if (route.name === 'Orders') {
            icon = '📦';
          } else if (route.name === 'Cart') {
            icon = '🛒';
          } else if (route.name === 'Profile') {
            icon = '👤';
          } else if (route.name === 'Offers') {
            icon = '🎁';
          } else if (route.name === 'Wallet') {
            icon = '💰';
          }
          return <Text style={{ fontSize: 24 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="Wallet"  
        component={SavedCardsScreen}
        options={{ title: 'Wallet' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      {/* User Management Screens */}
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: true,
          title: 'Login',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: 'Sign Up',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Forgot Password',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="GuestCheckout" 
        component={GuestCheckoutScreen}
        options={{
          headerShown: true,
          title: 'Guest Checkout',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen}
        options={{
          headerShown: false,
          title: 'Verify OTP',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="TwoFactorAuth" 
        component={TwoFactorAuthScreen}
        options={{
          headerShown: true,
          title: 'Two-Factor Authentication',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      {/* Main App Screens */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={({ route }) => ({
          title: `Book ${(/** @type {any} */ (route.params))?.vehicle || 'Car'} Wash`,
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="Order"
        component={OrdersScreen}
        options={{
          title: 'My Bookings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{
          title: 'Verify OTP',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'Shop Products',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: 'Take Photos',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="ACService"
        component={ACServiceScreen}
        options={{
          title: 'AC Services',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="SofaCleaning"
        component={SofaCleaningScreen}
        options={{
          title: 'Sofa Cleaning',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="CarpetCleaning"
        component={CarpetCleaningScreen}
        options={{
          title: 'Carpet Cleaning',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Plumbing"
        component={PlumbingScreen}
        options={{
          title: 'Plumbing Services',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Help & Support',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="SavedCards" 
        component={SavedCardsScreen}
        options={{
          title: 'Saved Cards',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 16,
  },
});
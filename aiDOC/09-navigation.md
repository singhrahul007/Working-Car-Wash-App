# Navigation

## Overview
This document describes the navigation architecture for the Car Wash Application using React Navigation, ensuring seamless user flow and consistent navigation patterns throughout the app.

## Navigation Structure

### Main Navigation Stack
The application uses a tab-based navigation structure with the following main screens:

```
BottomTabNavigator
├── HomeStack
│   ├── HomeScreen
│   └── ServiceDetailsScreen
├── BookingStack
│   ├── BookingScreen
│   ├── ServiceSelectionScreen
│   └── BookingConfirmationScreen
├── CartStack
│   ├── CartScreen
│   └── PaymentScreen
├── OrdersStack
│   ├── OrdersScreen
│   └── OrderDetailsScreen
└── ProfileStack
    ├── ProfileScreen
    ├── SettingsScreen
    └── EditProfileScreen
```

## Navigation Setup

### Root Navigator
```javascript
// src/navigation/RootNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeStack from './HomeStack';
import BookingStack from './BookingStack';
import CartStack from './CartStack';
import OrdersStack from './OrdersStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Icon rendering logic
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Booking" component={BookingStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export default RootNavigator;
```

## Stack Navigators

### Home Stack
```javascript
// src/navigation/HomeStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';

const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServiceDetails" 
        component={ServiceDetailsScreen}
        options={{ title: 'Service Details' }}
      />
    </Stack.Navigator>
  );
}

export default HomeStack;
```

### Booking Stack
```javascript
// src/navigation/BookingStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BookingScreen from '../screens/BookingScreen';
import ServiceSelectionScreen from '../screens/ServiceSelectionScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';

const Stack = createStackNavigator();

function BookingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServiceSelection" 
        component={ServiceSelectionScreen}
        options={{ title: 'Select Service' }}
      />
      <Stack.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen}
        options={{ title: 'Confirm Booking' }}
      />
    </Stack.Navigator>
  );
}

export default BookingStack;
```

## Navigation Services

### Navigation Helper Functions
```javascript
// src/navigation/NavigationService.js
import { NavigationActions } from 'react-navigation';

let navigator;

function setTopLevelNavigator(navigatorRef) {
  navigator = navigatorRef;
}

function navigate(name, params) {
  navigator.dispatch(
    NavigationActions.navigate({
      routeName: name,
      params,
    })
  );
}

function goBack() {
  navigator.dispatch(NavigationActions.back());
}

export default {
  navigate,
  goBack,
  setTopLevelNavigator,
};
```

## Screen Components

### Home Screen
```javascript
// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <Text>{item.name}</Text>
      <Text>{item.description}</Text>
      <Button 
        title="Select Service" 
        onPress={() => navigation.navigate('ServiceDetails', { service: item })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Welcome to Car Wash App</Text>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

export default HomeScreen;
```

## Navigation Parameters

### Passing Data Between Screens
```javascript
// Navigating with parameters
navigation.navigate('BookingConfirmation', {
  bookingId: '123',
  service: selectedService,
  date: selectedDate,
});

// Receiving parameters
const { bookingId, service } = route.params;
```

## Navigation Events

### Handling Screen Focus
```javascript
// src/screens/OrdersScreen.js
import React, { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

function OrdersScreen() {
  useFocusEffect(
    React.useCallback(() => {
      // Refresh data when screen comes into focus
      fetchUserBookings();
    }, [])
  );

  return <View>Orders Screen</View>;
}
```

## Best Practices

### Navigation Patterns
1. **Consistent Header Titles**: Use descriptive titles that match the screen content
2. **Tab Navigation**: Keep frequently used screens accessible via bottom tabs
3. **Stack Navigation**: Use for detailed workflows and multi-step processes
4. **Deep Linking**: Support external navigation to specific app screens

### Performance Optimization
1. **Lazy Loading**: Load screens only when needed
2. **Preload Critical Data**: Fetch essential data before navigating
3. **Optimize Screen Transitions**: Use appropriate transition animations
4. **Memory Management**: Clean up resources when leaving screens

### Error Handling
1. **Route Validation**: Validate navigation parameters before use
2. **Fallback Navigation**: Provide default routes for missing destinations
3. **Error Boundaries**: Handle navigation errors gracefully
4. **User Feedback**: Inform users about navigation failures

## Testing Navigation

### Unit Tests for Navigation
```javascript
// src/__tests__/navigation.test.js
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '../navigation/RootNavigator';

describe('Navigation', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    
    expect(toJSON).not.toBeNull();
  });
});
```
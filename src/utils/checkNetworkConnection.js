import { Alert } from "react-native";
import NetInfo from '@react-native-community/netinfo';

export const checkNetworkConnection = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              // For React Native, you might need a package to open settings
              // Linking.openSettings() if using expo
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return false;
    }
    return true;
  };
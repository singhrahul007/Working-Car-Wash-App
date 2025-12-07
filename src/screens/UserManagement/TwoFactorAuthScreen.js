// src/screens/UserManagement/TwoFactorAuthScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TwoFactorAuthScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('authenticator'); // 'authenticator' or 'sms'
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@carwash_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Check if 2FA is already enabled
        setTwoFactorEnabled(parsedUser.twoFactorEnabled || false);
        setSelectedMethod(parsedUser.twoFactorMethod || 'authenticator');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('@carwash_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  };

  const toggleTwoFactor = async (value) => {
    if (value) {
      // Enable 2FA
      Alert.alert(
        'Enable Two-Factor Authentication',
        `Are you sure you want to enable two-factor authentication using ${selectedMethod === 'authenticator' ? 'Google Authenticator' : 'SMS'}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setTwoFactorEnabled(false) },
          {
            text: 'Enable',
            onPress: async () => {
              setLoading(true);
              try {
                // Generate mock backup codes
                const codes = Array.from({ length: 8 }, () => 
                  Math.floor(100000 + Math.random() * 900000).toString()
                );
                setBackupCodes(codes);

                // Generate mock QR code URL (in real app, this would come from backend)
                const mockQrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + 
                  encodeURIComponent(`otpauth://totp/WashExpress:${user?.email || 'user'}?secret=JBSWY3DPEHPK3PXP&issuer=WashExpress`);
                
                setQrCodeUrl(mockQrUrl);

                // Update user data
                const updatedUser = {
                  ...user,
                  twoFactorEnabled: true,
                  twoFactorMethod: selectedMethod,
                  backupCodes: codes,
                  twoFactorSetupDate: new Date().toISOString(),
                };

                await saveUserData(updatedUser);
                Alert.alert(
                  'Success', 
                  'Two-factor authentication has been enabled. Please save your backup codes!'
                );
              } catch (error) {
                console.error('Error enabling 2FA:', error);
                Alert.alert('Error', 'Failed to enable two-factor authentication.');
                setTwoFactorEnabled(false);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } else {
      // Disable 2FA
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              try {
                const updatedUser = { ...user };
                delete updatedUser.twoFactorEnabled;
                delete updatedUser.twoFactorMethod;
                delete updatedUser.backupCodes;
                delete updatedUser.twoFactorSetupDate;
                
                await saveUserData(updatedUser);
                setTwoFactorEnabled(false);
                setBackupCodes([]);
                setQrCodeUrl(null);
                Alert.alert('Success', 'Two-factor authentication has been disabled.');
              } catch (error) {
                console.error('Error disabling 2FA:', error);
                Alert.alert('Error', 'Failed to disable two-factor authentication.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  const handleMethodSelect = (method) => {
    if (twoFactorEnabled) {
      Alert.alert(
        'Change Method',
        'You need to disable two-factor authentication first to change the method.',
        [{ text: 'OK' }]
      );
    } else {
      setSelectedMethod(method);
    }
  };

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      const codesText = backupCodes.join('\n');
      Alert.alert(
        'Backup Codes',
        'These codes can be used if you lose access to your authenticator app. Save them in a secure place:\n\n' + codesText,
        [
          { text: 'OK' },
          { text: 'Copy', onPress: () => {
            // In real app, use Clipboard from react-native
            Alert.alert('Copied', 'Backup codes copied to clipboard (mock).');
          }}
        ]
      );
    }
  };

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <MaterialCommunityIcons 
              name={twoFactorEnabled ? "shield-check" : "shield-alert"} 
              size={48} 
              color={twoFactorEnabled ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={styles.statusTitle}>
              {twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
            </Text>
            <Text style={styles.statusDescription}>
              {twoFactorEnabled 
                ? 'Your account is protected with two-factor authentication.'
                : 'Add an extra layer of security to your account.'
              }
            </Text>
          </View>

          {/* Toggle Switch */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleHeader}>
              <Text style={styles.toggleTitle}>Two-Factor Authentication</Text>
              <Switch
                value={twoFactorEnabled}
                onValueChange={toggleTwoFactor}
                trackColor={{ false: '#D1D5DB', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
                disabled={loading}
              />
            </View>
            <Text style={styles.toggleDescription}>
              When enabled, you'll need to enter a verification code from your authenticator app or SMS when signing in.
            </Text>
          </View>

          {/* Method Selection */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Authentication Method</Text>
            
            <TouchableOpacity 
              style={[
                styles.methodCard,
                selectedMethod === 'authenticator' && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect('authenticator')}
              disabled={twoFactorEnabled || loading}
            >
              <View style={styles.methodIconContainer}>
                <MaterialCommunityIcons name="cellphone-key" size={24} color="#2196F3" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Authenticator App</Text>
                <Text style={styles.methodDescription}>
                  Use an app like Google Authenticator or Authy
                </Text>
              </View>
              {selectedMethod === 'authenticator' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.methodCard,
                selectedMethod === 'sms' && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect('sms')}
              disabled={twoFactorEnabled || loading}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons name="chatbubble" size={24} color="#2196F3" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>SMS Text Message</Text>
                <Text style={styles.methodDescription}>
                  Receive verification codes via SMS
                </Text>
              </View>
              {selectedMethod === 'sms' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>

          {/* QR Code Section (if enabled with authenticator) */}
          {twoFactorEnabled && selectedMethod === 'authenticator' && qrCodeUrl && (
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Setup Instructions</Text>
              <Text style={styles.instructionText}>
                1. Install Google Authenticator or similar app
              </Text>
              <Text style={styles.instructionText}>
                2. Scan this QR code with your app
              </Text>
              
              <View style={styles.qrContainer}>
                <Image 
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.instructionText}>
                3. Enter the 6-digit code from the app to verify
              </Text>
              
              <View style={styles.codeInputRow}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View key={index} style={styles.codeInputPlaceholder}>
                    <Text style={styles.codeInputText}>•</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Backup Codes Section */}
          {twoFactorEnabled && backupCodes.length > 0 && (
            <View style={styles.backupSection}>
              <View style={styles.backupHeader}>
                <MaterialCommunityIcons name="key-chain" size={20} color="#FF9800" />
                <Text style={styles.backupTitle}>Backup Codes</Text>
              </View>
              <Text style={styles.backupDescription}>
                Save these backup codes in a safe place. Each code can be used once if you lose access to your authentication method.
              </Text>
              
              <View style={styles.codesGrid}>
                {backupCodes.map((code, index) => (
                  <View key={index} style={styles.codeBox}>
                    <Text style={styles.codeText}>{code}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={copyBackupCodes}
              >
                <Ionicons name="copy-outline" size={20} color="#2196F3" />
                <Text style={styles.copyButtonText}>Save Backup Codes</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How Two-Factor Authentication Works</Text>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Adds an extra layer of security beyond just your password
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Required for all new sign-ins on unrecognized devices
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="notifications" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                You'll receive a notification whenever someone tries to sign in
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  toggleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  methodsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  methodCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F9F0',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  qrSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  codeInputPlaceholder: {
    width: 40,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeInputText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backupSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  backupDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1F2937',
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default TwoFactorAuthScreen;
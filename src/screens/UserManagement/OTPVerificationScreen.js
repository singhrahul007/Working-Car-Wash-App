// src/screens/UserManagement/OTPVerificationScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { type, value, flow = 'signup' } = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    startTimer();
  }, []);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Mock OTP verification - for demo only
  const verifyOTP = async (otpCode) => {
    // In real app, this would call your backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, accept any 6-digit code
        resolve(otpCode.length === 6);
      }, 1500);
    });
  };

  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('@carwash_user', JSON.stringify(userData));
      await AsyncStorage.setItem('@carwash_token', 'mock_token_' + Date.now());
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const isValid = await verifyOTP(otpCode);
      
      if (isValid) {
        // Mock user data based on flow
        let userData = {};
        
        if (flow === 'login') {
          userData = {
            id: '1',
            name: value.includes('@') ? value.split('@')[0] : 'User',
            email: value.includes('@') ? value : null,
            phone: !value.includes('@') ? value : null,
            isLoggedIn: true,
            joinedDate: new Date().toLocaleDateString('en-GB'),
            totalBookings: 0,
            loyaltyPoints: 100,
            profileImage: null,
          };
        } else if (flow === 'signup') {
          userData = {
            id: '2',
            name: 'New User',
            email: value.includes('@') ? value : null,
            phone: !value.includes('@') ? value : null,
            isLoggedIn: true,
            joinedDate: new Date().toLocaleDateString('en-GB'),
            totalBookings: 0,
            loyaltyPoints: 200, // Bonus for new signup
            profileImage: null,
          };
        } else if (flow === 'forgotPassword') {
          // Handle forgot password flow
          Alert.alert('Success', 'OTP verified! You can now reset your password.');
          navigation.replace('ForgotPassword', { verified: true, value: value });
          return;
        }
        
        // Save user data
        await saveUserData(userData);
        
        Alert.alert('Success', 'OTP verified successfully!');
        
        // Navigate based on flow
        if (flow === 'login' || flow === 'signup') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    startTimer();
    Alert.alert('OTP Resent', 'A new OTP has been sent to your ' + type);
  };

  const formatContactInfo = (type, value) => {
    if (type === 'email') return value;
    if (type === 'phone') {
      // Format phone number for display
      const phone = value.replace(/\D/g, '');
      if (phone.length === 10) return `+91 ${phone.slice(0,5)} ${phone.slice(5)}`;
      return `+${phone}`;
    }
    return value;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Verify OTP</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* OTP Content */}
          <View style={styles.otpContent}>
            <Ionicons name="shield-checkmark" size={80} color="#4CAF50" />
            <Text style={styles.otpTitle}>Enter Verification Code</Text>
            <Text style={styles.otpSubtitle}>
              We've sent a 6-digit code to your {type}
            </Text>
            <Text style={styles.contactInfo}>
              {formatContactInfo(type, value)}
            </Text>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={[styles.otpInput, digit !== '' && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Timer/Resend */}
            <View style={styles.timerContainer}>
              {canResend ? (
                <TouchableOpacity onPress={resendOtp}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend OTP in {timer}s
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, (loading || otp.some(digit => digit === '')) && styles.verifyButtonDisabled]}
              onPress={() => handleVerifyOTP(otp.join(''))}
              disabled={loading || otp.some(digit => digit === '')}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            {/* Edit Contact */}
            <TouchableOpacity
              style={styles.editContactButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.editContactText}>
                Wrong contact? Go back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  otpContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  otpInputFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9f0',
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editContactButton: {
    padding: 8,
  },
  editContactText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;
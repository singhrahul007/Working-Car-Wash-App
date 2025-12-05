import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Keyboard,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function OtpScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  
  const { phone = '+1 (234) 567-8900', service, vehicle, date, time } = route.params || {};

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOtp();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    // Simulate OTP verification
    if (otpString === '123456') {
      Alert.alert(
        'Success!',
        `Your ${service?.name || 'car wash'} booking for ${date} at ${time} is confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const formatPhone = (phone) => {
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {'\n'}
          <Text style={styles.phoneNumber}>{formatPhone(phone)}</Text>
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timerText}>
          {canResend ? "Didn't receive code?" : `Resend code in ${timer}s`}
        </Text>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleResendOtp}
          disabled={!canResend}
        >
          <Text style={[styles.resendText, canResend && styles.resendActive]}>
            Resend OTP
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            otp.join('').length !== 6 && styles.disabledButton
          ]}
          onPress={handleVerifyOtp}
          disabled={otp.join('').length !== 6}
        >
          <Text style={styles.verifyButtonText}>
            Verify & Confirm Booking
          </Text>
        </TouchableOpacity>

        {/* Booking Details */}
        {service && (
          <View style={styles.bookingDetails}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{service.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle:</Text>
              <Text style={styles.detailValue}>
                {vehicle === 'car' ? 'Car' : 'Bike'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>{date} at {time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.amount}>Rs.{service.price}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  timerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  resendButton: {
    marginBottom: 32,
  },
  resendText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  resendActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#A0C8FF',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bookingDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
});
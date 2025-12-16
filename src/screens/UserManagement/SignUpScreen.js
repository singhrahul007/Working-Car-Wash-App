// screens/SignUpScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    marketingEmails: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Input refs for OTP
  const otpRefs = useRef([]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Validate form
  const validateForm = () => {
    const { fullName, email, mobile, password, confirmPassword, agreeToTerms } = formData;

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions');
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle sign up
  // const handleSignUp = async () => {
  //   if (!validateForm()) return;

  //   setLoading(true);
  //   try {
  //     // Send OTP to email/mobile
  //     setTimeout(() => {
  //       setLoading(false);
  //       setStep(2);
  //       startTimer();
  //     }, 1500);
  //   } catch (error) {
  //     setLoading(false);
  //     Alert.alert('Error', 'Failed to send OTP. Please try again.');
  //   }
  // };
const handleSignUp = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await registerUser(formData).unwrap();
      
      if (response.success) {
        if (response.data.requiresOtp) {
          dispatch(setOtpRequired({
            userId: response.data.userId,
            otpSentTo: response.data.otpSentTo
          }));
          setStep(2);
          startTimer();
        } else {
          // If no OTP required, login directly
           dispatch(setCredentials(response.data));
          navigation.replace('MainTabs');
        }
      }
    } catch (error) {
      Alert.alert('Error', error?.data?.message || 'Registration failed. Please try again.');
    }
  };
   // Update verifyOtp function:
  const verifyOtpCode = async (otpCode) => {
    if (otpCode.length !== 6) return;
    
    try {
      const otpData = {
        userId: formData.email, // or use the userId from registration response
        otp: otpCode,
        type: 'email', // or 'mobile'
      };
      
      const response = await verifyOtp(otpData).unwrap();
      
      if (response.success) {
        dispatch(setCredentials(response.data));
        navigation.replace('MainTabs');
      }
    } catch (error) {
       Alert.alert('Error', error?.data?.message || 'Invalid OTP. Please try again.');
    }
  };
   // Update loading state:
  //const loading = registerLoading || verifyLoading;
  // OTP Functions
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

    // Auto-focus next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }

    // Check if OTP is complete
    if (newOtp.every((digit) => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async (otpCode) => {
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      // Verify OTP with backend
      setTimeout(() => {
        setLoading(false);
        // On successful verification
        navigation.replace('MainTabs');
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const resendOtp = () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    startTimer();

    // Resend OTP API call
    Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile/email.');
  };

  // Render OTP input fields
  const renderOtpInputs = () => {
    return (
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (otpRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === 1 ? 'Create Account' : 'Verify OTP'}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
              <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
                <Text style={styles.progressStepText}>1</Text>
              </View>
              <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
                <Text style={styles.progressStepText}>2</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Information</Text>
              <Text style={styles.progressLabel}>Verification</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {step === 1 ? (
              <>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* Mobile */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={styles.mobileInputContainer}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobile}
                      onChangeText={(value) => handleInputChange('mobile', value)}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Create a password (min. 8 chars)"
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms & Marketing */}
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
                  >
                    <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
                      {formData.agreeToTerms && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      I agree to the{' '}
                      <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleInputChange('marketingEmails', !formData.marketingEmails)}
                  >
                    <View style={[styles.checkbox, formData.marketingEmails && styles.checkboxChecked]}>
                      {formData.marketingEmails && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      Send me promotional emails and updates
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>

                {/* Already have account */}
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* OTP Verification Screen */}
                <View style={styles.otpScreen}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={80}
                    color="#4CAF50"
                    style={styles.otpIcon}
                  />
                  
                  <Text style={styles.otpTitle}>Verify Your Account</Text>
                  <Text style={styles.otpSubtitle}>
                    Enter the 6-digit code sent to
                  </Text>
                  <Text style={styles.otpContact}>
                    +91 {formData.mobile} / {formData.email}
                  </Text>

                  {renderOtpInputs()}

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
                    style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                    onPress={() => verifyOtp(otp.join(''))}
                    disabled={loading || otp.some(digit => digit === '')}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                    )}
                  </TouchableOpacity>

                  {/* Edit Contact Info */}
                  <TouchableOpacity
                    style={styles.editContactButton}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.editContactText}>
                      Wrong number or email? Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  progressStepActiveText: {
    color: '#fff',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#ddd',
  },
  progressLineActive: {
    backgroundColor: '#2196F3',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  showPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkboxGroup: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  // OTP Screen Styles
  otpScreen: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  otpIcon: {
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  otpContact: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
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
    opacity: 0.7,
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

export default SignUpScreen;
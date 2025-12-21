// screens/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react'; // Added useEffect
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
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useDispatch } from 'react-redux';
import { setCredentials, setOtpRequired } from '../../store/slices/authSlice';
import { useLoginUserMutation } from '../../api/services/authService';
import { saveAuthData } from '../../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation,route }) => {
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [loginType, setLoginType] = useState('mobile'); // 'mobile' or 'email'
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Add useEffect to trigger animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Also trigger animation when loginType changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loginType]);

  // For development/testing, you can use these test credentials:
  // Google test config (you need to set up your own in production)
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_GOOGLE_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID',
    androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
  });

  // Facebook Auth (for testing, you can mock the function)
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  // Handle Google Sign In (mocked for testing)
  const handleGoogleSignIn = async () => {
    try {
      // For testing without actual Google setup
      Alert.alert(
        'Google Sign In',
        'Google sign in would trigger here. For testing, you can: \n1. Set up Google OAuth in Firebase/Google Cloud\n2. Use expo-auth-session with proper credentials\n3. Or mock this function for development',
        [
          {
            text: 'Mock Success',
            onPress: () => {
              console.log('Mock Google Sign In Success');
              navigation.navigate('OTPVerification', {
                type: 'google',
                token: 'mock-google-token',
              });
            }
          },
          { text: 'Cancel' }
        ]
      );
      
      // Uncomment for real implementation:
      // const result = await promptAsync();
      // if (result.type === 'success') {
      //   const { authentication } = result;
      //   navigation.navigate('OTPVerification', {
      //     type: 'google',
      //     token: authentication.accessToken,
      //   });
      // }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
      console.error('Google Sign In Error:', error);
    }
  };

  // Handle Facebook Sign In (mocked for testing)
  const handleFacebookSignIn = async () => {
    try {
      // For testing without actual Facebook setup
      Alert.alert(
        'Facebook Sign In',
        'Facebook sign in would trigger here. For testing, you need to:\n1. Create Facebook App at developers.facebook.com\n2. Configure expo-auth-session\n3. Or mock this function',
        [
          {
            text: 'Mock Success',
            onPress: () => {
              console.log('Mock Facebook Sign In Success');
              navigation.navigate('OTPVerification', {
                type: 'facebook',
                token: 'mock-facebook-token',
              });
            }
          },
          { text: 'Cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Facebook');
      console.error('Facebook Sign In Error:', error);
    }
  };

  // Handle Apple Sign In (mocked for testing)
  const handleAppleSignIn = async () => {
    try {
      // For testing on non-iOS devices or without Apple setup
      if (Platform.OS !== 'ios') {
        Alert.alert('Info', 'Apple Sign In is only available on iOS devices');
        return;
      }
      
      Alert.alert(
        'Apple Sign In',
        'Apple sign in would trigger here. Requires:\n1. iOS device with iOS 13+\n2. Apple Developer account\n3. Configure Sign in with Apple in Xcode',
        [
          {
            text: 'Mock Success',
            onPress: () => {
              console.log('Mock Apple Sign In Success');
              navigation.navigate('OTPVerification', {
                type: 'apple',
                credential: { user: 'mock-apple-user' },
              });
            }
          },
          { text: 'Cancel' }
        ]
      );
      
      // Uncomment for real implementation on iOS:
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [
      //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //   ],
      // });
      // navigation.navigate('OTPVerification', {
      //   type: 'apple',
      //   credential: credential,
      // });
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;
      Alert.alert('Error', 'Failed to sign in with Apple');
      console.error('Apple Sign In Error:', error);
    }
  };

  // Handle Login
  const handleLogin = () => {
    if (loginType === 'mobile') {
      if (!mobileNumber || mobileNumber.length !== 10) {
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
        return;
      }
      // Send OTP to mobile
      sendOTP('mobile', mobileNumber);
    } else {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
      // Handle email/password login
      handleEmailLogin();
    }
  };

  const sendOTP = async (type, value) => {
    setLoading(true);
    // try {
    //   // Simulate API call to send OTP
    //   // setTimeout(() => {
    //   //   setLoading(false);
    //   //   Alert.alert(
    //   //     'OTP Sent',
    //   //     `OTP has been sent to ${type === 'mobile' ? 'mobile number' : 'email'}: ${value}`,
    //   //     [
    //   //       {
    //   //         text: 'Continue',
    //   //         onPress: () => navigation.navigate('OTPVerification', {
    //   //           type: type,
    //   //           value: value,
    //   //           flow: 'login',
    //   //         })
    //   //       }
    //   //     ]
    //   //   );
    //   // }, 1500);
    // } catch (error) {

      
    //   setLoading(false);
    //   Alert.alert('Error', 'Failed to send OTP. Please try again.');
    // }
    try {
      const payload = {
        loginType: type,
        mobileNumber: value,
        rememberMe: false,
        deviceId: "react-native-device",
        userAgent: "ReactNative",
        ipAddress: "192.168.1.3",
      };
        console.log("Login User Mobile Number: >", mobileNumber);
        console.log("Mobile Login Payload:", payload);
        const res = await loginUser(payload).unwrap();
        console.log("Mobile Login Response:", JSON.stringify(res, null, 2));
    
      if (!res.success) {
        Alert.alert("Error", res.message);
        return;
      }
      // Check if response has requiresOTP at root level or in data

      if (res.requiresOTP) {
          // Store the mobile number in a variable to ensure it's not lost
      const userMobileNumber = mobileNumber; // Capture it before navigation
       await AsyncStorage.setItem('@login_mobile_Number', userMobileNumber);
       console.log("Stored mobile number for OTP flow:", userMobileNumber);
         console.log("✅ requiresOTP is TRUE, navigating to OTP screen...");
         console.log("Navigation params:", {
          type: 'mobile',
          value: mobileNumber,
          flow: 'login',
          tempToken: res.tempToken,
        });
        dispatch(setOtpRequired({
          userId: res.user?.id,
          otpSentTo: 'mobile',
          tempToken: res.tempToken,
        }));
        console.log("✅ About to navigate to OTPVerification");
          console.log("Navigation params:", {
            type: 'mobile',
            value: mobileNumber,
            flow: 'login',
            tempToken: res.tempToken,
          });
         await new Promise(resolve => setTimeout(resolve, 100)); // Ensure state is updated
        // navigation.replace('OTPVerification', {
        //   type: 'mobile',
        //   value: userMobileNumber,
        //   flow: 'login',
        //   tempToken: res.tempToken,
        // });
       
        
          
      }
       const navigationParams = {
          type: type,
          value: value,
          flow: 'login',
          tempToken: res.tempToken,
        };
         console.log("🧭 Navigation params:", navigationParams);
      navigation.navigate('OTPVerification', navigationParams);
    //   Alert.alert('Success', 'OTP Sent', [{
    //   text: 'OK',
    //   onPress: () => navigation.navigate('OTPVerification')
    // }]);
    } catch (error) {
      console.log('OTP Send Error:', error);
      
      const errorMessage = error?.data?.message || 
                          "Failed to send OTP. Please try again.";
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  const handleEmailLogin = async () => {
     if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        loginType: "email",
        email: email,
        mobileNumber: "",
        password: password,
        rememberMe: rememberMe,
        deviceId: "react-native-device",
        userAgent: "ReactNative",
        ipAddress: "192.168.1.3",
      };
    console.log("Email Login Payload:", payload);
    const res = await loginUser(payload).unwrap();
    console.log("Email Login Response:", res);
    
    if (!res.success) {
      Alert.alert("Login Failed", res.message);
      return;
    }
    // Check response for different authentication flows
    if (res.requiresOTP) {
      // Navigate to OTP verification
      console.log("✅ Requires OTP, navigating to OTP screen...");
      
      dispatch(setOtpRequired({
        userId: res.user?.id,
        otpSentTo: 'email',
        tempToken: res.tempToken,
      }));
      
      navigation.navigate('OTPVerification', {
        type: 'email',
        value: email,
        flow: 'login',
        tempToken: res.tempToken,
      });
    } else if (res.requires2FA) {
      // Navigate to 2FA verification
      console.log("✅ Requires 2FA, navigating to 2FA screen...");
      
      navigation.navigate('TwoFactorAuth', {
        userId: res.user?.id,
        tempToken: res.tempToken,
      });
    } else {
      // Direct login successful
      console.log("✅ Direct login successful");
      
      const authState = {
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        sessionId: res.sessionId,
        accessTokenExpiry: res.accessTokenExpiry,
        refreshTokenExpiry: res.refreshTokenExpiry,
        isAuthenticated: true,
        requiresOTP: false,
        requires2FA: false,
        token: res.accessToken,
      };
      
      dispatch(setCredentials(authState));
      await saveAuthData(authState);
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
      Alert.alert('Success', 'Login successful!');
    }
      // For testing - accept any email/password
      // setTimeout(() => {
      //   setLoading(false);
        
      //   // Test credentials for demo
      //   const testEmail = 'test@example.com';
      //   const testPassword = 'password123';
        
      //   if (email === testEmail && password === testPassword) {
      //     // Check if 2FA is enabled (mock for testing)
      //     const has2FA = false; // Change to true to test 2FA flow
          
      //     if (has2FA) {
      //       navigation.navigate('TwoFactorAuth');
      //     } else {
      //       Alert.alert(
      //         'Login Successful',
      //         'You have successfully logged in!',
      //         [
      //           {
      //             text: 'Continue',
      //             onPress: () => navigation.replace('MainTabs')
      //           }
      //         ]
      //       );
      //     }
      //   } else {
      //     Alert.alert('Login Failed', 'Invalid email or password. Try:\nEmail: test@example.com\nPassword: password123');
      //   }
      // }, 1500);
    } catch (error) {
       console.log('Login Error:', error);
        const errorMessage = error?.data?.message || 
                          error?.error?.data?.message || 
                          error?.message || 
                          "Login failed. Please try again.";
      setLoading(false);
      Alert.alert('Login Error', errorMessage);
    }finally {
      setLoading(false);
    }
  
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Add helper function for demo
  const fillDemoCredentials = () => {
    setEmail('test@example.com');
    setPassword('password123');
    Alert.alert('Demo Credentials', 'Email: test@example.com\nPassword: password123\n\nUse these for testing.');
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
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Sign In</Text>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.demoButtonText}>Demo</Text>
            </TouchableOpacity>
          </View>

          {/* Login Type Toggle */}
          <View style={styles.loginTypeContainer}>
            <TouchableOpacity
              style={[
                styles.loginTypeButton,
                loginType === 'mobile' && styles.loginTypeButtonActive,
              ]}
              onPress={() => setLoginType('mobile')}
            >
              <Ionicons
                name="phone-portrait"
                size={20}
                color={loginType === 'mobile' ? '#2196F3' : '#666'}
              />
              <Text
                style={[
                  styles.loginTypeText,
                  loginType === 'mobile' && styles.loginTypeTextActive,
                ]}
              >
                Mobile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginTypeButton,
                loginType === 'email' && styles.loginTypeButtonActive,
              ]}
              onPress={() => setLoginType('email')}
            >
              <Ionicons
                name="mail"
                size={20}
                color={loginType === 'email' ? '#2196F3' : '#666'}
              />
              <Text
                style={[
                  styles.loginTypeText,
                  loginType === 'email' && styles.loginTypeTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form - Now visible with animation */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {loginType === 'mobile' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.mobileInputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>
                {/* <Text style={styles.hintText}>For testing: Enter any 10-digit number</Text> */}
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="test@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="password123"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
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

                {/* Remember Me & Forgot Password */}
                <View style={styles.rememberForgotContainer}>
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked
                    ]}>
                      {rememberMe && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {loginType === 'mobile' ? 'Send OTP' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleSignIn}
                >
                  <FontAwesome name="apple" size={20} color="#fff" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleSignIn}
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
              >
                <FontAwesome name="facebook-f" size={20} color="#4267B2" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By signing in, you agree to our{' '}
            <Text style={styles.linkText} onPress={() => Alert.alert('Terms', 'Terms of Service content would appear here.')}>Terms</Text> and{' '}
            <Text style={styles.linkText} onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy content would appear here.')}>Privacy Policy</Text>
          </Text>
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
  demoButton: {
    padding: 8,
  },
  demoButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  loginTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  loginTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loginTypeButtonActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  loginTypeTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 30,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  facebookButton: {
    backgroundColor: '#fff',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default LoginScreen;
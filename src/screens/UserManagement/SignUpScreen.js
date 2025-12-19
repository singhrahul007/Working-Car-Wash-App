// screens/SignUpScreen.js
import React, { useState, useRef } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setCredentials, setOtpRequired } from "../../store/slices/authSlice";
import {
  useRegisterUserMutation,
  useVerifyOtpMutation,
} from "../../api/services/authService";

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    marketingEmails: false,
  });

  const [registerUser, { isLoading: registerLoading }] =
    useRegisterUserMutation();
  const [verifyOtp, { isLoading: verifyLoading }] = useVerifyOtpMutation();

  const loading = registerLoading || verifyLoading;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef([]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const { fullName, email, mobile, password, confirmPassword, agreeToTerms } =
      formData;

    if (!fullName.trim()) return Alert.alert("Error", "Enter full name");
    if (!validateEmail(email)) return Alert.alert("Error", "Invalid email");
    if (mobile.length !== 10 || !validateMobileNumber(mobile)) {
      return Alert.alert("Error", "Invalid mobile number");
    }
    if (password.length < 8) return Alert.alert("Error", "Password too short");
    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");
    if (!agreeToTerms) return Alert.alert("Error", "Accept Terms & Conditions");
    
    return true;
  };
  const validateMobileNumber = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    return mobileRegex.test(mobile);
  }
  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        email: formData.email,
        mobileNumber: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        acceptTerms: formData.agreeToTerms,
      };
      const res = await registerUser(payload).unwrap();
      console.log("Registration Response:", res);
       // 🚨 CRITICAL FIX: Check if success is false
    if (!res.success) {
      // Show the error message from API
      Alert.alert("Registration Failed", res.message, [
        { text: "OK", style: "default" }
      ]);
      return; 
    }
      if (res.success && res.data.requiresOtp) {
        dispatch(
          setOtpRequired({
            userId: res.data.userId,
            otpSentTo: res.data.otpSentTo,
          })
        );
        setStep(2);
        startTimer();
      } else {
        dispatch(setCredentials(res.data));
        navigation.replace("MainTabs");
      }
    } catch (err) {
      console.log('REGISTER ERROR FULL:', err);
      console.log('REGISTER ERROR DATA:', err?.data);
      console.log('REGISTER ERROR STATUS:', err?.status);
      Alert.alert("Error", err || "Registration failed");
    }
  };

  const verifyOtpCode = async () => {
    try {
      const res = await verifyOtp({
        otp: otp.join(""),
        type: "email",
      }).unwrap();

      if (res.success) {
        dispatch(setCredentials(res.data));
        navigation.replace("MainTabs");
      }
    } catch {
      Alert.alert("Error", "Invalid OTP");
    }
  };

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    const i = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(i);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const renderOtpInputs = () => (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            otpRefs.current[index] = ref;
          }}
          style={styles.otpInput}
          value={digit}
          onChangeText={(v) => handleOtpChange(v, index)}
          keyboardType="numeric"
          maxLength={1}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.fullName}
                onChangeText={(v) => handleInputChange("fullName", v)}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(v) => handleInputChange("email", v)}
              />
            </View>

            {/* Mobile */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                keyboardType="numeric"
                maxLength={10}
                value={formData.mobile}
                onChangeText={(v) => handleInputChange("mobile", v)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(v) => handleInputChange("password", v)}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange("confirmPassword", v)}
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                handleInputChange("agreeToTerms", !formData.agreeToTerms)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.agreeToTerms && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxText}>
                I accept Terms & Conditions
              </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSignUp}
              style={styles.signUpButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderOtpInputs()}
            <TouchableOpacity
              onPress={verifyOtpCode}
              style={styles.verifyButton}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
  },
  progressStepActiveText: {
    color: "#fff",
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: "#ddd",
  },
  progressLineActive: {
    backgroundColor: "#2196F3",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 140,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  mobileInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  showPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkboxGroup: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  linkText: {
    color: "#2196F3",
    fontWeight: "500",
  },
  signUpButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  loginPromptText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "bold",
  },
  // OTP Screen Styles
  otpScreen: {
    alignItems: "center",
    paddingVertical: 20,
  },
  otpIcon: {
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  otpContact: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    width: "100%",
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 24,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  timerContainer: {
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  resendText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "bold",
  },
  verifyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editContactButton: {
    padding: 8,
  },
  editContactText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
});

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('@carwash_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData, token) => {
    try {
      await AsyncStorage.setItem('@carwash_user', JSON.stringify(userData));
      await AsyncStorage.setItem('@carwash_token', token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (userData, token) => {
    try {
      await AsyncStorage.setItem('@carwash_user', JSON.stringify(userData));
      await AsyncStorage.setItem('@carwash_token', token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['@carwash_user', '@carwash_token']);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  };

  const verifyOTP = async (otpCode) => {
    // Mock OTP verification
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(otpCode.length === 6);
      }, 1500);
    });
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
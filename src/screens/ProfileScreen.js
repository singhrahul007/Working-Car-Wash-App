import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const navigation = useNavigation();
  
  // User State
  const [user, setUser] = useState({
    name: 'Rahul Singh',
    email: 'rahul.singh@washingexpress.com',
    phone: '+91 98765 43210',
    profileImage: null,
    joinedDate: '15 Jan 2025',
    totalBookings: 12,
    loyaltyPoints: 450,
  });
  
  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    darkMode: false,
    locationServices: true,
    autoLogin: false,
  });
  
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  
  // Load user data on mount
  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@carwash_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setTempUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@carwash_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveUserData = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('@carwash_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const saveSettings = async (updatedSettings) => {
    try {
      await AsyncStorage.setItem('@carwash_settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleEditProfile = () => {
    setTempUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    saveUserData(tempUser);
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to photos to upload profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setTempUser({ ...tempUser, profileImage: result.assets[0].uri });
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Clear user session
            AsyncStorage.multiRemove(['@carwash_user', '@carwash_token']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' }],
            });
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await AsyncStorage.multiRemove([
                '@carwash_user',
                '@carwash_token',
                '@carwash_settings',
                '@carwash_bookings'
              ]);
              
              setTimeout(() => {
                setLoading(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Splash' }],
                });
                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              }, 1500);
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const profileMenuItems = [
    {
      id: 1,
      title: 'My Bookings',
      icon: 'calendar-check',
      color: '#4A90E2',
      action: () => navigation.navigate('Order')
    },
    {
      id: 2,
      title: 'Payment Methods',
      icon: 'credit-card',
      color: '#FF9800',
      action: () => Alert.alert('Payment Methods', 'Manage your payment methods here.')
    },
    {
      id: 3,
      title: 'Address Book',
      icon: 'map-marker',
      color: '#4CAF50',
      action: () => Alert.alert('Address Book', 'Manage your saved addresses here.')
    },
    {
      id: 4,
      title: 'Wishlist',
      icon: 'heart',
      color: '#F44336',
      action: () => Alert.alert('Wishlist', 'View your saved items here.')
    },
  ];

  const settingsMenuItems = [
    {
      id: 1,
      title: 'Notifications',
      icon: 'bell',
      value: settings.notifications,
      onValueChange: (value) => {
        const updated = { ...settings, notifications: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
    {
      id: 2,
      title: 'Email Updates',
      icon: 'email',
      value: settings.emailUpdates,
      onValueChange: (value) => {
        const updated = { ...settings, emailUpdates: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
    {
      id: 3,
      title: 'SMS Updates',
      icon: 'message-text',
      value: settings.smsUpdates,
      onValueChange: (value) => {
        const updated = { ...settings, smsUpdates: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
    {
      id: 4,
      title: 'Dark Mode',
      icon: 'theme-light-dark',
      value: settings.darkMode,
      onValueChange: (value) => {
        const updated = { ...settings, darkMode: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
    {
      id: 5,
      title: 'Location Services',
      icon: 'map-marker-radius',
      value: settings.locationServices,
      onValueChange: (value) => {
        const updated = { ...settings, locationServices: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
    {
      id: 6,
      title: 'Auto Login',
      icon: 'login',
      value: settings.autoLogin,
      onValueChange: (value) => {
        const updated = { ...settings, autoLogin: value };
        setSettings(updated);
        saveSettings(updated);
      }
    },
  ];

  const supportMenuItems = [
    {
      id: 1,
      title: 'Help & Support',
      icon: 'help-circle',
      action: () => navigation.navigate('Support')
    },
    {
      id: 2,
      title: 'Terms of Service',
      icon: 'file-document',
      action: () => Alert.alert('Terms of Service', 'View our terms and conditions.')
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: 'shield-check',
      action: () => Alert.alert('Privacy Policy', 'View our privacy policy.')
    },
    {
      id: 4,
      title: 'Rate App',
      icon: 'star',
      action: () => Alert.alert('Rate App', 'Rate us on the app store.')
    },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      {/* Profile Image */}
      <TouchableOpacity onPress={handlePickImage} style={styles.profileImageContainer}>
        {tempUser.profileImage ? (
          <Image source={{ uri: tempUser.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
            <Icon name="account" size={50} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.editImageButton}>
          <Icon name="camera" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{tempUser.name}</Text>
        <Text style={styles.userEmail}>{tempUser.email}</Text>
        <Text style={styles.userPhone}>{tempUser.phone}</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.loyaltyPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Gold</Text>
            <Text style={styles.statLabel}>Tier</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Profile Image Edit */}
            <TouchableOpacity 
              style={styles.editImageSection}
              onPress={handlePickImage}
            >
              {tempUser.profileImage ? (
                <Image source={{ uri: tempUser.profileImage }} style={styles.modalProfileImage} />
              ) : (
                <View style={styles.modalProfileImagePlaceholder}>
                  <Icon name="camera-plus" size={40} color="#4A90E2" />
                </View>
              )}
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={tempUser.name}
                onChangeText={(text) => setTempUser({ ...tempUser, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.formInput}
                value={tempUser.email}
                onChangeText={(text) => setTempUser({ ...tempUser, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={tempUser.phone}
                onChangeText={(text) => setTempUser({ ...tempUser, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderMenuSection = (title, items) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.onValueChange ? (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: '#D1D5DB', true: '#4A90E2' }}
                thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
              />
            ) : (
              <Icon name="chevron-right" size={22} color="#D1D5DB" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Processing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Icon name="pencil" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        {renderProfileHeader()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Booking', { vehicle: 'car' })}
          >
            <Icon name="plus-circle" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>New Booking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Icon name="cog" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="headset" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Menu */}
        {renderMenuSection('My Account', profileMenuItems)}

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            {settingsMenuItems.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={[styles.menuIconContainer, { backgroundColor: '#4A90E2' + '20' }]}>
                  <Icon name={item.icon} size={22} color="#4A90E2" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#D1D5DB', true: '#4A90E2' }}
                  thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Support & Legal */}
        {renderMenuSection('Support & Legal', supportMenuItems)}

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Washing Express India</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 WashingExpress India. All rights reserved.</Text>
          <Text style={styles.memberSince}>Member since {user.joinedDate}</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      {renderEditModal()}

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {settingsMenuItems.map((item) => (
                <View key={item.id} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: '#4A90E2' + '20' }]}>
                      <Icon name={item.icon} size={20} color="#4A90E2" />
                    </View>
                    <View>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingDescription}>
                        {item.title === 'Notifications' && 'Receive booking updates and offers'}
                        {item.title === 'Email Updates' && 'Get newsletters and promotions'}
                        {item.title === 'SMS Updates' && 'Receive SMS notifications'}
                        {item.title === 'Dark Mode' && 'Switch to dark theme'}
                        {item.title === 'Location Services' && 'Allow location access'}
                        {item.title === 'Auto Login' && 'Stay logged in on this device'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#D1D5DB', true: '#4A90E2' }}
                    thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 8,
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  accountActions: {
    marginTop: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F44336',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  editImageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalProfileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
});
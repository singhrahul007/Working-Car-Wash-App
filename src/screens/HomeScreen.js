import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  // State variables
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Select City');
  const [isLoading, setIsLoading] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Sample Indian cities for manual selection
  const indianCities = [
    { id: '1', name: 'Mumbai', state: 'Maharashtra' },
    { id: '2', name: 'Delhi', state: 'Delhi' },
    { id: '3', name: 'Bangalore', state: 'Karnataka' },
    { id: '4', name: 'Hyderabad', state: 'Telangana' },
    { id: '5', name: 'Chennai', state: 'Tamil Nadu' },
    { id: '6', name: 'Kolkata', state: 'West Bengal' },
    { id: '7', name: 'Pune', state: 'Maharashtra' },
    { id: '8', name: 'Ahmedabad', state: 'Gujarat' },
    { id: '9', name: 'Jaipur', state: 'Rajasthan' },
    { id: '10', name: 'Lucknow', state: 'Uttar Pradesh' },
  ];

  // Load saved location on mount
  useEffect(() => {
    loadSavedLocation();
    requestLocationPermission();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('@carwash_city');
      if (savedCity) {
        setCity(savedCity);
      }
    } catch (error) {
      console.log('Error loading saved city:', error);
    }
  };

  const saveCity = async (cityName) => {
    try {
      await AsyncStorage.setItem('@carwash_city', cityName);
    } catch (error) {
      console.log('Error saving city:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissionDenied(true);
        Alert.alert(
          'Location Permission Required',
          'CarWash needs location access to find services near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => requestLocationPermission() }
          ]
        );
        return false;
      }
      
      setPermissionDenied(false);
      await getCurrentLocation();
      return true;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      setLocation(location);

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        
        // Set city
        if (place.city) {
          setCity(place.city);
          await saveCity(place.city);
        } else if (place.region) {
          setCity(place.region);
          await saveCity(place.region);
        }

        // Build address string
        const addressParts = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.country
        ].filter(Boolean);
        
        setAddress(addressParts.join(', '));
      }
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch your location. Please try again or select city manually.',
        [
          { text: 'Select City', onPress: () => setShowCityModal(true) },
          { text: 'Try Again', onPress: () => getCurrentLocation() }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelect = async (selectedCity) => {
    setCity(selectedCity.name);
    await saveCity(selectedCity.name);
    setShowCityModal(false);
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  // Action items for the grid

const actionItems = [
  {
    id: '1',
    title: 'Car Wash',
    subtitle: 'Starting at ₹299',
    icon: 'local-car-wash',
    color: '#2196F3', // Blue 500
    bgColor: '#E3F2FD', // Blue 50
    action: () => navigation.navigate('Booking', { vehicle: 'car' })
  },
  {
    id: '2',
    title: 'Bike Wash',
    subtitle: 'Starting at ₹149',
    icon: 'two-wheeler',
    color: '#4CAF50', // Green 500
    bgColor: '#E8F5E9', // Green 50
    action: () => navigation.navigate('Booking', { vehicle: 'bike' })
  },
  {
    id: '3',
    title: 'Sofa Cleaning',
    subtitle: 'Professional Sofa Wash',
    icon: 'weekend',
    color: '#795548', // Brown 500
    bgColor: '#EFEBE9', // Brown 50
    action: () => navigation.navigate('SofaCleaning')
  },
  {
    id: '4',
    title: 'Carpet Cleaning',
    subtitle: 'Carpet Wash & Care',
    icon: 'layers',
    color: '#607D8B', // Blue Grey 500
    bgColor: '#ECEFF1', // Blue Grey 50
    action: () => navigation.navigate('CarpetCleaning')
  },
  {
    id: '5',
    title: 'AC Services',
    subtitle: 'Repair & Maintenance',
    icon: 'ac-unit',
    color: '#03A9F4', // Light Blue 500
    bgColor: '#E1F5FE', // Light Blue 50
    action: () => navigation.navigate('ACService')
  },
  {
    id: '6',
    title: 'Support',
    subtitle: 'Get Help',
    icon: 'help-outline',
    color: '#FF9800', // Orange 500
    bgColor: '#FFF3E0', // Orange 50
    action: () => navigation.navigate('Support')
  },
];
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.appTitle}>Express washing</Text>
          
          {/* Location Button */}
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => setShowCityModal(true)}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <Icon name="location-on" size={18} color="#4A90E2" />
            )}
            <Text style={styles.locationText} numberOfLines={1}>
              {city}
            </Text>
            <Icon name="keyboard-arrow-down" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {city !== 'Select City' ? `Hi! Welcome to ${city}` : 'Hi! Welcome to Royal Services'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            Book a wash or buy products.
          </Text>
          
          {address && (
            <View style={styles.addressContainer}>
              <Icon name="place" size={14} color="#6B7280" />
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            </View>
          )}
          
          {permissionDenied && (
            <TouchableOpacity 
              style={styles.enableLocationButton}
              onPress={requestLocationPermission}
            >
              <Icon name="location-on" size={18} color="#FFFFFF" />
              <Text style={styles.enableLocationText}>Enable Location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionCard, { backgroundColor: item.bgColor }]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.actionTitle}>{item.title}</Text>
              <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {city !== 'Select City' ? `Services in ${city}` : 'Our Services'}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesCard}>
          <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => navigation.navigate('Booking', { vehicle: 'car' })}
          >
            <View style={styles.serviceIconContainer}>
              <Icon name="local-car-wash" size={24} color="#4A90E2" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Basic Car Wash</Text>
              <Text style={styles.servicePrice}>₹299 </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#95A5A6" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => navigation.navigate('Booking', { vehicle: 'car' })}
          >
            <View style={styles.serviceIconContainer}>
              <Icon name="local-car-wash" size={24} color="#4A90E2" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Premium Car Wash</Text>
              <Text style={styles.servicePrice}>₹599 </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#95A5A6" />
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
        </View>

        <View style={styles.recentCard}>
          <Icon name="history" size={40} color="#D1D5DB" />
          <Text style={styles.recentTitle}>No recent bookings</Text>
          <Text style={styles.recentSubtitle}>
            Place your first booking to see it here!
          </Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Order')}
          >
            <Text style={styles.bookButtonText}>View All Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Camera FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
        activeOpacity={0.8}
      >
        <Icon name="camera-alt" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={indianCities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCitySelect(item)}
                >
                  <View>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityState}>{item.state}</Text>
                  </View>
                  {city === item.name && (
                    <Icon name="check" size={24} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            
            <TouchableOpacity
              style={styles.detectLocationButton}
              onPress={() => {
                setShowCityModal(false);
                getCurrentLocation();
              }}
            >
              <Icon name="my-location" size={20} color="#4A90E2" />
              <Text style={styles.detectLocationText}>Detect My Location</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
  },
  menuButton: {
    padding: 4,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    maxWidth: 140,
  },
  locationText: {
    color: '#4A90E2',
    fontWeight: '500',
    fontSize: 14,
    marginHorizontal: 6,
    flexShrink: 1,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  enableLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  servicesCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 100,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  cityState: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detectLocationText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
});
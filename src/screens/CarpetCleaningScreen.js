import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useGetCarpetServicesQuery,
  useCreateCarpetBookingMutation,
} from '../api/services/carpetServiceApi';

// Conditional imports to avoid TypeScript/web errors
/** @type {any} */
let DateTimePicker;
/** @type {any} */
let MaterialIcons;

if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
}

export default function CarpetCleaningScreen() {
  const navigation = useNavigation();

  const [selectedServices, setSelectedServices] = useState(
    /** @type {Array<{id: number | string, name: string, basePrice: number, duration: string, includes: string, type: string}>} */ ([])
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [carpetType, setCarpetType] = useState('');
  const [carpetSize, setCarpetSize] = useState('small');
  const [carpetCount, setCarpetCount] = useState(1);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(15, 0, 0, 0);
    return initialTime;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [currentPickerValue, setCurrentPickerValue] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('Today');
  const [formattedTime, setFormattedTime] = useState('3:00 PM');

  // ─── RTK Query ────────────────────────────────────────────────────────────
  const {
    data: apiServicesData,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetCarpetServicesQuery({});

  const [createCarpetBooking, { isLoading: bookingLoading }] = useCreateCarpetBookingMutation();

  // Carpet Types
  const carpetTypes = ['Wool', 'Synthetic', 'Silk', 'Cotton', 'Olefin', 'Nylon', 'Polyester', 'Blend'];

  // Carpet Sizes
  const carpetSizes = [
    { id: 'small', name: 'Small', area: 'Up to 100 sq.ft', priceMultiplier: 1 },
    { id: 'medium', name: 'Medium', area: '100-200 sq.ft', priceMultiplier: 1.5 },
    { id: 'large', name: 'Large', area: '200-400 sq.ft', priceMultiplier: 2 },
    { id: 'xlarge', name: 'Extra Large', area: '400+ sq.ft', priceMultiplier: 3 }
  ];

  // Fallback static services used when API is unavailable
  const STATIC_SERVICES = [
    {
      id: 1,
      name: 'Basic Carpet Cleaning',
      basePrice: 499,
      duration: '1 hour',
      includes: 'Vacuuming, Spot Cleaning, Deodorizing',
      type: 'basic',
    },
    {
      id: 2,
      name: 'Deep Carpet Cleaning',
      basePrice: 799,
      duration: '2 hours',
      includes: 'Steam Cleaning, Stain Removal, Fabric Protection',
      type: 'deep',
    },
    {
      id: 3,
      name: 'Premium Carpet Cleaning',
      basePrice: 1199,
      duration: '3 hours',
      includes: 'Complete Restoration, Odor Removal, UV Treatment',
      type: 'premium',
    },
    {
      id: 4,
      name: 'Carpet Stain Removal',
      basePrice: 299,
      duration: '45 mins',
      includes: 'Targeted Stain Treatment',
      type: 'stain',
    },
    {
      id: 5,
      name: 'Carpet Sanitization',
      basePrice: 399,
      duration: '1 hour',
      includes: 'Germ Protection, Anti-bacterial Treatment',
      type: 'sanitization',
    },
    {
      id: 6,
      name: 'Carpet Deodorizing',
      basePrice: 349,
      duration: '45 mins',
      includes: 'Odor Neutralization, Freshness',
      type: 'deodorizing',
    },
  ];

  // Normalize API response: support both array and { data: [...] } shapes
  const services = React.useMemo(() => {
    if (!apiServicesData) return STATIC_SERVICES;
    const raw = Array.isArray(apiServicesData)
      ? apiServicesData
      : apiServicesData.data || apiServicesData.services || [];
    if (raw.length === 0) return STATIC_SERVICES;
    // Map API fields to local shape
    return raw.map((/** @type {any} */ s) => ({
      id: s.id,
      name: s.name || s.serviceName,
      basePrice: s.price ?? s.basePrice ?? 0,
      duration: s.duration || s.estimatedDuration || '--',
      includes: s.description || s.includes || '',
      type: s.type || s.category || s.serviceCategory || 'basic',
    }));
  }, [apiServicesData]);

  // Format date for display
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      setFormattedDate('Today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      setFormattedDate('Tomorrow');
    } else {
      setFormattedDate(moment(date).format('DD MMM YYYY'));
    }
  }, [date]);

  // Format time for display
  useEffect(() => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    setFormattedTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
  }, [time]);

  // Calculate service price based on size
  const calculateServicePrice = (/** @type {any} */ service) => {
    const sizeMultiplier = carpetSizes.find(s => s.id === carpetSize)?.priceMultiplier || 1;
    return service.basePrice * sizeMultiplier;
  };

  // Calculate total price
  const totalPrice = selectedServices.reduce((sum, service) => {
    return sum + calculateServicePrice(service);
  }, 0) * carpetCount;

  const showDatepicker = () => {
    setCurrentPickerValue(date);
    setPickerMode('date');
    setShowPicker(true);
  };

  const showTimepicker = () => {
    setCurrentPickerValue(time);
    setPickerMode('time');
    setShowPicker(true);
  };

  const onChange = (/** @type {any} */ event, /** @type {any} */ selectedValue) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedValue) {
        if (pickerMode === 'date') {
          setDate(selectedValue);
        } else {
          setTime(selectedValue);
        }
      }
    } else {
      if (selectedValue) {
        setCurrentPickerValue(selectedValue);
      }
    }
  };

  const handleServiceSelect = (/** @type {any} */ service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);

    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const increaseCount = () => {
    if (carpetCount < 5) {
      setCarpetCount(prev => prev + 1);
    }
  };

  const decreaseCount = () => {
    if (carpetCount > 1) {
      setCarpetCount(prev => prev - 1);
    }
  };

  /** @param {any} bookingData @param {any} apiResponse */
  const saveBookingToHistory = async (bookingData, apiResponse) => {
    try {
      const existingBookings = await AsyncStorage.getItem('@carwash_bookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];

      const bookingPayload = apiResponse?.data || apiResponse;
      const newBooking = {
        id: bookingPayload?.id || Date.now(),
        bookingReference: bookingPayload?.bookingId || null,
        ...bookingData,
        category: 'carpet-cleaning',
        status: 'Confirmed',
        bookingDate: new Date().toISOString(),
      };

      bookings.unshift(newBooking);
      await AsyncStorage.setItem('@carwash_bookings', JSON.stringify(bookings));
    } catch (error) {
      console.warn('Error saving booking to local history:', error);
    }
  };

  const handleBookNow = async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Select Service', 'Please select at least one service.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Phone Required', 'Please enter your phone number.');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your address for service.');
      return;
    }

    if (!carpetType) {
      Alert.alert('Carpet Type Required', 'Please select your carpet type.');
      return;
    }

    if (!carpetSize) {
      Alert.alert('Carpet Size Required', 'Please select your carpet size.');
      return;
    }

    // ── Build scheduled time string (HH:mm) ─────────────────────────────────
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const scheduledTimeStr = `${hh}:${mm}`;

    // ── Build ISO date (date only, midnight UTC) ─────────────────────────────
    const scheduledDateISO = moment(date).startOf('day').toISOString();

    // ── Build request body matching CarpetBookingCreateDTOs ──────────────────
    const requestBody = {
      serviceIds: selectedServices.map((s) => s.id),
      customerPhone: phoneNumber,
      customerAddress: address.trim(),
      carpetType,
      carpetSize: carpetSizes.find((s) => s.id === carpetSize)?.name || carpetSize,
      carpetCount,
      scheduledDate: scheduledDateISO,
      scheduledTime: scheduledTimeStr,
      specialInstructions: '',
    };

    try {
      const result = await createCarpetBooking(requestBody).unwrap();
      console.log('Carpet Booking API result:', JSON.stringify(result, null, 2));

      const bookingRef = result?.bookingId || result?.id || null;

      const bookingData = {
        services: selectedServices.map((service) => ({
          ...service,
          price: calculateServicePrice(service),
        })),
        phone: phoneNumber,
        address,
        carpetType,
        carpetSize: carpetSizes.find((s) => s.id === carpetSize)?.name || carpetSize,
        carpetCount,
        category: 'Carpet Cleaning',
        date: formattedDate,
        time: formattedTime,
        totalPrice,
      };
      await saveBookingToHistory(bookingData, result);

      Alert.alert(
        'Booking Confirmed!',
        `Your carpet cleaning booking has been placed successfully.\n\nRef: ${bookingRef || 'N/A'}\nDate: ${formattedDate} at ${formattedTime}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Carpet Booking Error:', err);
      const error = /** @type {any} */ (err);
      const msg = error?.data?.message || error?.error || 'Failed to create booking. Please try again.';
      Alert.alert('Booking Failed', msg);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────
  const SafeDateTimePicker = (/** @type {any} */ props) => {
    if (!DateTimePicker) return null;
    const { value, mode, display, onChange: onCh, minimumDate, style } = props;
    /** @type {any} */
    const pickerProps = { value, mode: mode === 'date' ? 'date' : 'time', display, onChange: onCh, minimumDate };
    if (style) pickerProps.style = style;
    return React.createElement(DateTimePicker, pickerProps);
  };

  const SafeIcon = (/** @type {any} */ props) => {
    if (!MaterialIcons) return null;
    const { name, size, color } = props;
    /** @type {any} */
    const iconProps = { name, size, color };
    return React.createElement(MaterialIcons, iconProps);
  };

  const renderDateTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent={true}
          visible={showPicker}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <SafeDateTimePicker
                value={currentPickerValue}
                mode={pickerMode}
                display="spinner"
                onChange={onChange}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
                style={styles.iosPicker}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => {
                    if (pickerMode === 'date') {
                      setDate(currentPickerValue);
                    } else {
                      setTime(currentPickerValue);
                    }
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      if (showPicker) {
        return (
          <SafeDateTimePicker
            value={currentPickerValue}
            mode={pickerMode}
            display="default"
            onChange={onChange}
            minimumDate={pickerMode === 'date' ? new Date() : undefined}
          />
        );
      }
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#556B2F" barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carpet Cleaning</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Cleaning Services</Text>
          <Text style={styles.selectCount}>
            {selectedServices.length} selected
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>Professional carpet cleaning & restoration:</Text>

        {/* Loading / Error / List */}
        {servicesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#556B2F" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : servicesError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Could not load services from server. Showing default services.
            </Text>
          </View>
        ) : null}

        <View style={styles.servicesContainer}>
          {services.map((/** @type {any} */ service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            const servicePrice = calculateServicePrice(service);

            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.selectedServiceCard
                ]}
                onPress={() => handleServiceSelect(service)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceContent}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(service.type) }
                    ]}>
                      <Text style={styles.typeText}>
                        {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.serviceIncludes}>{service.includes}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>Rs.{servicePrice}</Text>
                    <Text style={styles.serviceDuration}>• {service.duration}</Text>
                  </View>
                </View>
                {isSelected ? (
                  <View style={styles.selectedIndicator}>
                    <SafeIcon name="check" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <SafeIcon name="add" size={20} color="#556B2F" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Carpet Details */}
        <Text style={styles.sectionTitle}>Carpet Information</Text>
        <View style={styles.carpetDetailsContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Carpet Material *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {carpetTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    carpetType === type && styles.selectedTypeButton
                  ]}
                  onPress={() => setCarpetType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    carpetType === type && styles.selectedTypeButtonText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sizeContainer}>
            <Text style={styles.sizeLabel}>Carpet Size *</Text>
            <View style={styles.sizeGrid}>
              {carpetSizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeButton,
                    carpetSize === size.id && styles.selectedSizeButton
                  ]}
                  onPress={() => setCarpetSize(size.id)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    carpetSize === size.id && styles.selectedSizeButtonText
                  ]}>
                    {size.name}
                  </Text>
                  <Text style={[
                    styles.sizeAreaText,
                    carpetSize === size.id && styles.selectedSizeAreaText
                  ]}>
                    {size.area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>Number of Carpets</Text>
            <View style={styles.countSelector}>
              <TouchableOpacity
                style={styles.countButton}
                onPress={decreaseCount}
                disabled={carpetCount <= 1}
              >
                <SafeIcon name="remove" size={24} color={carpetCount <= 1 ? "#A5D6A7" : "#556B2F"} />
              </TouchableOpacity>

              <View style={styles.countDisplay}>
                <Text style={styles.countText}>{carpetCount}</Text>
                <Text style={styles.countUnit}>carpet{carpetCount > 1 ? 's' : ''}</Text>
              </View>

              <TouchableOpacity
                style={styles.countButton}
                onPress={increaseCount}
                disabled={carpetCount >= 5}
              >
                <SafeIcon name="add" size={24} color={carpetCount >= 5 ? "#A5D6A7" : "#556B2F"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date & Time Selection */}
        <Text style={styles.sectionTitle}>Schedule Service</Text>
        <View style={styles.datetimeContainer}>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Date</Text>
            <TouchableOpacity
              style={styles.datetimeInput}
              onPress={showDatepicker}
            >
              <Text style={styles.datetimeText}>{formattedDate}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Time</Text>
            <TouchableOpacity
              style={styles.datetimeInput}
              onPress={showTimepicker}
            >
              <Text style={styles.datetimeText}>{formattedTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number *"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter full address for service *"
            value={address}
            onChangeText={setAddress}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.noteText}>
            Our carpet cleaning expert will visit your address at the scheduled time
          </Text>
        </View>

        {/* Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Service Summary</Text>

            {selectedServices.map((service, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  • {service.name}
                </Text>
                <Text style={styles.summaryValue}>Rs.{calculateServicePrice(service)} × {carpetCount}</Text>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Carpet Type</Text>
              <Text style={styles.summaryValue}>{carpetType || 'Not selected'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Carpet Size</Text>
              <Text style={styles.summaryValue}>
                {carpetSizes.find(s => s.id === carpetSize)?.name || 'Not selected'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Scheduled Time</Text>
              <Text style={styles.summaryValue}>{formattedDate} at {formattedTime}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>Rs.{totalPrice}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (selectedServices.length === 0 || !phoneNumber || !address.trim() || !carpetType || !carpetSize || bookingLoading) && styles.disabledButton
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || !address.trim() || !carpetType || !carpetSize || bookingLoading}
        >
          <Text style={styles.bookButtonText}>
            {bookingLoading
              ? 'Booking...'
              : selectedServices.length > 0
              ? `Book Now - Rs.${totalPrice}`
              : 'Select Services'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderDateTimePicker()}
    </SafeAreaView>
  );
}

const getTypeColor = (/** @type {string} */ type) => {
  switch(type) {
    case 'basic': return '#556B2F';
    case 'deep': return '#6B8E23';
    case 'premium': return '#9ACD32';
    case 'stain': return '#7CFC00';
    case 'sanitization': return '#98FB98';
    case 'deodorizing': return '#90EE90';
    default: return '#556B2F';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF0',
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
    backgroundColor: '#556B2F',
  },
  backButtonContainer: {
    padding: 4,
  },
  backButton: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E4D2E',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B8E23',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectCount: {
    fontSize: 14,
    color: '#556B2F',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#556B2F',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#C62828',
    textAlign: 'center',
  },
  servicesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C5E1A5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceCard: {
    borderColor: '#556B2F',
    backgroundColor: '#F1F8E9',
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E4D2E',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  serviceIncludes: {
    fontSize: 13,
    color: '#558B2F',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#556B2F',
    marginRight: 8,
  },
  serviceDuration: {
    fontSize: 13,
    color: '#78909C',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#556B2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  unselectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#556B2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  carpetDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E4D2E',
    marginBottom: 10,
  },
  typeScroll: {
    flexGrow: 0,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },
  selectedTypeButton: {
    backgroundColor: '#556B2F',
    borderColor: '#556B2F',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#556B2F',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  sizeContainer: {
    marginBottom: 16,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E4D2E',
    marginBottom: 10,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeButton: {
    width: '48%',
    backgroundColor: '#F1F8E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C5E1A5',
    alignItems: 'center',
  },
  selectedSizeButton: {
    backgroundColor: '#556B2F',
    borderColor: '#556B2F',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#556B2F',
  },
  selectedSizeButtonText: {
    color: '#FFFFFF',
  },
  sizeAreaText: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 4,
  },
  selectedSizeAreaText: {
    color: '#C8E6C9',
  },
  countContainer: {
    marginTop: 8,
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E4D2E',
    marginBottom: 10,
  },
  countSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countDisplay: {
    width: 80,
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E4D2E',
  },
  countUnit: {
    fontSize: 12,
    color: '#78909C',
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  datetimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  datetimeLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 8,
  },
  datetimeInput: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C5E1A5',
  },
  datetimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E4D2E',
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#C5E1A5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2E4D2E',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  noteText: {
    fontSize: 12,
    color: '#78909C',
    fontStyle: 'italic',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E4D2E',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#558B2F',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E4D2E',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#C5E1A5',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E4D2E',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#556B2F',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#C5E1A5',
  },
  bookButton: {
    backgroundColor: '#556B2F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  iosPicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#556B2F',
    fontWeight: '600',
  },
  modalDoneButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#556B2F',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

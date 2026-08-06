import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { PlumbingScreenStyles } from '../screens/Styles';
import {
  useGetPlumbingServicesQuery,
  useCreatePlumbingBookingMutation,
} from '../api/services/plumbingServiceApi';

// Conditional imports to avoid TypeScript/web errors
/** @type {any} */
let DateTimePicker;
/** @type {any} */
let MaterialIcons;

if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
}

export default function PlumbingScreen() {
  const navigation = useNavigation();

  // ─── Form State ───────────────────────────────────────────────────────────
  const [selectedServices, setSelectedServices] = useState(
    /** @type {Array<{id: number | string, name: string, price: number, duration: string, includes: string, type: string}>} */ ([])
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [plumbingType, setPlumbingType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(() => {
    const t = new Date();
    t.setHours(15, 0, 0, 0);
    return t;
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
  } = useGetPlumbingServicesQuery({});

  const [createPlumbingBooking, { isLoading: bookingLoading }] = useCreatePlumbingBookingMutation();

  // Plumbing Types
  const plumbingTypes = [
    'Leak Repair',
    'Pipe Fitting',
    'Tap Repair',
    'Drain Cleaning',
    'Toilet Repair',
    'Water Heater',
    'Motor/Pump',
    'Bathroom Fitting',
  ];

  // Fallback static services used when API is unavailable
  const STATIC_SERVICES = [
    {
      id: 1,
      name: 'Basic Plumbing Inspection',
      price: 299,
      duration: '30 mins',
      includes: 'Leak inspection, pipe check, basic diagnosis',
      type: 'inspection',
    },
    {
      id: 2,
      name: 'Tap & Faucet Repair',
      price: 399,
      duration: '1 hour',
      includes: 'Washer replacement, leak fixing, tap cleaning',
      type: 'repair',
    },
    {
      id: 3,
      name: 'Pipe Leak Repair',
      price: 599,
      duration: '1.5 hours',
      includes: 'Pipe sealing, joint repair, pressure testing',
      type: 'repair',
    },
    {
      id: 4,
      name: 'Drain Cleaning',
      price: 499,
      duration: '1 hour',
      includes: 'Clog removal, drain flushing, deodorizing',
      type: 'cleaning',
    },
    {
      id: 5,
      name: 'Toilet Repair',
      price: 699,
      duration: '1.5 hours',
      includes: 'Flush repair, seat fitting, leak fixing',
      type: 'repair',
    },
    {
      id: 6,
      name: 'Water Heater Service',
      price: 799,
      duration: '2 hours',
      includes: 'Heater inspection, element check, basic repair',
      type: 'maintenance',
    },
    {
      id: 7,
      name: 'Motor/Pump Repair',
      price: 899,
      duration: '2 hours',
      includes: 'Motor diagnosis, wiring check, basic repair',
      type: 'repair',
    },
    {
      id: 8,
      name: 'Bathroom Fitting Installation',
      price: 999,
      duration: '2.5 hours',
      includes: 'New fittings, shower installation, accessories',
      type: 'installation',
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
      price: s.price ?? s.basePrice ?? 0,
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

  // Calculate total price
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

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
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices((prev) => [...prev, service]);
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
        category: 'plumbing',
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
    // ── Validation ──────────────────────────────────────────────────────────
    if (selectedServices.length === 0) return Alert.alert('Select Service', 'Please select at least one service.');
    if (!phoneNumber) return Alert.alert('Phone Required', 'Please enter your phone number.');
    if (phoneNumber.length < 10) return Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
    if (!address.trim()) return Alert.alert('Address Required', 'Please enter your address for service.');
    if (!plumbingType) return Alert.alert('Plumbing Type Required', 'Please select the type of plumbing issue.');

    // ── Build scheduled time string (HH:mm) ─────────────────────────────────
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const scheduledTimeStr = `${hh}:${mm}`;

    // ── Build ISO date (date only, midnight UTC) ─────────────────────────────
    const scheduledDateISO = moment(date).startOf('day').toISOString();

    // ── Build request body matching PlumbingBookingCreateDTOs ────────────────
    const requestBody = {
      serviceIds: selectedServices.map((s) => s.id),
      customerPhone: phoneNumber,
      customerAddress: address.trim(),
      plumbingType,
      issueDescription: issueDescription.trim() || null,
      scheduledDate: scheduledDateISO,
      scheduledTime: scheduledTimeStr,
      specialInstructions: '',
    };

    try {
      const result = await createPlumbingBooking(requestBody).unwrap();
      console.log('Plumbing Booking API result:', JSON.stringify(result, null, 2));

      const bookingRef = result?.bookingId || result?.id || null;

      const bookingData = {
        services: selectedServices,
        phone: phoneNumber,
        address,
        plumbingType,
        issueDescription,
        category: 'Plumbing',
        date: formattedDate,
        time: formattedTime,
        totalPrice,
      };
      await saveBookingToHistory(bookingData, result);

      Alert.alert(
        'Booking Confirmed!',
        `Your plumbing booking has been placed successfully.\n\nRef: ${bookingRef || 'N/A'}\nDate: ${formattedDate} at ${formattedTime}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Plumbing Booking Error:', err);
      const error = /** @type {any} */ (err);
      const msg = error?.data?.message || error?.error || 'Failed to create booking. Please try again.';
      Alert.alert('Booking Failed', msg);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
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

  const styles = PlumbingScreenStyles;

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
      <StatusBar backgroundColor="#1E5AA8" barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plumbing Services</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Plumbing Services</Text>
          <Text style={styles.selectCount}>
            {selectedServices.length} selected
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>Professional plumbing repair & installation:</Text>

        {/* Loading / Error / List */}
        {servicesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E5AA8" />
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
            const isSelected = selectedServices.some((s) => s.id === service.id);

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
                    <Text style={styles.servicePrice}>Rs.{service.price}</Text>
                    <Text style={styles.serviceDuration}>- {service.duration}</Text>
                  </View>
                </View>
                {isSelected ? (
                  <View style={styles.selectedIndicator}>
                    <SafeIcon name="check" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <SafeIcon name="add" size={20} color="#1E5AA8" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Plumbing Details */}
        <Text style={styles.sectionTitle}>Issue Details</Text>
        <View style={styles.plumbingDetailsContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Plumbing Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {plumbingTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    plumbingType === type && styles.selectedTypeButton
                  ]}
                  onPress={() => setPlumbingType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    plumbingType === type && styles.selectedTypeButtonText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue (optional)"
            value={issueDescription}
            onChangeText={setIssueDescription}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
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
            Our plumbing expert will visit your address at the scheduled time
          </Text>
        </View>

        {/* Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Service Summary</Text>

            {selectedServices.map((service, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  - {service.name}
                </Text>
                <Text style={styles.summaryValue}>Rs.{service.price}</Text>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plumbing Type</Text>
              <Text style={styles.summaryValue}>{plumbingType || 'Not selected'}</Text>
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
            (selectedServices.length === 0 || !phoneNumber || !address.trim() || !plumbingType || bookingLoading) && styles.disabledButton
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || !address.trim() || !plumbingType || bookingLoading}
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
    case 'inspection': return '#1E5AA8';
    case 'repair': return '#1565C0';
    case 'cleaning': return '#0277BD';
    case 'maintenance': return '#00838F';
    case 'installation': return '#00695C';
    default: return '#1E5AA8';
  }
};

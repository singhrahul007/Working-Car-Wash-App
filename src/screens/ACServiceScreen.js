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
import { ACServiceScreenStyles } from '../screens/Styles/index';
import {
  useGetAcServicesQuery,
  useCreateAcBookingMutation,
} from '../api/services/acServiceApi';

// Conditional imports to avoid TypeScript errors
let DateTimePicker;
let MaterialIcons;

if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
}

// Fallback static services used when API is unavailable
const STATIC_SERVICES = [
  { id: 1, name: 'AC General Service', price: 599, duration: '1.5 hours', category: 'Maintenance', includes: '• Air filter cleaning\n• Indoor unit basic cleaning\n• Drain pipe flushing\n• Gas pressure check' },
  { id: 2, name: 'AC Deep Cleaning', price: 899, duration: '2 hours', category: 'Maintenance', includes: '• Complete indoor unit dismantling\n• Deep cleaning of cooling coils\n• Blower and fan cleaning' },
  { id: 3, name: 'AC Gas Charging', price: 1299, duration: '2 hours', category: 'Repair', includes: '• Gas leakage detection\n• Refrigerant gas refilling\n• Pressure and temperature testing' },
  { id: 4, name: 'AC Repair & Troubleshooting', price: 399, duration: '1 hour', category: 'Repair', includes: '• Complete AC inspection\n• Electrical and mechanical diagnosis' },
  { id: 5, name: 'AC Installation', price: 1499, duration: '3 hours', category: 'Installation', includes: '• Indoor unit wall mounting\n• Outdoor unit placement\n• Gas leakage test' },
  { id: 6, name: 'AC Uninstallation', price: 699, duration: '1.5 hours', category: 'Installation', includes: '• Safe gas recovery\n• Indoor/outdoor unit removal' },
  { id: 7, name: 'Annual Maintenance Contract (AMC)', price: 2999, duration: '12 months', category: 'Maintenance', includes: '• 4 scheduled general services\n• Priority service support' },
  { id: 8, name: 'Water Leakage Issue', price: 499, duration: '1 hour', category: 'Repair', includes: '• Drain pipe blockage inspection\n• Water leakage source identification' },
  { id: 9, name: 'Cooling Issue', price: 499, duration: '1 hour', category: 'Repair', includes: '• Gas level and pressure check\n• Airflow and filter inspection' },
  { id: 10, name: 'Noise & Vibration Issue', price: 499, duration: '1 hour', category: 'Repair', includes: '• Fan and motor inspection\n• Mounting and screw tightening' },
];

export default function ACServiceScreen() {
  const navigation = useNavigation();

  // ─── Form State ───────────────────────────────────────────────────────────
  const [selectedServices, setSelectedServices] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [acType, setAcType] = useState('');
  const [acBrand, setAcBrand] = useState('');
  const [acCapacity, setAcCapacity] = useState('');
  const [usageType, setUsageType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // ─── Date / Time State ────────────────────────────────────────────────────
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
  } = useGetAcServicesQuery({});

  const [createAcBooking, { isLoading: bookingLoading }] = useCreateAcBookingMutation();

  // Normalize API response: support both array and { data: [...] } shapes
  const services = React.useMemo(() => {
    if (!apiServicesData) return STATIC_SERVICES;
    const raw = Array.isArray(apiServicesData)
      ? apiServicesData
      : apiServicesData.data || apiServicesData.services || [];
    if (raw.length === 0) return STATIC_SERVICES;
    // Map API fields to local shape
    return raw.map((s) => ({
      id: s.id,
      name: s.name || s.serviceName,
      price: s.price ?? s.basePrice ?? 0,
      duration: s.duration || s.estimatedDuration || '--',
      category: s.category || s.serviceCategory || 'General',
      includes: s.description || s.includes || '',
    }));
  }, [apiServicesData]);

  // ─── Options ─────────────────────────────────────────────────────────────
  const acTypes = ['Split AC', 'Window AC', 'Cassette AC', 'Tower AC', 'Portable AC'];
  const acBrands = ['LG', 'Samsung', 'Voltas', 'Daikin', 'Hitachi', 'Blue Star', 'Carrier', 'Other'];
  const acCapacities = ['0.8 Ton', '1 Ton', '1.2 Ton', '1.5 Ton', '2 Ton', '2.5 Ton', '3 Ton', 'More than 3 Ton'];
  const usageTypes = ['Residential', 'Commercial'];

  // ─── Derived ─────────────────────────────────────────────────────────────
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // ─── Date/Time Formatting Effects ────────────────────────────────────────
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) setFormattedDate('Today');
    else if (date.toDateString() === tomorrow.toDateString()) setFormattedDate('Tomorrow');
    else setFormattedDate(moment(date).format('DD MMM YYYY'));
  }, [date]);

  useEffect(() => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes < 10 ? `0${minutes}` : minutes;
    setFormattedTime(`${h}:${m} ${ampm}`);
  }, [time]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const showDatepicker = () => { setCurrentPickerValue(date); setPickerMode('date'); setShowPicker(true); };
  const showTimepicker = () => { setCurrentPickerValue(time); setPickerMode('time'); setShowPicker(true); };

  const onChange = (event, selectedValue) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedValue) {
        pickerMode === 'date' ? setDate(selectedValue) : setTime(selectedValue);
      }
    } else {
      if (selectedValue) setCurrentPickerValue(selectedValue);
    }
  };

  const handleServiceSelect = (service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    setSelectedServices((prev) =>
      isSelected ? prev.filter((s) => s.id !== service.id) : [...prev, service]
    );
  };

  /** Persist booking locally for the Orders screen */
  const saveBookingToHistory = async (bookingData, apiResponse) => {
    try {
      const existing = await AsyncStorage.getItem('@carwash_bookings');
      const bookings = existing ? JSON.parse(existing) : [];
      // Backend wraps response in { success, data: { bookingId, id, ... } }
      const bookingPayload = apiResponse?.data || apiResponse;
      const newBooking = {
        id: bookingPayload?.id || Date.now(),
        bookingReference: bookingPayload?.bookingId || null,
        ...bookingData,
        category: 'ac-service',
        status: 'Confirmed',
        bookingDate: new Date().toISOString(),
      };
      bookings.unshift(newBooking);
      await AsyncStorage.setItem('@carwash_bookings', JSON.stringify(bookings));
    } catch (err) {
      console.warn('Error saving booking to local history:', err);
    }
  };

  const handleBookNow = async () => {
    // ── Validation ──────────────────────────────────────────────────────────
    if (selectedServices.length === 0) return Alert.alert('Select Service', 'Please select at least one service.');
    if (!phoneNumber) return Alert.alert('Phone Required', 'Please enter your phone number.');
    if (phoneNumber.length < 10) return Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
    if (!address.trim()) return Alert.alert('Address Required', 'Please enter your address for service.');
    if (!acType) return Alert.alert('AC Type Required', 'Please select your AC type.');

    // ── Build scheduled time string (HH:mm) ─────────────────────────────────
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const scheduledTimeStr = `${hh}:${mm}`;

    // ── Build ISO date (date only, midnight UTC) ─────────────────────────────
    const scheduledDateISO = moment(date).startOf('day').toISOString();

    // ── Build request body matching ACBookingCreateDTOs ──────────────────────
    const requestBody = {
      serviceIds: selectedServices.map((s) => s.id),
      customerPhone: phoneNumber,
      customerAddress: address.trim(),
      acType,
      acBrand: acBrand || null,
      acCapacity: acCapacity || null,
      usageType: usageType || null,
      scheduledDate: scheduledDateISO,
      scheduledTime: scheduledTimeStr,
      specialInstructions: specialInstructions.trim() || null,
    };

    try {
      const result = await createAcBooking(requestBody).unwrap();
      console.log('✅ AC Booking API result:', JSON.stringify(result, null, 2));

      // transformResponse already unwraps data to the top level, so read directly from result
      // result.bookingId is the human-readable reference (e.g. "AC2605065558")
      const bookingRef = result?.bookingId || result?.id || null;

      const bookingData = {
        services: selectedServices,
        phone: phoneNumber,
        address,
        acType,
        acBrand: acBrand || 'Not specified',
        acCapacity: acCapacity || 'Not specified',
        usageType: usageType || 'Not specified',
        category: 'AC Services',
        date: formattedDate,
        time: formattedTime,
        totalPrice,
      };
      await saveBookingToHistory(bookingData, result);

      Alert.alert(
        '✅ Booking Confirmed!',
        `Your AC service booking has been placed successfully.\n\nRef: ${bookingRef || 'N/A'}\nDate: ${formattedDate} at ${formattedTime}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('AC Booking Error:', err);
      const msg = err?.data?.message || err?.error || 'Failed to create booking. Please try again.';
      Alert.alert('Booking Failed', msg);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const SafeDateTimePicker = ({ value, mode, display, onChange: onCh, minimumDate, style = undefined }) => {
    if (!DateTimePicker) return null;
    const props = { value, mode: mode === 'date' ? 'date' : 'time', display, onChange: onCh, minimumDate };
    if (style) props.style = style;
    return React.createElement(DateTimePicker, props);
  };

  const SafeIcon = ({ name, size, color }) => {
    if (!MaterialIcons) return null;
    return React.createElement(MaterialIcons, { name, size, color });
  };

  const styles = ACServiceScreenStyles;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AC Services</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select AC Services</Text>
          <Text style={styles.selectCount}>{selectedServices.length} selected</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Professional AC repair, service & installation:</Text>

        {/* Loading / Error / List */}
        {servicesLoading ? (
          <View style={{ alignItems: 'center', padding: 24 }}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={{ marginTop: 8, color: '#555' }}>Loading services…</Text>
          </View>
        ) : servicesError ? (
          <View style={{ padding: 16, backgroundColor: '#FFF3E0', borderRadius: 8, margin: 16 }}>
            <Text style={{ color: '#E65100', textAlign: 'center' }}>
              ⚠️ Could not load services from server. Showing default services.
            </Text>
          </View>
        ) : null}

        <View style={styles.servicesContainer}>
          {services.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, isSelected && styles.selectedServiceCard]}
                onPress={() => handleServiceSelect(service)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceContent}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {!!service.includes && (
                    <Text style={styles.serviceIncludes}>{service.includes}</Text>
                  )}
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>Rs.{service.price}</Text>
                    {!!service.duration && (
                      <Text style={styles.serviceDuration}>• {service.duration}</Text>
                    )}
                  </View>
                </View>
                {isSelected ? (
                  <View style={styles.selectedIndicator}>
                    <SafeIcon name="check" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <SafeIcon name="add" size={20} color="#1E88E5" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AC Information */}
        <Text style={styles.sectionTitle}>AC Information</Text>
        <View style={styles.acDetailsContainer}>
          {/* AC Type */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, acType === type && styles.selectedTypeButton]}
                  onPress={() => setAcType(type)}
                >
                  <Text style={[styles.typeButtonText, acType === type && styles.selectedTypeButtonText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AC Brand */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Brand (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acBrands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[styles.brandButton, acBrand === brand && styles.selectedBrandButton]}
                  onPress={() => setAcBrand(brand)}
                >
                  <Text style={[styles.brandButtonText, acBrand === brand && styles.selectedBrandButtonText]}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AC Capacity */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Capacity (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acCapacities.map((capacity) => (
                <TouchableOpacity
                  key={capacity}
                  style={[styles.capacityButton, acCapacity === capacity && styles.selectedCapacityButton]}
                  onPress={() => setAcCapacity(capacity)}
                >
                  <Text style={[styles.capacityButtonText, acCapacity === capacity && styles.selectedCapacityButtonText]}>{capacity}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Usage Type */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Usage Type (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {usageTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.usageButton, usageType === type && styles.selectedUsageButton]}
                  onPress={() => setUsageType(type)}
                >
                  <Text style={[styles.usageButtonText, usageType === type && styles.selectedUsageButtonText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Schedule Service */}
        <Text style={styles.sectionTitle}>Schedule Service</Text>
        <View style={styles.datetimeContainer}>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Date</Text>
            <TouchableOpacity style={styles.datetimeInput} onPress={showDatepicker}>
              <Text style={styles.datetimeText}>{formattedDate}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Time</Text>
            <TouchableOpacity style={styles.datetimeInput} onPress={showTimepicker}>
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
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Special instructions (optional)"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
          <Text style={styles.noteText}>Our AC technician will visit your address at the scheduled time</Text>
        </View>

        {/* Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Service Summary</Text>
            {selectedServices.map((service, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>• {service.name}</Text>
                <Text style={styles.summaryValue}>Rs.{service.price}</Text>
              </View>
            ))}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>AC Type</Text>
              <Text style={styles.summaryValue}>{acType || 'Not selected'}</Text>
            </View>
            {!!acCapacity && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>AC Capacity</Text>
                <Text style={styles.summaryValue}>{acCapacity}</Text>
              </View>
            )}
            {!!usageType && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Usage Type</Text>
                <Text style={styles.summaryValue}>{usageType}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Scheduled</Text>
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

      {/* Book Now Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (selectedServices.length === 0 || !phoneNumber || !address.trim() || !acType || bookingLoading) && styles.disabledButton,
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || !address.trim() || !acType || bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookButtonText}>
              {selectedServices.length > 0 ? `Book Now - Rs.${totalPrice}` : 'Select Services'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* DateTimePicker — Android */}
      {showPicker && Platform.OS === 'android' && (
        <SafeDateTimePicker
          value={currentPickerValue}
          mode={pickerMode}
          display="default"
          onChange={onChange}
          minimumDate={pickerMode === 'date' ? new Date() : undefined}
        />
      )}

      {/* DateTimePicker — iOS Modal */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
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
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => {
                    pickerMode === 'date' ? setDate(currentPickerValue) : setTime(currentPickerValue);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

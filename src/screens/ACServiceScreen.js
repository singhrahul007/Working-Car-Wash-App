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
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACServiceScreenStyles } from '../screens/Styles/index';

// Conditional imports to avoid TypeScript errors
let DateTimePicker;
let MaterialIcons;

if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
}

export default function ACServiceScreen() {
  const navigation = useNavigation();
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [acType, setAcType] = useState('');
  const [acBrand, setAcBrand] = useState('');
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
  const [acCapacity, setAcCapacity] = useState('');
  const [usageType, setUsageType] = useState('');

  // AC Services
const services = [
  {
    id: 1,
    name: 'AC General Service',
    price: 599,
    duration: '1.5 hours',
    category: 'Maintenance',
    includes: `
• Air filter cleaning
• Indoor unit basic cleaning
• Outdoor unit surface cleaning
• Drain pipe flushing
• Gas pressure check
• Performance test after service
`
  },
  {
    id: 2,
    name: 'AC Deep Cleaning',
    price: 899,
    duration: '2 hours',
    category: 'Maintenance',
    includes: `
• Complete indoor unit dismantling
• Deep cleaning of cooling coils
• Blower and fan cleaning
• Outdoor unit deep cleaning
• Drain tray and pipe cleaning
• Final cooling efficiency test
`
  },
  {
    id: 3,
    name: 'AC Gas Charging',
    price: 1299,
    duration: '2 hours',
    category: 'Repair',
    includes: `
• Gas level inspection
• Gas leakage detection
• Vacuuming of system (if required)
• Refrigerant gas refilling
• Pressure and temperature testing
• Cooling performance verification
`
  },
  {
    id: 4,
    name: 'AC Repair & Troubleshooting',
    price: 399,
    duration: '1 hour',
    category: 'Repair',
    includes: `
• Complete AC inspection
• Identification of fault or issue
• Electrical and mechanical diagnosis
• Minor adjustments (if possible)
• Repair cost estimation
• Repair charges extra if approved
`
  },
  {
    id: 5,
    name: 'AC Installation',
    price: 1499,
    duration: '3 hours',
    category: 'Installation',
    includes: `
• Indoor unit wall mounting
• Outdoor unit placement and fixing
• Copper pipe connection
• Drain pipe setup
• Electrical wiring connection
• Gas leakage test
• Final installation and performance test
`
  },
  {
    id: 6,
    name: 'AC Uninstallation',
    price: 699,
    duration: '1.5 hours',
    category: 'Installation',
    includes: `
• Safe gas recovery (if required)
• Indoor unit removal
• Outdoor unit dismantling
• Pipe and wire removal
• Basic packing support
• Damage-free uninstallation
`
  },
  {
    id: 7,
    name: 'Annual Maintenance Contract (AMC)',
    price: 2999,
    duration: '12 months',
    category: 'Maintenance',
    includes: `
• 4 scheduled general services in a year
• Filter and coil cleaning
• Gas pressure check in every visit
• Priority service support
• Discounted repair charges
• Extended AC life and efficiency
`
  },
  {
    id: 8,
    name: 'Water Leakage Issue',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
• Drain pipe blockage inspection
• Drain pipe cleaning and flushing
• Drain tray cleaning
• Water leakage source identification
• Basic pipe alignment correction
• Leakage prevention testing
`
  },
  {
    id: 9,
    name: 'Cooling Issue',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
• AC not cooling properly
• AC blowing warm air
• Uneven cooling in the room
• Low cooling even at low temperature
• Gas level and pressure check
• Airflow and filter inspection
• Cooling performance diagnosis
`
  },
  {
    id: 10,
    name: 'Noise & Vibration Issue',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
• Indoor unit noise inspection
• Outdoor unit vibration check
• Fan and motor inspection
• Mounting and screw tightening
• Noise source identification
• Smooth operation testing
`
  },
  {
    id: 11,
    name: 'Power / Electrical Issue',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
          • AC not turning ON inspection
          • Power fluctuation check
          • Wiring and socket inspection
          • Capacitor testing
          • PCB and control board diagnosis
          • Electrical safety check
          `
  },
  {
    id: 12,
    name: 'Airflow Issue',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
          • Weak or no airflow issue
          • Air filter inspection
          • Blower and fan cleaning check
          • Vent and louver inspection
          • Air circulation testing
          • Cooling airflow optimization
          `
  },
  {
    id: 13,
    name: 'Other AC Issues',
    price: 499,
    duration: '1 hour',
    category: 'Repair',
    includes: `
                • Any unidentified AC issue
                • Complete AC diagnosis
                • Mechanical or electrical inspection
                • Issue explanation to customer
                • Repair estimate sharing
                • Repair charges extra if applicable
                `
  }
];


  // AC Types
  const acTypes = ['Split AC', 'Window AC', 'Cassette AC', 'Tower AC', 'Portable AC'];
  const acBrands = ['LG', 'Samsung', 'Voltas', 'Daikin', 'Hitachi', 'Blue Star', 'Carrier', 'Other'];
  const acCapacities = ['0.8 Ton', '1 Ton', '1.2 Ton', '1.5 Ton', '2 Ton', '2.5 Ton', '3 Ton', 'More than 3 Ton'];
  const usageTypes = ['Residential', 'Commercial'];

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

  const onChange = (event, selectedValue) => {
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

  const handleServiceSelect = (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const saveBookingToHistory = async (bookingData) => {
    try {
      const existingBookings = await AsyncStorage.getItem('@carwash_bookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      
      const newBooking = {
        id: Date.now(),
        ...bookingData,
        category: 'ac-service',
        status: 'Confirmed',
        bookingDate: new Date().toISOString(),
      };
      
      bookings.unshift(newBooking);
      await AsyncStorage.setItem('@carwash_bookings', JSON.stringify(bookings));
    } catch (error) {
      console.log('Error saving booking:', error);
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

    if (!acType) {
      Alert.alert('AC Type Required', 'Please select your AC type.');
      return;
    }

    // Save booking to history
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
      status: 'Confirmed'
    };

    await saveBookingToHistory(bookingData);

    // Navigate to OTP screen
    // navigation.navigate('Otp', {
    //   phone: phoneNumber,
    //   services: selectedServices,
    //   category: 'AC Services',
    //   address,
    //   acType,
    //   acBrand,
    //   acCapacity,
    //   usageType,
    //   date: formattedDate,
    //   time: formattedTime,
    //   totalPrice
    // });
  };

  // Helper function to safely use DateTimePicker
  const SafeDateTimePicker = ({ value, mode, display, onChange, minimumDate, style }) => {
    if (!DateTimePicker) return null;
    
    // Create a safe mode value that TypeScript won't complain about
    const safeMode = mode === 'date' ? 'date' : 'time';
    
    const props = {
      value,
      mode: safeMode,
      display,
      onChange,
      minimumDate,
    };
    
    // Only add style prop if it exists (for iOS)
    if (style) {
      props.style = style;
    }
    
    return React.createElement(DateTimePicker, props);
  };

  // Helper function to safely use MaterialIcons
  const SafeIcon = ({ name, size, color }) => {
    if (!MaterialIcons) return null;
    
    return React.createElement(MaterialIcons, {
      name: name,
      size: size,
      color: color
    });
  };
  const styles = ACServiceScreenStyles;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AC Services</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select AC Services</Text>
          <Text style={styles.selectCount}>
            {selectedServices.length} selected
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>Professional AC repair, service & installation:</Text>
        
        <View style={styles.servicesContainer}>
          {services.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            
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
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceIncludes}>{service.includes}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>Rs.{service.price}</Text>
                    <Text style={styles.serviceDuration}>• {service.duration}</Text>
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

        {/* AC Details */}
        <Text style={styles.sectionTitle}>AC Information</Text>
        <View style={styles.acDetailsContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    acType === type && styles.selectedTypeButton
                  ]}
                  onPress={() => setAcType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    acType === type && styles.selectedTypeButtonText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Brand (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acBrands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.brandButton,
                    acBrand === brand && styles.selectedBrandButton
                  ]}
                  onPress={() => setAcBrand(brand)}
                >
                  <Text style={[
                    styles.brandButtonText,
                    acBrand === brand && styles.selectedBrandButtonText
                  ]}>
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>AC Capacity (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {acCapacities.map((capacity) => (
                <TouchableOpacity
                  key={capacity}
                  style={[
                    styles.capacityButton,
                    acCapacity === capacity && styles.selectedCapacityButton
                  ]}
                  onPress={() => setAcCapacity(capacity)}
                >
                  <Text style={[
                    styles.capacityButtonText,
                    acCapacity === capacity && styles.selectedCapacityButtonText
                  ]}>
                    {capacity}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Usage Type (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {usageTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.usageButton,
                    usageType === type && styles.selectedUsageButton
                  ]}
                  onPress={() => setUsageType(type)}
                >
                  <Text style={[
                    styles.usageButtonText,
                    usageType === type && styles.selectedUsageButtonText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            Our AC technician will visit your address at the scheduled time
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
                <Text style={styles.summaryValue}>Rs.{service.price}</Text>
              </View>
            ))}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>AC Type</Text>
              <Text style={styles.summaryValue}>{acType || 'Not selected'}</Text>
            </View>
            
            {acCapacity && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>AC Capacity</Text>
                <Text style={styles.summaryValue}>{acCapacity}</Text>
              </View>
            )}
            
            {usageType && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Usage Type</Text>
                <Text style={styles.summaryValue}>{usageType}</Text>
              </View>
            )}
            
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
            (selectedServices.length === 0 || !phoneNumber || !address.trim() || !acType) && styles.disabledButton
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || !address.trim() || !acType}
        >
          <Text style={styles.bookButtonText}>
            {selectedServices.length > 0
              ? `Book Now - Rs.${totalPrice}`
              : 'Select Services'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePicker for Android */}
      {showPicker && Platform.OS === 'android' && (
        <SafeDateTimePicker
          value={currentPickerValue}
          mode={pickerMode}
          display="default"
          onChange={onChange}
          minimumDate={pickerMode === 'date' ? new Date() : undefined}
        />
      )}

      {/* DateTimePicker Modal for iOS */}
      {Platform.OS === 'ios' && showPicker && (
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
      )}
    </SafeAreaView>
  );
}


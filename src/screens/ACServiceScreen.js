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
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // AC Services
  const services = [
    { id: 1, name: 'AC General Service', price: 599, duration: '1.5 hours', includes: 'Cleaning, Gas Check, Filter Wash' },
    { id: 2, name: 'AC Deep Cleaning', price: 899, duration: '2 hours', includes: 'Complete Unit Cleaning, Coil Cleaning' },
    { id: 3, name: 'AC Gas Charging', price: 1299, duration: '2 hours', includes: 'Gas Refill, Pressure Check' },
    { id: 4, name: 'AC Repair & Troubleshooting', price: 399, duration: '1 hour', includes: 'Diagnosis, Minor Repairs' },
    { id: 5, name: 'AC Installation', price: 1499, duration: '3 hours', includes: 'New AC Setup, Testing' },
    { id: 6, name: 'AC Uninstallation', price: 699, duration: '1.5 hours', includes: 'Safe Removal, Packing' },
    { id: 7, name: 'Annual Maintenance Contract', price: 2999, duration: 'Yearly', includes: '4 Services in 1 Year' },
    { id: 8, name: 'Water Leakage Repair', price: 499, duration: '1 hour', includes: 'Drainage Cleaning, Pipe Repair' },
  ];

  // AC Types
  const acTypes = ['Split AC', 'Window AC', 'Cassette AC', 'Tower AC', 'Portable AC'];
  const acBrands = ['LG', 'Samsung', 'Voltas', 'Daikin', 'Hitachi', 'Blue Star', 'Carrier', 'Other'];

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
      category: 'AC Services',
      date: formattedDate,
      time: formattedTime,
      totalPrice,
      status: 'Confirmed'
    };

    await saveBookingToHistory(bookingData);

    // Navigate to OTP screen
    navigation.navigate('Otp', {
      phone: phoneNumber,
      services: selectedServices,
      category: 'AC Services',
      address,
      acType,
      acBrand,
      date: formattedDate,
      time: formattedTime,
      totalPrice
    });
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
              <DateTimePicker
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
          <DateTimePicker
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
                    <Icon name="check" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <Icon name="add" size={20} color="#1E88E5" />
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

      {renderDateTimePicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
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
    backgroundColor: '#1E88E5',
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
    color: '#1565C0',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#5C6BC0',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectCount: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '600',
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
    borderColor: '#BBDEFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceCard: {
    borderColor: '#1E88E5',
    backgroundColor: '#E3F2FD',
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  serviceIncludes: {
    fontSize: 13,
    color: '#5C6BC0',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E88E5',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#5C6BC0',
  },
  selectedIndicator: {
    backgroundColor: '#1E88E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unselectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  acDetailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#5C6BC0',
    marginBottom: 8,
    fontWeight: '500',
  },
  typeScroll: {
    flexGrow: 0,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#5C6BC0',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  brandButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  selectedBrandButton: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  brandButtonText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  selectedBrandButtonText: {
    color: '#FFFFFF',
  },
  datetimeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  datetimeCard: {
    width: '48%',
  },
  datetimeLabel: {
    fontSize: 14,
    color: '#5C6BC0',
    marginBottom: 8,
    fontWeight: '500',
  },
  datetimeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
  },
  datetimeText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '500',
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
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  iosPicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#5C6BC0',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDoneButton: {
    backgroundColor: '#1E88E5',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  noteText: {
    fontSize: 14,
    color: '#5C6BC0',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#1565C0',
    flex: 1,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1565C0',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BBDEFB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1565C0',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E88E5',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#BBDEFB',
  },
  bookButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#90CAF9',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
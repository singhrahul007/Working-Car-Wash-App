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
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCreateBookingMutation } from '../api/services/servicesApi';

export default function BookingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { vehicle = 'car' } = route.params || {};

  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();
  
  const [selectedServices, setSelectedServices] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
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

  // Services for Car Wash
  const carServices = [
    { id: 1, name: 'Basic Wash (Bucket wash)', price: 299, duration: '45 mins' },
    { id: 2, name: 'Premium Wash (Water Wash)', price: 499, duration: '1 hour' },
    { id: 3, name: 'Interior Cleaning', price: 499, duration: '1 hour' },
    { id: 4, name: 'Full Service (Water Wash + Interior)', price: 699, duration: '2 hours' },
    { id: 5, name: 'Engine Wash', price: 399, duration: '30 mins' },
    { id: 6, name: 'Waxing & Polishing', price: 899, duration: '1.5 hours' },
    { id: 7, name: 'AC Service & Cleaning', price: 799, duration: '1 hour' },
    { id: 8, name: 'Tire Shine & Cleaning', price: 199, duration: '20 mins' },
  ];

  // Services for Bike Wash
  const bikeServices = [
    { id: 1, name: 'Basic Wash (Bucket wash)', price: 99, duration: '30 mins' },
    { id: 2, name: 'Premium Wash (Water Wash)', price: 199, duration: '45 mins' },
    { id: 3, name: 'Chain Cleaning & Lubrication', price: 149, duration: '30 mins' },
    { id: 4, name: 'Complete Bike Service', price: 599, duration: '2 hours' },
    { id: 5, name: 'Engine Cleaning', price: 249, duration: '45 mins' },
    { id: 6, name: 'Polish & Wax', price: 349, duration: '1 hour' },
  ];

  // Select services based on vehicle type
  const services = vehicle === 'car' ? carServices : bikeServices;

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
      // Remove service if already selected
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      // Add service if not selected
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
        status: 'Upcoming',
        bookingDate: new Date().toISOString(),
      };
      
      bookings.unshift(newBooking); // Add to beginning
      await AsyncStorage.setItem('@carwash_bookings', JSON.stringify(bookings));
    } catch (error) {
      console.log('Error saving booking:', error);
    }
  };

  const handleBookNow = async () => {
    if (selectedServices.length === 0 || !phoneNumber) {
      Alert.alert('Incomplete Booking', 'Please select at least one service and enter your phone number.');
      return;
    }
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');

    // Build payload matching /api/bookings Booking schema
    const apiPayload = {
      bookingId: `BK${Date.now()}`,
      userId: '00000000-0000-0000-0000-000000000000', // replaced by backend from JWT
      serviceId: selectedServices[0]?.id || 1,
      vehicleType: vehicle === 'car' ? 'Car' : 'Bike',
      scheduledDate: moment(date).startOf('day').toISOString(),
      scheduledTime: `${hh}:${mm}`,
      status: 'Pending',
      subtotal: totalPrice,
      totalAmount: totalPrice,
      specialInstructions: phoneNumber,
    };

    try {
      await createBooking(apiPayload).unwrap();
    } catch (err) {
      console.warn('Booking API error (non-fatal):', err);
      // Non-fatal: proceed locally even if API fails
    }

    const bookingData = {
      services: selectedServices,
      phone: phoneNumber,
      vehicle,
      date: formattedDate,
      time: formattedTime,
      totalPrice,
      status: 'Confirmed',
    };
    await saveBookingToHistory(bookingData);

    navigation.navigate('Otp', {
      phone: phoneNumber,
      services: selectedServices,
      vehicle,
      date: formattedDate,
      time: formattedTime,
      totalPrice,
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
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book {vehicle === 'car' ? 'Car' : 'Bike'} Wash</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Service Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Services</Text>
          <Text style={styles.selectCount}>
            {selectedServices.length} selected
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>Choose one or more services:</Text>
        
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
                    <Icon name="add" size={20} color="#4A90E2" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date & Time Selection */}
        <Text style={styles.sectionTitle}>Date & Time</Text>
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

        {/* Contact Info */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="done"
          />
          <Text style={styles.noteText}>
            We'll send an OTP to verify your number
          </Text>
        </View>

        {/* Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            
            {selectedServices.map((service, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  • {service.name}
                </Text>
                <Text style={styles.summaryValue}>Rs.{service.price}</Text>
              </View>
            ))}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>
                {vehicle === 'car' ? 'Car' : 'Bike'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
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
            (selectedServices.length === 0 || !phoneNumber || bookingLoading) && styles.disabledButton
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || bookingLoading}
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

      {renderDateTimePicker()}
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
    color: '#1F2937',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectCount: {
    fontSize: 14,
    color: '#4A90E2',
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
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedIndicator: {
    backgroundColor: '#4A90E2',
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
    borderColor: '#4A90E2',
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
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  datetimeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
  },
  datetimeText: {
    fontSize: 16,
    color: '#1F2937',
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
    borderColor: '#E5E7EB',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDoneButton: {
    backgroundColor: '#4A90E2',
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
  phoneInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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
    color: '#1F2937',
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
    color: '#1F2937',
    flex: 1,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0C8FF',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
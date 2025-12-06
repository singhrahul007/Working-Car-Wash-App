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

export default function CarpetCleaningScreen() {
  const navigation = useNavigation();
  
  const [selectedServices, setSelectedServices] = useState([]);
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

  // Carpet Types
  const carpetTypes = ['Wool', 'Synthetic', 'Silk', 'Cotton', 'Olefin', 'Nylon', 'Polyester', 'Blend'];
  
  // Carpet Sizes
  const carpetSizes = [
    { id: 'small', name: 'Small', area: 'Up to 100 sq.ft', priceMultiplier: 1 },
    { id: 'medium', name: 'Medium', area: '100-200 sq.ft', priceMultiplier: 1.5 },
    { id: 'large', name: 'Large', area: '200-400 sq.ft', priceMultiplier: 2 },
    { id: 'xlarge', name: 'Extra Large', area: '400+ sq.ft', priceMultiplier: 3 }
  ];
  
  // Carpet Cleaning Services
  const services = [
    { 
      id: 1, 
      name: 'Basic Carpet Cleaning', 
      basePrice: 499, 
      duration: '1 hour', 
      includes: 'Vacuuming, Spot Cleaning, Deodorizing',
      type: 'basic'
    },
    { 
      id: 2, 
      name: 'Deep Carpet Cleaning', 
      basePrice: 799, 
      duration: '2 hours', 
      includes: 'Steam Cleaning, Stain Removal, Fabric Protection',
      type: 'deep'
    },
    { 
      id: 3, 
      name: 'Premium Carpet Cleaning', 
      basePrice: 1199, 
      duration: '3 hours', 
      includes: 'Complete Restoration, Odor Removal, UV Treatment',
      type: 'premium'
    },
    { 
      id: 4, 
      name: 'Carpet Stain Removal', 
      basePrice: 299, 
      duration: '45 mins', 
      includes: 'Targeted Stain Treatment',
      type: 'stain'
    },
    { 
      id: 5, 
      name: 'Carpet Sanitization', 
      basePrice: 399, 
      duration: '1 hour', 
      includes: 'Germ Protection, Anti-bacterial Treatment',
      type: 'sanitization'
    },
    { 
      id: 6, 
      name: 'Carpet Deodorizing', 
      basePrice: 349, 
      duration: '45 mins', 
      includes: 'Odor Neutralization, Freshness',
      type: 'deodorizing'
    },
  ];

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
  const calculateServicePrice = (service) => {
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

  const saveBookingToHistory = async (bookingData) => {
    try {
      const existingBookings = await AsyncStorage.getItem('@carwash_bookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      
      const newBooking = {
        id: Date.now(),
        ...bookingData,
        category: 'carpet-cleaning',
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

    if (!carpetType) {
      Alert.alert('Carpet Type Required', 'Please select your carpet type.');
      return;
    }

    if (!carpetSize) {
      Alert.alert('Carpet Size Required', 'Please select your carpet size.');
      return;
    }

    // Save booking to history
    const bookingData = {
      services: selectedServices.map(service => ({
        ...service,
        price: calculateServicePrice(service)
      })),
      phone: phoneNumber,
      address,
      carpetType,
      carpetSize: carpetSizes.find(s => s.id === carpetSize)?.name || carpetSize,
      carpetCount,
      category: 'Carpet Cleaning',
      date: formattedDate,
      time: formattedTime,
      totalPrice,
      status: 'Confirmed'
    };

    await saveBookingToHistory(bookingData);

    // Navigate to OTP screen
    navigation.navigate('Otp', {
      phone: phoneNumber,
      services: selectedServices.map(service => ({
        ...service,
        price: calculateServicePrice(service)
      })),
      category: 'Carpet Cleaning',
      address,
      carpetType,
      carpetSize: carpetSizes.find(s => s.id === carpetSize)?.name || carpetSize,
      carpetCount,
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
        
        <View style={styles.servicesContainer}>
          {services.map((service) => {
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
                    <Icon name="check" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator}>
                    <Icon name="add" size={20} color="#556B2F" />
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
                <Icon name="remove" size={24} color={carpetCount <= 1 ? "#A5D6A7" : "#556B2F"} />
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
                <Icon name="add" size={24} color={carpetCount >= 5 ? "#A5D6A7" : "#556B2F"} />
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
            (selectedServices.length === 0 || !phoneNumber || !address.trim() || !carpetType || !carpetSize) && styles.disabledButton
          ]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0 || !phoneNumber || !address.trim() || !carpetType || !carpetSize}
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

const getTypeColor = (type) => {
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
    color: '#6B8E23',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#556B2F',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B8E23',
  },
  selectedIndicator: {
    backgroundColor: '#556B2F',
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
    borderColor: '#556B2F',
  },
  carpetDetailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#6B8E23',
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
    borderColor: '#C5E1A5',
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#556B2F',
    borderColor: '#556B2F',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B8E23',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  sizeContainer: {
    marginBottom: 20,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#6B8E23',
    marginBottom: 8,
    fontWeight: '500',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5E1A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedSizeButton: {
    backgroundColor: '#556B2F',
    borderColor: '#556B2F',
  },
  sizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E4D2E',
    marginBottom: 4,
  },
  selectedSizeButtonText: {
    color: '#FFFFFF',
  },
  sizeAreaText: {
    fontSize: 12,
    color: '#6B8E23',
  },
  selectedSizeAreaText: {
    color: '#C5E1A5',
  },
  countContainer: {
    marginBottom: 16,
  },
  countLabel: {
    fontSize: 14,
    color: '#6B8E23',
    marginBottom: 8,
    fontWeight: '500',
  },
  countSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5E1A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countDisplay: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  countText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#556B2F',
  },
  countUnit: {
    fontSize: 14,
    color: '#6B8E23',
    marginTop: 4,
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
    color: '#6B8E23',
    marginBottom: 8,
    fontWeight: '500',
  },
  datetimeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5E1A5',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
  },
  datetimeText: {
    fontSize: 16,
    color: '#2E4D2E',
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
    borderColor: '#C5E1A5',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B8E23',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDoneButton: {
    backgroundColor: '#556B2F',
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
    borderColor: '#C5E1A5',
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
    color: '#6B8E23',
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
    color: '#2E4D2E',
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
    color: '#2E4D2E',
    flex: 1,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E4D2E',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#C5E1A5',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E4D2E',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#556B2F',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FFF0',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#C5E1A5',
  },
  bookButton: {
    backgroundColor: '#556B2F',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
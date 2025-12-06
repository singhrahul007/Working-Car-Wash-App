import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  TextInput 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function BookingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { vehicle = 'car' } = route.params || {};
  
  const [selectedService, setSelectedService] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('3:00 PM');

  const services = [
    { id: 1, name: 'Basic Wash (Bucket wash)', price: vehicle === 'car' ? 299 : 99, duration: '' },
    { id: 2, name: 'Premium Wash', price: vehicle === 'car' ? 499 : 199, duration: '' },
    { id: 3, name: 'Interior Cleaning', price: vehicle === 'car' ? 499 : 199, duration: '' },
    { id: 4, name: 'Full Service', price: vehicle === 'car' ? 699 : 199, duration: '' },
  ];

  const handleBookNow = () => {
    // Navigate to OTP screen or show OTP modal
    navigation.navigate('Otp', { 
      phone: phoneNumber,
      service: selectedService,
      vehicle,
      date,
      time 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book {vehicle === 'car' ? 'Car' : 'Bike'} Wash</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Service Selection */}
        <Text style={styles.sectionTitle}>Select Service</Text>
        <View style={styles.servicesContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService?.id === service.id && styles.selectedServiceCard
              ]}
              onPress={() => setSelectedService(service)}
            >
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>Rs.{service.price}</Text>
              <Text style={styles.serviceDuration}>{service.duration}</Text>
              {selectedService?.id === service.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Date & Time */}
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <View style={styles.datetimeContainer}>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Date</Text>
            <TextInput
              style={styles.datetimeInput}
              value={date}
              onChangeText={setDate}
              placeholder="Select date"
            />
          </View>
          <View style={styles.datetimeCard}>
            <Text style={styles.datetimeLabel}>Time</Text>
            <TextInput
              style={styles.datetimeInput}
              value={time}
              onChangeText={setTime}
              placeholder="Select time"
            />
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
          />
          <Text style={styles.noteText}>
            We'll send an OTP to verify your number
          </Text>
        </View>

        {/* Summary */}
        {selectedService && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{selectedService.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>
                {vehicle === 'car' ? 'Car' : 'Bike'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
              <Text style={styles.summaryValue}>{date} at {time}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>Rs.{selectedService.price}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <TouchableOpacity 
        style={[
          styles.bookButton,
          (!selectedService || !phoneNumber) && styles.disabledButton
        ]}
        onPress={handleBookNow}
        disabled={!selectedService || !phoneNumber}
      >
        <Text style={styles.bookButtonText}>
          {selectedService ? `Book Now - Rs.${selectedService.price}` : 'Select Service'}
        </Text>
      </TouchableOpacity>
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
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  servicesContainer: {
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedServiceCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4A90E2',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  datetimeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  datetimeCard: {
    width: '48%',
  },
  datetimeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  datetimeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contactContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
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
    margin: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
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
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    marginHorizontal: 16,
    marginVertical: 16,
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
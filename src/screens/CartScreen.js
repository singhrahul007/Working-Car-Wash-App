import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
  Switch,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

// Mock data with availability
const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Deep Cleaning Service',
    description: 'Complete home deep cleaning',
    price: 299.99,
    duration: '4 hours',
    quantity: 1,
    image: 'https://via.placeholder.com/80',
    availableSlots: ['09:00', '13:00', '15:00', '18:00'],
    unavailableDates: ['2024-12-25', '2024-12-31'],
    maxBookingsPerDay: 3,
  },
  {
    id: '2',
    name: 'AC Repair & Maintenance',
    description: 'Split AC service with gas refill',
    price: 599.99,
    duration: '2 hours',
    quantity: 1,
    image: 'https://via.placeholder.com/80',
    availableSlots: ['10:00', '14:00', '16:00'],
    unavailableDates: ['2024-12-24'],
    maxBookingsPerDay: 5,
  },
  {
    id: '3',
    name: 'Plumbing Service',
    description: 'Pipe repair and faucet installation',
    price: 199.99,
    duration: '1.5 hours',
    quantity: 1,
    image: 'https://via.placeholder.com/80',
    availableSlots: ['08:00', '11:00', '13:00', '15:00', '17:00'],
    unavailableDates: [],
    maxBookingsPerDay: 8,
  },
];

const MOCK_OFFERS = [
  { id: 'offer1', code: 'WELCOME25', description: '25% off on first booking', discount: 25, type: 'percentage', minAmount: 500 },
  { id: 'offer2', code: 'FLAT100', description: '₹100 off on orders above ₹1000', discount: 100, type: 'fixed', minAmount: 1000 },
  { id: 'offer3', code: 'SUMMER20', description: '20% off on AC services', discount: 20, type: 'percentage', category: 'AC', minAmount: 0 },
];

// Mock booked slots data (would come from API in real app)
const MOCK_BOOKED_SLOTS = [
  { date: '2024-12-20', serviceId: '1', slot: '09:00', count: 2 },
  { date: '2024-12-20', serviceId: '1', slot: '13:00', count: 1 },
  { date: '2024-12-20', serviceId: '2', slot: '14:00', count: 3 },
];

const CartScreen = () => {
  const [cartItems, setCartItems] = useState(MOCK_SERVICES);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [showOffers, setShowOffers] = useState(false);
  const [notes, setNotes] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Scheduling states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Availability states
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateAvailability, setDateAvailability] = useState({});
  const [timeSlotAvailability, setTimeSlotAvailability] = useState({});
  
  // Service-specific scheduling
  const [serviceSchedule, setServiceSchedule] = useState({});

  // Initialize service schedule
  useEffect(() => {
    const initialSchedule = {};
    cartItems.forEach(item => {
      initialSchedule[item.id] = {
        date: null,
        time: null,
        dateAvailable: true,
        timeSlots: [],
      };
    });
    setServiceSchedule(initialSchedule);
  }, [cartItems]);

  // Check availability when date changes
  useEffect(() => {
    if (isScheduled && selectedDate) {
      checkDateAvailability();
      if (selectedTime) {
        checkTimeSlotAvailability();
      }
    }
  }, [selectedDate, selectedTime, cartItems, isScheduled]);

  // Check if selected date is available for all services
  const checkDateAvailability = async () => {
    setLoadingSlots(true);
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    
    // Simulate API call
    setTimeout(() => {
      const availability = {};
      const slots = {};
      
      cartItems.forEach(service => {
        // Check if date is in unavailable dates
        const isDateUnavailable = service.unavailableDates.includes(formattedDate);
        
        // Get bookings for this service on selected date
        const serviceBookings = MOCK_BOOKED_SLOTS.filter(
          booking => booking.date === formattedDate && booking.serviceId === service.id
        );
        
        // Calculate available slots
        const availableServiceSlots = service.availableSlots.filter(slot => {
          const slotBooking = serviceBookings.find(b => b.slot === slot);
          return !slotBooking || slotBooking.count < service.maxBookingsPerDay;
        });
        
        availability[service.id] = !isDateUnavailable && availableServiceSlots.length > 0;
        slots[service.id] = availableServiceSlots;
      });
      
      setDateAvailability(availability);
      setAvailableSlots(slots);
      setLoadingSlots(false);
    }, 1000);
  };

  // Check specific time slot availability
  const checkTimeSlotAvailability = async () => {
    if (!selectedTime) return;
    
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    const availability = {};
    
    cartItems.forEach(service => {
      // Check if time slot is in available slots
      const isSlotAvailable = service.availableSlots.includes(selectedTime);
      
      if (isSlotAvailable) {
        // Check bookings for this specific slot
        const slotBookings = MOCK_BOOKED_SLOTS.filter(
          booking => 
            booking.date === formattedDate && 
            booking.serviceId === service.id && 
            booking.slot === selectedTime
        );
        
        const totalBookings = slotBookings.reduce((sum, b) => sum + b.count, 0);
        availability[service.id] = totalBookings < service.maxBookingsPerDay;
      } else {
        availability[service.id] = false;
      }
    });
    
    setTimeSlotAvailability(availability);
  };

  // Check individual service availability for specific date/time
  const checkServiceAvailability = (serviceId, date, time) => {
    const service = cartItems.find(s => s.id === serviceId);
    if (!service) return false;
    
    const formattedDate = moment(date).format('YYYY-MM-DD');
    
    // Check if date is unavailable
    if (service.unavailableDates.includes(formattedDate)) {
      return false;
    }
    
    // Check if time slot is available
    if (!service.availableSlots.includes(time)) {
      return false;
    }
    
    // Check bookings
    const slotBookings = MOCK_BOOKED_SLOTS.filter(
      booking => 
        booking.date === formattedDate && 
        booking.serviceId === serviceId && 
        booking.slot === time
    );
    
    const totalBookings = slotBookings.reduce((sum, b) => sum + b.count, 0);
    return totalBookings < service.maxBookingsPerDay;
  };

  // Handle date selection
  const handleDateSelect = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    
    // Update service schedule
    const updatedSchedule = { ...serviceSchedule };
    cartItems.forEach(item => {
      if (updatedSchedule[item.id]) {
        updatedSchedule[item.id].time = time;
        updatedSchedule[item.id].date = selectedDate;
        updatedSchedule[item.id].dateAvailable = dateAvailability[item.id];
        updatedSchedule[item.id].timeAvailable = checkServiceAvailability(item.id, selectedDate, time);
      }
    });
    setServiceSchedule(updatedSchedule);
    
    checkTimeSlotAvailability();
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!selectedOffer) return 0;
    
    const subtotal = calculateSubtotal();
    
    // Check minimum amount
    if (subtotal < selectedOffer.minAmount) return 0;
    
    if (selectedOffer.type === 'percentage') {
      return (subtotal * selectedOffer.discount) / 100;
    } else {
      return selectedOffer.discount;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = (subtotal - discount) * 0.18;
    return subtotal - discount + tax;
  };

  // Cart item actions
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems(items => items.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  // Check if all services are available for selected date/time
  const isAllServicesAvailable = () => {
    if (!isScheduled || !selectedDate || !selectedTime) return false;
    
    return cartItems.every(service => {
      return timeSlotAvailability[service.id] !== false;
    });
  };

  // Get availability status text
  const getAvailabilityStatus = () => {
    if (!isScheduled) return { text: 'Available for immediate booking', color: '#4CAF50' };
    
    if (!selectedDate) return { text: 'Select a date', color: '#FF9800' };
    
    if (!selectedTime) return { text: 'Select a time slot', color: '#FF9800' };
    
    const allAvailable = isAllServicesAvailable();
    if (allAvailable) {
      return { text: 'All services available for selected slot', color: '#4CAF50' };
    } else {
      const unavailableCount = cartItems.filter(s => !timeSlotAvailability[s.id]).length;
      return { 
        text: `${unavailableCount} service(s) unavailable for selected slot`, 
        color: '#F44336' 
      };
    }
  };

  // Render time slot buttons
  const renderTimeSlots = () => {
    if (!selectedDate || loadingSlots) return null;
    
    const slots = [];
    cartItems.forEach(service => {
      if (availableSlots[service.id]) {
        slots.push(...availableSlots[service.id]);
      }
    });
    
    const uniqueSlots = [...new Set(slots)].sort();
    
    return (
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeSlotsRow}>
            {uniqueSlots.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlotButton,
                  selectedTime === slot && styles.selectedTimeSlot,
                  !isSlotAvailableForAllServices(slot) && styles.unavailableTimeSlot,
                ]}
                onPress={() => isSlotAvailableForAllServices(slot) && handleTimeSelect(slot)}
                disabled={!isSlotAvailableForAllServices(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === slot && styles.selectedTimeSlotText,
                  !isSlotAvailableForAllServices(slot) && styles.unavailableTimeSlotText,
                ]}>
                  {slot}
                </Text>
                {!isSlotAvailableForAllServices(slot) && (
                  <Ionicons name="close-circle" size={12} color="#F44336" style={styles.slotWarningIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Check if slot is available for all services
  const isSlotAvailableForAllServices = (slot) => {
    return cartItems.every(service => {
      return availableSlots[service.id]?.includes(slot);
    });
  };

  // Render service-specific availability
  const renderServiceAvailability = () => {
    if (!isScheduled || !selectedDate || !selectedTime) return null;
    
    return (
      <View style={styles.serviceAvailabilityContainer}>
        <Text style={styles.serviceAvailabilityTitle}>Service Availability Details</Text>
        {cartItems.map(service => (
          <View key={service.id} style={styles.serviceAvailabilityItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.availabilityStatus}>
              {timeSlotAvailability[service.id] ? (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.availableText}>Available</Text>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={16} color="#F44336" />
                  <Text style={styles.unavailableText}>
                    {!availableSlots[service.id]?.includes(selectedTime) 
                      ? 'Slot not offered' 
                      : 'Fully booked'}
                  </Text>
                </>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render cart item with availability indicator
  const renderCartItem = ({ item }) => {
    const schedule = serviceSchedule[item.id];
    const isAvailable = schedule?.timeAvailable;
    
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            {isScheduled && schedule?.date && (
              <View style={[
                styles.availabilityBadge,
                isAvailable ? styles.availableBadge : styles.unavailableBadge
              ]}>
                <Ionicons 
                  name={isAvailable ? "checkmark" : "close"} 
                  size={12} 
                  color="#fff" 
                />
                <Text style={styles.availabilityBadgeText}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemDuration}>Duration: {item.duration}</Text>
          
          {isScheduled && schedule?.date && schedule?.time && (
            <View style={styles.scheduledInfo}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.scheduledText}>
                {moment(schedule.date).format('MMM D')} at {schedule.time}
              </Text>
            </View>
          )}
          
          <View style={styles.itemPriceRow}>
            <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    );
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Availability Status Banner */}
        {isScheduled && (
          <View style={[styles.availabilityBanner, { backgroundColor: `${availabilityStatus.color}15` }]}>
            <View style={styles.availabilityHeader}>
              <Ionicons 
                name={availabilityStatus.color === '#4CAF50' ? "checkmark-circle" : "information-circle"} 
                size={20} 
                color={availabilityStatus.color} 
              />
              <Text style={[styles.availabilityText, { color: availabilityStatus.color }]}>
                {availabilityStatus.text}
              </Text>
            </View>
            {!isAllServicesAvailable() && selectedTime && (
              <TouchableOpacity style={styles.findSlotButton}>
                <Text style={styles.findSlotText}>Find Alternative Slot</Text>
                <Ionicons name="arrow-forward" size={16} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Schedule Service</Text>
            <Switch
              value={isScheduled}
              onValueChange={(value) => {
                setIsScheduled(value);
                if (!value) {
                  setSelectedTime('');
                }
              }}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
            />
          </View>
          
          {isScheduled && (
            <View style={styles.scheduleForm}>
              {/* Date Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.dateInputText}>
                    {selectedDate ? moment(selectedDate).format('ddd, MMM D, YYYY') : 'Select a date'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                
                {selectedDate && (
                  <View style={styles.dateAvailability}>
                    {loadingSlots ? (
                      <ActivityIndicator size="small" color="#2196F3" />
                    ) : (
                      <View style={styles.availabilityIcons}>
                        {cartItems.map(service => (
                          <View key={service.id} style={styles.serviceIconContainer}>
                            <View style={[
                              styles.serviceIcon,
                              { backgroundColor: dateAvailability[service.id] ? '#4CAF50' : '#F44336' }
                            ]}>
                              <Text style={styles.serviceIconText}>
                                {service.name.charAt(0)}
                              </Text>
                            </View>
                            {!dateAvailability[service.id] && (
                              <Ionicons 
                                name="alert-circle" 
                                size={12} 
                                color="#F44336" 
                                style={styles.unavailableIcon} 
                              />
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Time Slots */}
              {selectedDate && renderTimeSlots()}
              
              {/* Service Availability Details */}
              {renderServiceAvailability()}
            </View>
          )}
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services in Cart</Text>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add services to get started</Text>
            </View>
          ) : (
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any special instructions or requirements..."
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{calculateSubtotal().toFixed(2)}</Text>
          </View>
          
          {selectedOffer && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount ({selectedOffer.code})</Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                -₹{calculateDiscount().toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18% GST)</Text>
            <Text style={styles.priceValue}>
              ₹{((calculateSubtotal() - calculateDiscount()) * 0.18).toFixed(2)}
            </Text>
          </View>
          
          {isScheduled && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Scheduling Fee</Text>
              <Text style={styles.priceValue}>₹{isScheduled ? '50.00' : '0.00'}</Text>
            </View>
          )}
          
          <View style={styles.separator} />
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₹{(calculateTotal() + (isScheduled ? 50 : 0)).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>
            ₹{(calculateTotal() + (isScheduled ? 50 : 0)).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton, 
            (cartItems.length === 0 || (isScheduled && !isAllServicesAvailable())) && styles.checkoutDisabled
          ]}
          disabled={cartItems.length === 0 || (isScheduled && !isAllServicesAvailable())}
          onPress={() => {
            if (isScheduled && !isAllServicesAvailable()) {
              Alert.alert('Slot Unavailable', 'Please select an available time slot for all services.');
            } else {
              Alert.alert('Proceed to Checkout', 'Booking confirmed!');
            }
          }}
        >
          <Text style={styles.checkoutButtonText}>
            {isScheduled && !isAllServicesAvailable() ? 'Slot Unavailable' : 'Proceed to Checkout'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          maximumDate={moment().add(30, 'days').toDate()}
          onChange={handleDateSelect}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  availabilityBanner: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  findSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  findSlotText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  scheduleForm: {
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    marginRight: 'auto',
  },
  dateAvailability: {
    marginTop: 12,
  },
  availabilityIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceIconContainer: {
    position: 'relative',
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  unavailableIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  timeSlotsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  timeSlotsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSlotButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  unavailableTimeSlot: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  unavailableTimeSlotText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  slotWarningIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  serviceAvailabilityContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  serviceAvailabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  serviceAvailabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availableText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  unavailableText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
  },
  unavailableBadge: {
    backgroundColor: '#F44336',
  },
  availabilityBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  scheduledText: {
    fontSize: 13,
    color: '#666',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    color: '#333',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  priceSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 100,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
  },
  footerPrice: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CartScreen;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  Image,
  Switch,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Mock data for saved cards
const MOCK_SAVED_CARDS = [
  {
    id: '1',
    type: 'visa',
    lastFour: '4242',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    isDefault: true,
    cardNumber: '•••• •••• •••• 4242',
    brand: 'VISA',
    color: '#1A1F71',
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '5555',
    cardHolder: 'John Doe',
    expiryDate: '08/24',
    isDefault: false,
    cardNumber: '•••• •••• •••• 5555',
    brand: 'MasterCard',
    color: '#EB001B',
  },
  {
    id: '3',
    type: 'rupay',
    lastFour: '1234',
    cardHolder: 'John Doe',
    expiryDate: '05/26',
    isDefault: false,
    cardNumber: '•••• •••• •••• 1234',
    brand: 'RuPay',
    color: '#003087',
  },
];

// Mock UPI IDs
const MOCK_UPI_IDS = [
  {
    id: 'upi1',
    upiId: 'john.doe@okaxis',
    provider: 'Axis Bank',
    isDefault: false,
    type: 'upi',
  },
  {
    id: 'upi2',
    upiId: 'johndoe@ybl',
    provider: 'PhonePe',
    isDefault: true,
    type: 'upi',
  },
];

const SavedCardsScreen = ({ navigation }) => {
  // State management
  const [savedCards, setSavedCards] = useState(MOCK_SAVED_CARDS);
  const [upiIds, setUpiIds] = useState(MOCK_UPI_IDS);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUPIModal, setShowAddUPIModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // New card form state
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true,
    isDefault: false,
  });
  
  // New UPI form state
  const [newUPI, setNewUPI] = useState({
    upiId: '',
    isDefault: false,
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;

  // Load animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Modal animation
  useEffect(() => {
    if (showAddCardModal || showAddUPIModal) {
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      modalSlideAnim.setValue(300);
    }
  }, [showAddCardModal, showAddUPIModal]);

  // Get card brand/type from card number
  const getCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    // MasterCard
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'mastercard';
    }
    // RuPay
    if (/^(508|60|65)/.test(cleaned)) {
      return 'rupay';
    }
    // American Express
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    // Discover
    if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    }
    
    return 'credit';
  };

  // Format card number
  const formatCardNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  // Validate card
  const validateCard = () => {
    if (!newCard.cardNumber || newCard.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!newCard.cardHolder.trim()) {
      Alert.alert('Error', 'Please enter card holder name');
      return false;
    }
    if (!newCard.expiryMonth || !newCard.expiryYear) {
      Alert.alert('Error', 'Please enter expiry date');
      return false;
    }
    if (!newCard.cvv || newCard.cvv.length < 3) {
      Alert.alert('Error', 'Please enter CVV');
      return false;
    }
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const cardYear = parseInt(newCard.expiryYear);
    const cardMonth = parseInt(newCard.expiryMonth);
    
    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return false;
    }
    
    return true;
  };

  // Validate UPI
  const validateUPI = () => {
    if (!newUPI.upiId.includes('@')) {
      Alert.alert('Error', 'Please enter a valid UPI ID (e.g., username@bank)');
      return false;
    }
    return true;
  };

  // Handle add new card
  const handleAddCard = () => {
    if (!validateCard()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const cardType = getCardType(newCard.cardNumber);
      const lastFour = newCard.cardNumber.replace(/\s/g, '').slice(-4);
      const formattedCard = `•••• •••• •••• ${lastFour}`;
      
      const brandColors = {
        visa: '#1A1F71',
        mastercard: '#EB001B',
        rupay: '#003087',
        amex: '#2E77BC',
        discover: '#FF6000',
        credit: '#4A4A4A',
      };
      
      const newCardObj = {
        id: Date.now().toString(),
        type: cardType,
        lastFour: lastFour,
        cardHolder: newCard.cardHolder,
        expiryDate: `${newCard.expiryMonth}/${newCard.expiryYear.slice(-2)}`,
        isDefault: newCard.isDefault,
        cardNumber: formattedCard,
        brand: cardType.toUpperCase(),
        color: brandColors[cardType] || '#4A4A4A',
      };
      
      // If new card is default, unset others
      let updatedCards = [...savedCards];
      if (newCard.isDefault) {
        updatedCards = updatedCards.map(card => ({ ...card, isDefault: false }));
      }
      
      updatedCards.push(newCardObj);
      setSavedCards(updatedCards);
      
      // Reset form
      setNewCard({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        saveCard: true,
        isDefault: false,
      });
      
      setShowAddCardModal(false);
      setLoading(false);
      
      Alert.alert('Success', 'Card added successfully!');
    }, 1500);
  };

  // Handle add new UPI
  const handleAddUPI = () => {
    if (!validateUPI()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const provider = newUPI.upiId.split('@')[1] || 'UPI';
      
      const newUPIObj = {
        id: Date.now().toString(),
        upiId: newUPI.upiId,
        provider: provider.toUpperCase(),
        isDefault: newUPI.isDefault,
        type: 'upi',
      };
      
      // If new UPI is default, unset others
      let updatedUPIs = [...upiIds];
      if (newUPI.isDefault) {
        updatedUPIs = updatedUPIs.map(upi => ({ ...upi, isDefault: false }));
      }
      
      updatedUPIs.push(newUPIObj);
      setUpiIds(updatedUPIs);
      
      // Reset form
      setNewUPI({
        upiId: '',
        isDefault: false,
      });
      
      setShowAddUPIModal(false);
      setLoading(false);
      
      Alert.alert('Success', 'UPI ID added successfully!');
    }, 1500);
  };

  // Handle set as default
  const handleSetDefault = (id, type) => {
    if (type === 'card') {
      const updatedCards = savedCards.map(card => ({
        ...card,
        isDefault: card.id === id,
      }));
      setSavedCards(updatedCards);
    } else {
      const updatedUPIs = upiIds.map(upi => ({
        ...upi,
        isDefault: upi.id === id,
      }));
      setUpiIds(updatedUPIs);
    }
  };

  // Handle delete card/UPI
  const handleDelete = (id, type) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'card') {
              const updatedCards = savedCards.filter(card => card.id !== id);
              setSavedCards(updatedCards);
            } else {
              const updatedUPIs = upiIds.filter(upi => upi.id !== id);
              setUpiIds(updatedUPIs);
            }
            Alert.alert('Deleted', 'Payment method deleted successfully');
          },
        },
      ]
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Get card icon
  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return 'cc-visa';
      case 'mastercard':
        return 'cc-mastercard';
      case 'rupay':
        return 'credit-card';
      case 'amex':
        return 'cc-amex';
      case 'discover':
        return 'cc-discover';
      default:
        return 'credit-card';
    }
  };

  // Render card item
  const renderCardItem = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.cardItem,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.cardHeader, { backgroundColor: item.color }]}>
          <View style={styles.cardBrand}>
            <FontAwesome5 name={getCardIcon(item.type)} size={24} color="#fff" />
            <Text style={styles.cardBrandText}>{item.brand}</Text>
          </View>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.cardNumber}>{item.cardNumber}</Text>
          <View style={styles.cardDetails}>
            <View style={styles.cardDetailItem}>
              <Text style={styles.cardDetailLabel}>Card Holder</Text>
              <Text style={styles.cardDetailValue}>{item.cardHolder}</Text>
            </View>
            <View style={styles.cardDetailItem}>
              <Text style={styles.cardDetailLabel}>Expires</Text>
              <Text style={styles.cardDetailValue}>{item.expiryDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleSetDefault(item.id, 'card')}
            disabled={item.isDefault}
          >
            <Ionicons 
              name={item.isDefault ? "checkmark-circle" : "radio-button-off"} 
              size={20} 
              color={item.isDefault ? "#4CAF50" : "#666"} 
            />
            <Text style={[
              styles.cardActionText,
              item.isDefault && styles.defaultActionText,
            ]}>
              {item.isDefault ? 'Default' : 'Set as Default'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleDelete(item.id, 'card')}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={[styles.cardActionText, styles.deleteActionText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render UPI item
  const renderUPIItem = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.upiItem,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.upiHeader}>
          <View style={styles.upiIconContainer}>
            <Ionicons name="phone-portrait" size={24} color="#2196F3" />
          </View>
          <View style={styles.upiInfo}>
            <Text style={styles.upiId}>{item.upiId}</Text>
            <Text style={styles.upiProvider}>{item.provider}</Text>
          </View>
          {item.isDefault && (
            <View style={styles.upiDefaultBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
        
        <View style={styles.upiActions}>
          <TouchableOpacity
            style={styles.upiActionButton}
            onPress={() => handleSetDefault(item.id, 'upi')}
            disabled={item.isDefault}
          >
            <Ionicons 
              name={item.isDefault ? "checkmark-circle" : "radio-button-off"} 
              size={20} 
              color={item.isDefault ? "#4CAF50" : "#666"} 
            />
            <Text style={[
              styles.upiActionText,
              item.isDefault && styles.upiDefaultActionText,
            ]}>
              {item.isDefault ? 'Default' : 'Set as Default'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.upiActionButton}
            onPress={() => handleDelete(item.id, 'upi')}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={[styles.upiActionText, styles.deleteActionText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Handle card number input
  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setNewCard({ ...newCard, cardNumber: formatted });
  };

  // Handle expiry month input
  const handleExpiryMonthChange = (text) => {
    const month = parseInt(text);
    if (text.length <= 2 && (month <= 12 || text === '')) {
      setNewCard({ ...newCard, expiryMonth: text });
    }
  };

  // Handle expiry year input
  const handleExpiryYearChange = (text) => {
    if (text.length <= 4) {
      setNewCard({ ...newCard, expiryYear: text });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Payment Methods</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="card" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{savedCards.length}</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="phone-portrait" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{upiIds.length}</Text>
            <Text style={styles.statLabel}>UPI IDs</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>
              {savedCards.filter(c => c.isDefault).length + upiIds.filter(u => u.isDefault).length}
            </Text>
            <Text style={styles.statLabel}>Default</Text>
          </View>
        </Animated.View>

        {/* Add New Payment Methods */}
        <Animated.View 
          style={[
            styles.addPaymentSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>Add Payment Method</Text>
          <View style={styles.addPaymentButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddCardModal(true)}
            >
              <View style={[styles.addButtonIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="card" size={28} color="#2196F3" />
              </View>
              <Text style={styles.addButtonText}>Add Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddUPIModal(true)}
            >
              <View style={[styles.addButtonIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="phone-portrait" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.addButtonText}>Add UPI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => Alert.alert('Coming Soon', 'Net Banking will be available soon!')}
            >
              <View style={[styles.addButtonIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="bank" size={28} color="#9C27B0" />
              </View>
              <Text style={styles.addButtonText}>Net Banking</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Saved Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            <Text style={styles.sectionSubtitle}>
              {savedCards.filter(c => c.isDefault).length > 0 ? 'Default card selected' : 'No default card'}
            </Text>
          </View>
          
          {savedCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No saved cards</Text>
              <Text style={styles.emptyStateSubtext}>Add a card for faster checkout</Text>
            </View>
          ) : (
            savedCards.map((card, index) => (
              <View key={card.id}>
                {renderCardItem({ item: card, index })}
                {index < savedCards.length - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>

        {/* Saved UPI IDs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved UPI IDs</Text>
            <Text style={styles.sectionSubtitle}>
              {upiIds.filter(u => u.isDefault).length > 0 ? 'Default UPI selected' : 'No default UPI'}
            </Text>
          </View>
          
          {upiIds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No saved UPI IDs</Text>
              <Text style={styles.emptyStateSubtext}>Add a UPI ID for quick payments</Text>
            </View>
          ) : (
            upiIds.map((upi, index) => (
              <View key={upi.id}>
                {renderUPIItem({ item: upi, index })}
                {index < upiIds.length - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={styles.securityTitle}>Secure & Encrypted</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is securely stored using bank-level encryption. 
            We never store your CVV or full card details.
          </Text>
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="lock-closed" size={16} color="#4CAF50" />
              <Text style={styles.securityFeatureText}>256-bit SSL Encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.securityFeatureText}>PCI DSS Compliant</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="eye-off" size={16} color="#4CAF50" />
              <Text style={styles.securityFeatureText}>CVV Never Stored</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: modalSlideAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Card Preview */}
              <View style={styles.cardPreview}>
                <View style={[styles.previewCard, { backgroundColor: getCardType(newCard.cardNumber) === 'visa' ? '#1A1F71' : 
                  getCardType(newCard.cardNumber) === 'mastercard' ? '#EB001B' : '#4A4A4A' }]}>
                  <View style={styles.previewCardHeader}>
                    <Text style={styles.previewCardType}>
                      {getCardType(newCard.cardNumber).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.previewCardNumber}>
                    {newCard.cardNumber || '•••• •••• •••• ••••'}
                  </Text>
                  <View style={styles.previewCardDetails}>
                    <View>
                      <Text style={styles.previewCardLabel}>CARD HOLDER</Text>
                      <Text style={styles.previewCardValue}>
                        {newCard.cardHolder || 'YOUR NAME'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.previewCardLabel}>VALID THRU</Text>
                      <Text style={styles.previewCardValue}>
                        {newCard.expiryMonth && newCard.expiryYear 
                          ? `${newCard.expiryMonth}/${newCard.expiryYear.slice(-2)}` 
                          : 'MM/YY'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card Form */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={newCard.cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Card Holder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={newCard.cardHolder}
                  onChangeText={(text) => setNewCard({ ...newCard, cardHolder: text })}
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.expiryContainer}>
                    <TextInput
                      style={[styles.input, styles.expiryInput]}
                      placeholder="MM"
                      value={newCard.expiryMonth}
                      onChangeText={handleExpiryMonthChange}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.expirySeparator}>/</Text>
                    <TextInput
                      style={[styles.input, styles.expiryInput]}
                      placeholder="YYYY"
                      value={newCard.expiryYear}
                      onChangeText={handleExpiryYearChange}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 16 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Save this card for future payments</Text>
                  <Switch
                    value={newCard.saveCard}
                    onValueChange={(value) => setNewCard({ ...newCard, saveCard: value })}
                    trackColor={{ false: '#ddd', true: '#4CAF50' }}
                  />
                </View>
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Set as default payment method</Text>
                  <Switch
                    value={newCard.isDefault}
                    onValueChange={(value) => setNewCard({ ...newCard, isDefault: value })}
                    trackColor={{ false: '#ddd', true: '#2196F3' }}
                  />
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddCard}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Add Card</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Add UPI Modal */}
      <Modal
        visible={showAddUPIModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddUPIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { transform: [{ translateY: modalSlideAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add UPI ID</Text>
              <TouchableOpacity onPress={() => setShowAddUPIModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.upiIllustration}>
                <Ionicons name="phone-portrait" size={80} color="#2196F3" />
                <Text style={styles.upiIllustrationText}>
                  Enter your UPI ID to make instant payments
                </Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="username@bank"
                  value={newUPI.upiId}
                  onChangeText={(text) => setNewUPI({ ...newUPI, upiId: text })}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  Example: john.doe@okaxis, johndoe@ybl, 9876543210@upi
                </Text>
              </View>
              
              <View style={styles.upiProviders}>
                <Text style={styles.upiProvidersTitle}>Supported UPI Apps</Text>
                <View style={styles.upiProviderIcons}>
                  <View style={styles.upiProviderIcon}>
                    <Text style={styles.upiProviderText}>GPay</Text>
                  </View>
                  <View style={styles.upiProviderIcon}>
                    <Text style={styles.upiProviderText}>PhonePe</Text>
                  </View>
                  <View style={styles.upiProviderIcon}>
                    <Text style={styles.upiProviderText}>Paytm</Text>
                  </View>
                  <View style={styles.upiProviderIcon}>
                    <Text style={styles.upiProviderText}>BHIM</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Set as default payment method</Text>
                  <Switch
                    value={newUPI.isDefault}
                    onValueChange={(value) => setNewUPI({ ...newUPI, isDefault: value })}
                    trackColor={{ false: '#ddd', true: '#2196F3' }}
                  />
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddUPIModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddUPI}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Add UPI ID</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  addPaymentSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addPaymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  addButtonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBody: {
    padding: 16,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  cardActionText: {
    fontSize: 14,
    color: '#666',
  },
  defaultActionText: {
    color: '#4CAF50',
  },
  deleteActionText: {
    color: '#F44336',
  },
  upiItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  upiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upiInfo: {
    flex: 1,
  },
  upiId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  upiProvider: {
    fontSize: 12,
    color: '#666',
  },
  upiDefaultBadge: {
    padding: 4,
  },
  upiActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  upiActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  upiActionText: {
    fontSize: 14,
    color: '#666',
  },
  upiDefaultActionText: {
    color: '#4CAF50',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  securitySection: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  securityFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityFeatureText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  cardPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCardType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  previewCardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  previewCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  previewCardLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
  },
  previewCardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
  },
  expirySeparator: {
    fontSize: 20,
    color: '#666',
    marginHorizontal: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  switchContainer: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  upiIllustration: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  upiIllustrationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  upiProviders: {
    marginBottom: 24,
  },
  upiProvidersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  upiProviderIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  upiProviderIcon: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  upiProviderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SavedCardsScreen;
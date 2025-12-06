import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data for offers (same as before)
const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All Offers', icon: 'star' },
  { id: 'cleaning', name: 'Cleaning', icon: 'broom' },
  { id: 'repair', name: 'Repair', icon: 'tools' },
  { id: 'plumbing', name: 'Plumbing', icon: 'pipe' },
  { id: 'ac', name: 'AC Services', icon: 'snowflake' },
  { id: 'electric', name: 'Electrical', icon: 'bolt' },
  { id: 'pest', name: 'Pest Control', icon: 'bug' },
  { id: 'appliance', name: 'Appliance', icon: 'washing-machine' },
];

const OFFERS_DATA = [
  {
    id: '1',
    title: 'First Booking Special',
    description: 'Get 30% off on your first service booking',
    code: 'WELCOME30',
    discount: 30,
    type: 'percentage',
    minAmount: 1000,
    expiryDate: '2024-12-31',
    applicableServices: ['all'],
    category: 'all',
    color: '#FF6B6B',
    icon: 'gift',
    terms: 'Valid only for new customers',
  },
  {
    id: '2',
    title: 'AC Summer Special',
    description: '25% off on all AC repair and maintenance services',
    code: 'ACSUMMER25',
    discount: 25,
    type: 'percentage',
    minAmount: 500,
    expiryDate: '2024-09-30',
    applicableServices: ['ac', 'repair'],
    category: 'ac',
    color: '#4ECDC4',
    icon: 'snowflake',
    terms: 'Valid on services above ₹500',
  },
  {
    id: '3',
    title: 'Flat ₹200 Off',
    description: 'Get flat ₹200 off on plumbing services',
    code: 'PLUMB200',
    discount: 200,
    type: 'fixed',
    minAmount: 800,
    expiryDate: '2024-11-15',
    applicableServices: ['plumbing'],
    category: 'plumbing',
    color: '#FFD166',
    icon: 'pipe',
    terms: 'Minimum order ₹800',
  },
  {
    id: '4',
    title: 'Deep Cleaning Package',
    description: '40% off on complete home deep cleaning',
    code: 'CLEAN40',
    discount: 40,
    type: 'percentage',
    minAmount: 1500,
    expiryDate: '2024-10-20',
    applicableServices: ['cleaning'],
    category: 'cleaning',
    color: '#06D6A0',
    icon: 'broom',
    terms: 'Includes all cleaning services',
  },
  {
    id: '5',
    title: 'Emergency Repair',
    description: '20% off on emergency repair services',
    code: 'EMERGENCY20',
    discount: 20,
    type: 'percentage',
    minAmount: 0,
    expiryDate: '2024-12-25',
    applicableServices: ['repair', 'electric', 'plumbing'],
    category: 'repair',
    color: '#118AB2',
    icon: 'tools',
    terms: 'Available 24/7',
  },
  {
    id: '6',
    title: 'Monthly Package',
    description: 'Save 35% with monthly service subscription',
    code: 'MONTHLY35',
    discount: 35,
    type: 'percentage',
    minAmount: 2000,
    expiryDate: '2024-11-30',
    applicableServices: ['all'],
    category: 'all',
    color: '#9D4EDD',
    icon: 'calendar',
    terms: 'Minimum 3-month subscription',
  },
  {
    id: '7',
    title: 'Appliance Repair',
    description: '₹150 off on all appliance repair services',
    code: 'APP150',
    discount: 150,
    type: 'fixed',
    minAmount: 600,
    expiryDate: '2024-10-10',
    applicableServices: ['appliance', 'repair'],
    category: 'appliance',
    color: '#FF9E6D',
    icon: 'washing-machine',
    terms: 'Excludes spare parts',
  },
  {
    id: '8',
    title: 'Pest Control Combo',
    description: 'Buy 2 pest control services, get 1 free',
    code: 'PESTCOMBO',
    discount: 33,
    type: 'percentage',
    minAmount: 1200,
    expiryDate: '2024-09-15',
    applicableServices: ['pest'],
    category: 'pest',
    color: '#A663CC',
    icon: 'bug',
    terms: 'Valid on package of 3 services',
  },
];

const SERVICES_DATA = [
  {
    id: 's1',
    name: 'AC Repair',
    category: 'ac',
    price: 799,
    discountedPrice: 599,
    discount: '25% OFF',
    rating: 4.5,
    image: 'https://via.placeholder.com/100/4ECDC4/FFFFFF?text=AC',
  },
  {
    id: 's2',
    name: 'Deep Cleaning',
    category: 'cleaning',
    price: 1499,
    discountedPrice: 899,
    discount: '40% OFF',
    rating: 4.8,
    image: 'https://via.placeholder.com/100/06D6A0/FFFFFF?text=Clean',
  },
  {
    id: 's3',
    name: 'Plumbing Repair',
    category: 'plumbing',
    price: 499,
    discountedPrice: 399,
    discount: '20% OFF',
    rating: 4.3,
    image: 'https://via.placeholder.com/100/FFD166/000000?text=Plumb',
  },
  {
    id: 's4',
    name: 'Electrical Wiring',
    category: 'electric',
    price: 899,
    discountedPrice: 719,
    discount: '20% OFF',
    rating: 4.6,
    image: 'https://via.placeholder.com/100/118AB2/FFFFFF?text=Electric',
  },
];

// Separate components to avoid hook errors
const CategoryItem = ({ item, index, selectedCategory, onSelect }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => onSelect(item.id)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={selectedCategory === item.id ? '#fff' : '#666'}
        />
        <Text style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryName,
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const OfferCard = ({ item, index, appliedOffers, onViewDetails, onApplyOffer, onRemoveOffer, onCopyCode }) => {
  const isApplied = appliedOffers.some(offer => offer.id === item.id);
  const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
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
        styles.offerCard,
        { borderLeftColor: item.color },
        {
          opacity: opacity,
          transform: [{ translateY: translateY }],
        },
      ]}
    >
      <View style={styles.offerHeader}>
        <View style={[styles.offerIcon, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.offerTitleContainer}>
          <Text style={styles.offerTitle}>{item.title}</Text>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>
              {item.type === 'percentage' ? `${item.discount}% OFF` : `₹${item.discount} OFF`}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.offerDescription}>{item.description}</Text>
      
      <View style={styles.offerDetails}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>CODE: </Text>
          <Text style={styles.codeValue}>{item.code}</Text>
          <TouchableOpacity onPress={() => onCopyCode(item.code)}>
            <Ionicons name="copy-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.expiryContainer}>
          <Ionicons name="time-outline" size={14} color="#FF6B6B" />
          <Text style={styles.expiryText}>
            {daysUntilExpiry > 0 ? `Expires in ${daysUntilExpiry} days` : 'Expired'}
          </Text>
        </View>
      </View>

      <View style={styles.offerActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(item)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.applyButton,
            isApplied && styles.appliedButton,
          ]}
          onPress={() => isApplied ? onRemoveOffer(item.id) : onApplyOffer(item)}
          disabled={daysUntilExpiry <= 0}
        >
          <Text style={[
            styles.applyButtonText,
            isApplied && styles.appliedButtonText,
          ]}>
            {isApplied ? 'Applied' : daysUntilExpiry <= 0 ? 'Expired' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const ServiceCard = ({ item, index }) => {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
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
        styles.serviceCardWrapper,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <TouchableOpacity style={styles.serviceCard}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>₹{item.price}</Text>
            <Text style={styles.discountedPrice}>₹{item.discountedPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{item.discount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AppliedOfferItem = ({ offer, index, onRemove }) => {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.appliedOfferItem,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <Text style={styles.appliedOfferCode}>{offer.code}</Text>
      <TouchableOpacity onPress={() => onRemove(offer.id)}>
        <Ionicons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ExpiringOfferCard = ({ offer, index, onViewDetails }) => {
  const translateX = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.expiringCardWrapper,
        {
          opacity: opacity,
          transform: [{ translateX: translateX }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.expiringCard, { backgroundColor: offer.color }]}
        onPress={() => onViewDetails(offer)}
      >
        <View style={styles.expiringContent}>
          <Text style={styles.expiringTitle}>{offer.title}</Text>
          <Text style={styles.expiringCode}>{offer.code}</Text>
          <View style={styles.expiringDiscount}>
            <Text style={styles.expiringDiscountText}>
              {offer.type === 'percentage' ? `${offer.discount}% OFF` : `₹${offer.discount} OFF`}
            </Text>
          </View>
        </View>
        <View style={styles.expiringTimer}>
          <Ionicons name="time-outline" size={16} color="#fff" />
          <Text style={styles.expiringTimerText}>
            {Math.ceil((new Date(offer.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}d
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const InstructionItem = ({ item, index }) => {
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.instructionItem,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <View style={[styles.instructionIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.instructionTitle}>{item.title}</Text>
      <Text style={styles.instructionText}>{item.text}</Text>
    </Animated.View>
  );
};

const OffersScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offers, setOffers] = useState(OFFERS_DATA);
  const [services, setServices] = useState(SERVICES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Start animations when component mounts
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Get expiring soon offers (within 7 days)
    const today = new Date();
    const expiring = offers.filter(offer => {
      const expiryDate = new Date(offer.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });
    setExpiringSoon(expiring);
  }, [offers]);

  // Filter offers based on category and search
  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter services based on category
  const filteredServices = services.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  );

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleApplyOffer = (offer) => {
    if (!appliedOffers.some(applied => applied.id === offer.id)) {
      setAppliedOffers([...appliedOffers, offer]);
      Alert.alert('Success', `Offer ${offer.code} applied successfully!`);
    } else {
      Alert.alert('Already Applied', 'This offer is already applied to your cart');
    }
  };

  const handleRemoveOffer = (offerId) => {
    setAppliedOffers(appliedOffers.filter(offer => offer.id !== offerId));
  };

  const handleViewOfferDetails = (offer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const handleCopyCode = (code) => {
    Alert.alert('Copied!', `Code ${code} copied to clipboard`);
  };

  const instructions = [
    {
      icon: 'search',
      title: 'Browse Offers',
      text: 'Find offers for your service category',
      color: '#2196F3',
    },
    {
      icon: 'clipboard',
      title: 'Apply Code',
      text: 'Copy and apply code during checkout',
      color: '#4CAF50',
    },
    {
      icon: 'cart',
      title: 'Book Service',
      text: 'Complete booking with discounted price',
      color: '#FF9800',
    },
    {
      icon: 'gift',
      title: 'Save More',
      text: 'Combine with loyalty points for extra savings',
      color: '#9C27B0',
    },
  ];

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
          <Text style={styles.headerTitle}>Offers & Discounts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <View style={styles.cartIcon}>
              <Ionicons name="cart" size={24} color="#333" />
              {appliedOffers.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{appliedOffers.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offers by name or code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Applied Offers Banner */}
        {appliedOffers.length > 0 && (
          <Animated.View 
            style={[
              styles.appliedOffersBanner,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.bannerHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.bannerTitle}>
                {appliedOffers.length} Offer{appliedOffers.length > 1 ? 's' : ''} Applied
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {appliedOffers.map((offer, index) => (
                <AppliedOfferItem
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onRemove={handleRemoveOffer}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Expiring Soon Section */}
        {expiringSoon.length > 0 && (
          <Animated.View 
            style={[
              styles.expiringSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="flash" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Expiring Soon</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Hurry! Limited time offers</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {expiringSoon.map((offer, index) => (
                <ExpiringOfferCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onViewDetails={handleViewOfferDetails}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <FlatList
            data={SERVICE_CATEGORIES}
            renderItem={({ item, index }) => (
              <CategoryItem
                item={item}
                index={index}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Offers List */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Available Offers ({filteredOffers.length})
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredOffers.length === 0 ? (
            <Animated.View 
              style={[
                styles.emptyState,
                { opacity: fadeAnim }
              ]}
            >
              <Ionicons name="pricetag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No offers found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search term' : 'No offers available for this category'}
              </Text>
            </Animated.View>
          ) : (
            <FlatList
              data={filteredOffers}
              renderItem={({ item, index }) => (
                <OfferCard
                  item={item}
                  index={index}
                  appliedOffers={appliedOffers}
                  onViewDetails={handleViewOfferDetails}
                  onApplyOffer={handleApplyOffer}
                  onRemoveOffer={handleRemoveOffer}
                  onCopyCode={handleCopyCode}
                />
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.offerSeparator} />}
            />
          )}
        </View>

        {/* Discounted Services */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discounted Services</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                item={service}
                index={index}
              />
            ))}
          </ScrollView>
        </View>

        {/* How to Use Section */}
        <Animated.View 
          style={[
            styles.instructionsSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>How to Use Offers</Text>
          <View style={styles.instructionsGrid}>
            {instructions.map((item, index) => (
              <InstructionItem
                key={index}
                item={item}
                index={index}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Offer Details Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    })
                  }
                ]
              }
            ]}
          >
            {selectedOffer && (
              <>
                <View style={[styles.modalHeader, { backgroundColor: selectedOffer.color }]}>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowOfferModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.modalIcon}>
                    <MaterialCommunityIcons name={selectedOffer.icon} size={40} color="#fff" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                  <Text style={styles.modalCode}>{selectedOffer.code}</Text>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <View style={styles.modalDiscountBadge}>
                    <Text style={styles.modalDiscountText}>
                      {selectedOffer.type === 'percentage' 
                        ? `${selectedOffer.discount}% OFF` 
                        : `₹${selectedOffer.discount} OFF`}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalDescription}>{selectedOffer.description}</Text>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={20} color="#666" />
                      <Text style={styles.detailLabel}>Valid Until:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedOffer.expiryDate).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="pricetag" size={20} color="#666" />
                      <Text style={styles.detailLabel}>Minimum Order:</Text>
                      <Text style={styles.detailValue}>₹{selectedOffer.minAmount}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#666" />
                      <Text style={styles.detailLabel}>Applicable For:</Text>
                      <Text style={styles.detailValue}>
                        {selectedOffer.applicableServices.map(s => 
                          SERVICE_CATEGORIES.find(c => c.id === s)?.name || s
                        ).join(', ')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>Terms & Conditions</Text>
                    <Text style={styles.termsText}>{selectedOffer.terms}</Text>
                    <Text style={styles.termsText}>• Cannot be combined with other offers</Text>
                    <Text style={styles.termsText}>• Valid only on service charges, not on spare parts</Text>
                    <Text style={styles.termsText}>• Offer valid once per user</Text>
                  </View>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyCode(selectedOffer.code)}
                  >
                    <Ionicons name="copy" size={20} color="#2196F3" />
                    <Text style={styles.copyButtonText}>Copy Code</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.applyModalButton,
                      { backgroundColor: selectedOffer.color },
                    ]}
                    onPress={() => {
                      handleApplyOffer(selectedOffer);
                      setShowOfferModal(false);
                    }}
                  >
                    <Text style={styles.applyModalButtonText}>
                      {appliedOffers.some(o => o.id === selectedOffer.id) ? 'Applied ✓' : 'Apply Offer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain exactly the same as the previous version
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  appliedOffersBanner: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  appliedOfferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedOfferCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 8,
  },
  expiringSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  expiringCardWrapper: {
    marginRight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  expiringCard: {
    width: width * 0.6,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiringContent: {
    flex: 1,
  },
  expiringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  expiringCode: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  expiringDiscount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expiringDiscountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  expiringTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expiringTimerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  categoriesSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#fff',
    fontWeight: '600',
  },
  offersSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  viewAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offerSeparator: {
    height: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerTitleContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  offerBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  offerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F44336',
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  offerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    color: '#999',
  },
  codeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  appliedButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  appliedButtonText: {
    color: '#4CAF50',
  },
  servicesSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  serviceCardWrapper: {
    marginRight: 12,
  },
  serviceCard: {
    width: width * 0.4,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  discountBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F44336',
  },
  instructionsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  instructionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  instructionItem: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  instructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
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
    textAlign: 'center',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCode: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    fontFamily: 'monospace',
  },
  modalContent: {
    padding: 24,
  },
  modalDiscountBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalDiscountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 12,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  applyModalButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default OffersScreen;
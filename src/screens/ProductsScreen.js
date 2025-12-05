import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState([]);

  const products = [
    { 
      id: 1, 
      name: 'Premium Car Wax', 
      price: 24.99, 
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
      category: 'Wax',
      rating: 4.5,
      reviews: 128 
    },
    { 
      id: 2, 
      name: 'Tire Shine Spray', 
      price: 14.99, 
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba5335f4a',
      category: 'Tire Care',
      rating: 4.2,
      reviews: 89 
    },
    { 
      id: 3, 
      name: 'Interior Cleaner', 
      price: 18.99, 
      image: 'https://images.unsplash.com/photo-1552244461-c21d4f0a8b5b',
      category: 'Interior',
      rating: 4.7,
      reviews: 156 
    },
    { 
      id: 4, 
      name: 'Glass Cleaner', 
      price: 12.99, 
      image: 'https://images.unsplash.com/photo-1581650107963-3e8c1f4825b5',
      category: 'Glass',
      rating: 4.3,
      reviews: 94 
    },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    // Show feedback
    setTimeout(() => {
      // Feedback would go here
    }, 100);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {['All', 'Wax', 'Tire Care', 'Interior', 'Glass', 'Tools'].map((cat) => (
            <TouchableOpacity key={cat} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { product })}
            >
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {product.rating}</Text>
                  <Text style={styles.reviews}>({product.reviews})</Text>
                </View>
                <Text style={styles.productPrice}>Rs. {product.price}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {cart.length} item{cart.length > 1 ? 's' : ''} in cart
            </Text>
            <Text style={styles.summaryTotal}>Rs. {getTotal()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.checkoutButtonText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Add TextInput import
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
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
  cartIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  productsGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
    marginRight: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
  checkoutButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List, Divider, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CartScreen() {
  const [items, setItems] = useState([
    { id: 1, name: 'Premium Car Wax', price: 24.99, quantity: 1, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
    { id: 2, name: 'Tire Shine Spray', price: 14.99, quantity: 2, image: 'https://images.unsplash.com/photo-1593941707882-a5bba5335f4a?w=400' },
  ]);

  const updateQuantity = (id, change) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineSmall" style={styles.title}>Shopping Cart</Text>
        
        {items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="shopping-cart" size={60} color="#CBD5E0" />
              <Text variant="titleMedium" style={styles.emptyText}>Your cart is empty</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>Add some products to get started</Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {items.map((item) => (
              <Card key={item.id} style={styles.cartItem}>
                <Card.Content style={styles.itemContent}>
                  <Card.Cover 
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text variant="titleMedium" style={styles.itemName}>{item.name}</Text>
                    <Text variant="titleMedium" style={styles.itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <View style={styles.quantityContainer}>
                      <Button 
                        mode="outlined" 
                        compact 
                        onPress={() => updateQuantity(item.id, -1)}
                        style={styles.quantityButton}
                      >
                        -
                      </Button>
                      <Text variant="bodyMedium" style={styles.quantityText}>
                        {item.quantity}
                      </Text>
                      <Button 
                        mode="outlined" 
                        compact 
                        onPress={() => updateQuantity(item.id, 1)}
                        style={styles.quantityButton}
                      >
                        +
                      </Button>
                      <Button 
                        mode="text" 
                        onPress={() => removeItem(item.id)}
                        style={styles.removeButton}
                        labelStyle={styles.removeText}
                      >
                        Remove
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
            
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium">Subtotal</Text>
                  <Text variant="bodyMedium">${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium">Tax (8%)</Text>
                  <Text variant="bodyMedium">${tax.toFixed(2)}</Text>
                </View>
                <Divider style={styles.summaryDivider} />
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text variant="titleMedium">Total</Text>
                  <Text variant="titleMedium" style={styles.totalAmount}>
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.promoCard}>
              <Card.Content>
                <TextInput
                  label="Promo Code"
                  mode="outlined"
                  style={styles.promoInput}
                  right={<TextInput.Icon icon="tag" />}
                />
              </Card.Content>
              <Card.Actions>
                <Button mode="outlined">Apply</Button>
              </Card.Actions>
            </Card>
          </>
        )}
      </ScrollView>
      
      {items.length > 0 && (
        <View style={styles.checkoutContainer}>
          <Button 
            mode="contained" 
            style={styles.checkoutButton}
            labelStyle={styles.checkoutLabel}
            icon="shopping-cart-checkout"
          >
            Checkout - ${total.toFixed(2)}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 20,
    color: '#1F2937',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    color: '#4A5568',
  },
  emptySubtext: {
    color: '#718096',
  },
  cartItem: {
    marginBottom: 12,
    borderRadius: 12,
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    minWidth: 40,
  },
  quantityText: {
    marginHorizontal: 12,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 'auto',
  },
  removeText: {
    color: '#E53E3E',
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 8,
  },
  totalAmount: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  promoCard: {
    marginTop: 16,
    borderRadius: 12,
  },
  promoInput: {
    backgroundColor: '#FFFFFF',
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkoutButton: {
    backgroundColor: '#4A90E2',
  },
  checkoutLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
});
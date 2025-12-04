import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List, Divider } from 'react-native-paper';

export default function OrdersScreen() {
  const orders = [
    { id: 1, service: 'Premium Car Wash', date: 'Today, 3:00 PM', status: 'In Progress', price: '$45' },
    { id: 2, service: 'Basic Bike Wash', date: 'Yesterday, 2:00 PM', status: 'Completed', price: '$15' },
    { id: 3, service: 'Car Wax', date: 'Nov 25', status: 'Delivered', price: '$25' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return '#4A90E2';
      case 'Completed': return '#50C878';
      case 'Delivered': return '#FFA500';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>My Orders</Text>
      
      {orders.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <Text variant="titleMedium">{order.service}</Text>
              <Text variant="titleMedium" style={styles.orderPrice}>{order.price}</Text>
            </View>
            <Text variant="bodyMedium" style={styles.orderDate}>{order.date}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <Text variant="bodyMedium" style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                {order.status}
              </Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button mode="outlined">Track Order</Button>
            <Button mode="contained">View Details</Button>
          </Card.Actions>
        </Card>
      ))}
      
      <Divider style={styles.divider} />
      
      <Card style={styles.helpCard}>
        <Card.Content>
          <Text variant="titleMedium">Need help with an order?</Text>
          <Text variant="bodyMedium" style={styles.helpText}>
            Contact our support team 24/7
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" icon="headset">Contact Support</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 20,
    color: '#1F2937',
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPrice: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  orderDate: {
    color: '#6B7280',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  orderStatus: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 24,
  },
  helpCard: {
    borderRadius: 12,
  },
  helpText: {
    color: '#6B7280',
    marginTop: 4,
  },
});
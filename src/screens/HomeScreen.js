import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.appTitle}>CarWash</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Current City</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>Hi! Ready for a clean ride?</Text>
          <Text style={styles.greetingSubtitle}>Book a wash or buy products fast.</Text>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          {/* Car Wash */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#E3F2FD' }]}
            onPress={() => navigation.navigate('Booking', { vehicle: 'car' })}
          >
            <Text style={[styles.actionIcon, { color: '#4A90E2' }]}>🚗</Text>
            <Text style={styles.actionTitle}>Car Wash</Text>
            <Text style={styles.actionSubtitle}>Book Now</Text>
          </TouchableOpacity>

          {/* Bike Wash */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => navigation.navigate('Booking', { vehicle: 'bike' })}
          >
            <Text style={[styles.actionIcon, { color: '#50C878' }]}>🏍️</Text>
            <Text style={styles.actionTitle}>Bike Wash</Text>
            <Text style={styles.actionSubtitle}>Book Now</Text>
          </TouchableOpacity>

          {/* Products */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FFEBEE' }]}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={[styles.actionIcon, { color: '#FF6B6B' }]}>🛒</Text>
            <Text style={styles.actionTitle}>Products</Text>
            <Text style={styles.actionSubtitle}>Shop Now</Text>
          </TouchableOpacity>

          {/* Support */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FFF3E0' }]}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={[styles.actionIcon, { color: '#FFA500' }]}>❓</Text>
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionSubtitle}>Get Help</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        
        <View style={styles.recentCard}>
          <View style={styles.recentContent}>
            <Text style={styles.historyIcon}>📋</Text>
            <View style={styles.recentTextContainer}>
              <Text style={styles.recentTitle}>No recent bookings</Text>
              <Text style={styles.recentSubtitle}>
                Place your first booking to see it here!
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking', { vehicle: 'car' })}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Camera FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.fabIcon}>📸</Text>
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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#4A90E2',
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  locationText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  greetingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionCard: {
    width: '48%',
    height: 150,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#1F2937',
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 100,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyIcon: {
    fontSize: 32,
    marginRight: 12,
    color: '#6B7280',
  },
  recentTextContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
});
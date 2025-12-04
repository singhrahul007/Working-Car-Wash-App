import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List, Divider, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Image 
            size={80}
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall" style={styles.profileName}>John Doe</Text>
            <Text variant="bodyMedium" style={styles.profilePhone}>+1 (234) 567-8900</Text>
            <Text variant="bodyMedium" style={styles.profileEmail}>john@example.com</Text>
            <Button 
              mode="outlined" 
              style={styles.editButton}
              icon="pencil"
              compact
            >
              Edit Profile
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Account Section */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
      <Card style={styles.sectionCard}>
        <List.Item
          title="Saved Addresses"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Payment Methods"
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Privacy & Security"
          left={props => <List.Icon {...props} icon="shield" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>

      {/* Support Section */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Support</Text>
      <Card style={styles.sectionCard}>
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="About CarWash"
          left={props => <List.Icon {...props} icon="information" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Rate App"
          left={props => <List.Icon {...props} icon="star" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Share App"
          left={props => <List.Icon {...props} icon="share-variant" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.infoText}>
            App Version: 1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            Last Updated: Dec 2023
          </Text>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button 
        mode="contained" 
        style={styles.logoutButton}
        labelStyle={styles.logoutLabel}
        icon="logout"
        onPress={() => console.log('Logout')}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  profilePhone: {
    color: '#6B7280',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#6B7280',
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  sectionCard: {
    borderRadius: 12,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#EDF2F7',
  },
  infoText: {
    color: '#718096',
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    marginBottom: 32,
  },
  logoutLabel: {
    fontWeight: '600',
  },
});
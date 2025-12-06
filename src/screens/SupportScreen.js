import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SupportScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I book a service?',
      answer: 'Tap on any service card from the home screen, select your preferred service, choose date & time, enter your contact details, and confirm with OTP verification.',
      icon: 'calendar-check'
    },
    {
      id: 2,
      question: 'What are your working hours?',
      answer: 'We operate from 7:00 AM to 10:00 PM, 7 days a week. You can book services for any time within these hours.',
      icon: 'clock-outline'
    },
    {
      id: 3,
      question: 'How do I cancel or reschedule a booking?',
      answer: 'Go to "My Bookings" screen, select your booking, and choose "Cancel" or "Reschedule". Cancellations made 2 hours before service are free.',
      icon: 'calendar-remove'
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery, UPI, credit/debit cards, and net banking. Online payment is available during booking.',
      icon: 'credit-card-outline'
    },
    {
      id: 5,
      question: 'Do you provide service warranty?',
      answer: 'Yes! All our services come with a 7-day service warranty. If you face any issues, contact support immediately.',
      icon: 'shield-check-outline'
    },
    {
      id: 6,
      question: 'How long does a car wash take?',
      answer: 'Basic wash: 45 mins, Premium wash: 1.5 hours, Full service: 2-3 hours depending on vehicle condition.',
      icon: 'car-wash'
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'Call Support',
      subtitle: 'Talk to our executive',
      icon: 'phone',
      color: '#4CAF50',
      action: () => Linking.openURL('tel:+919876543210')
    },
    {
      id: 2,
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      icon: 'whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/919876543210')
    },
    {
      id: 3,
      title: 'Email',
      subtitle: 'support@carwashindia.com',
      icon: 'email',
      color: '#FF5722',
      action: () => Linking.openURL('mailto:support@carwashindia.com')
    },
    {
      id: 4,
      title: 'Live Chat',
      subtitle: '24/7 available',
      icon: 'chat',
      color: '#2196F3',
      action: () => Alert.alert('Live Chat', 'Our live chat feature will be available soon!')
    },
  ];

  const supportTopics = [
    {
      id: 1,
      title: 'Booking Issues',
      icon: 'calendar-alert',
      color: '#FF9800'
    },
    {
      id: 2,
      title: 'Payment Problems',
      icon: 'credit-card-clock',
      color: '#F44336'
    },
    {
      id: 3,
      title: 'Service Feedback',
      icon: 'comment-check',
      color: '#4CAF50'
    },
    {
      id: 4,
      title: 'Technical Support',
      icon: 'tools',
      color: '#2196F3'
    },
    {
      id: 5,
      title: 'Account Issues',
      icon: 'account-alert',
      color: '#9C27B0'
    },
    {
      id: 6,
      title: 'Service Request',
      icon: 'clipboard-text',
      color: '#795548'
    },
  ];

  const handleSubmitQuery = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill all fields before submitting.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Query Submitted!',
        'Thank you for contacting us. Our support team will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              setName('');
              setEmail('');
            }
          }
        ]
      );
    }, 1500);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const renderFAQItem = (item) => (
    <View key={item.id} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <View style={[styles.faqIconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.faqQuestion}>{item.question}</Text>
      </View>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Icon name="help-circle" size={60} color="#FFFFFF" />
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>
              We're here to assist you 24/7 with any questions or concerns
            </Text>
          </View>
        </View>

        {/* Quick Contact */}
        <Text style={styles.sectionTitle}>Quick Contact</Text>
        <View style={styles.contactGrid}>
          {contactOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.contactCard}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.contactTitle}>{item.title}</Text>
              <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Topics */}
        <Text style={styles.sectionTitle}>Support Topics</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.topicsScroll}
        >
          {supportTopics.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.topicCard}
              activeOpacity={0.7}
            >
              <View style={[styles.topicIconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={30} color={item.color} />
              </View>
              <Text style={styles.topicTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.faqContainer}>
          {faqs.slice(0, 3).map(renderFAQItem)}
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => Alert.alert('All FAQs', 'Complete FAQ section coming soon!')}
          >
            <Text style={styles.viewMoreText}>View All FAQs</Text>
            <Icon name="chevron-right" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <Text style={styles.formSubtitle}>
            Can't find what you're looking for? Send us a message and we'll get back to you.
          </Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Describe your issue or question..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitQuery}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Submitting...</Text>
              ) : (
                <>
                  <Icon name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Query</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Support */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Icon name="alert-circle" size={30} color="#F44336" />
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
          </View>
          <Text style={styles.emergencyText}>
            Need immediate assistance? Our emergency support line is available 24/7
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+911234567890')}
          >
            <Icon name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Call Emergency: +91 9899123456</Text>
          </TouchableOpacity>
        </View>

        {/* Company Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Washing Express India</Text>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color="#666" />
            <Text style={styles.infoText}>
              Garu City Noida Extension, Noida, Uttar Pradesh 201308
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock" size={18} color="#666" />
            <Text style={styles.infoText}>
              Mon-Sun: 7:00 AM - 10:00 PM
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email" size={18} color="#666" />
            <Text style={styles.infoText}>
              support@washingExpress.com
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  backButtonContainer: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroSection: {
    backgroundColor: '#4A90E2',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  topicsScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topicIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  faqContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginRight: 8,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  formContainer: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#1F2937',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0C8FF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencyCard: {
    backgroundColor: '#FFF3F3',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F44336',
    marginLeft: 10,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
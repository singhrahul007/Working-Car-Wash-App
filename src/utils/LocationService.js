// utils/LocationService.js
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const LocationService = {
  // Request location permission
  async requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  },

  // Get current location
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      return location;
    } catch (error) {
      console.error('Get location error:', error);
      throw error;
    }
  },

  // Get address from coordinates
  async getAddressFromCoords(latitude, longitude) {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        return {
          city: place.city || place.region || place.country,
          address: [
            place.name,
            place.street,
            place.city,
            place.region,
            place.postalCode,
            place.country,
          ].filter(Boolean).join(', '),
          details: place,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocode error:', error);
      throw error;
    }
  },

  // Calculate distance between two coordinates (in km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Get approximate city from IP (fallback)
  async getApproximateCity() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.city || data.region || data.country_name;
    } catch (error) {
      console.error('IP location error:', error);
      return null;
    }
  }
};
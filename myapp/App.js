import React, { useEffect, useState } from 'react';
import { View, Text, PermissionsAndroid, AppState } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BackgroundGeolocation from 'react-native-background-geolocation';

const App = () => {
  const [locationCount, setLocationCount] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  let foregroundTimer = null;

  // Request location permissions
  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Location permission denied');
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
    }
  };

  // Fetch location count from the API
  const fetchLocationCount = async () => {
    try {
      const response = await fetch("https://location-ckvi.onrender.com/api/locations");
      const result = await response.json();
      setLocationCount(result.count || 0);
    } catch (error) {
      console.error('Error fetching locations count:', error);
    }
  };

  // Send location to the API
  const postLocationToAPI = async (location = null) => {
    try {
      const latitude = location?.coords?.latitude || '17.9788';
      const longitude = location?.coords?.longitude || '15.8789';

      const data = {
        latitude,
        longitude,
        street: "MG Road",
        area: "Central Bangalore",
        town: "Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        postalCode: "560001",
        fullAddress: "MG Road, Central Bangalore, Bangalore, Karnataka, India",
      };

      const response = await fetch("https://location-ckvi.onrender.com/api/store-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log('Location sent to API:', await response.json());
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  // Start foreground timer for location posting
  const startForegroundTimer = () => {
    if (foregroundTimer) clearInterval(foregroundTimer);
    foregroundTimer = setInterval(() => {
      console.log('Posting location from foreground timer');
      BackgroundGeolocation.getCurrentPosition(
        {
          timeout: 30, // Timeout in seconds
          maximumAge: 5000, // Cache age in milliseconds
          desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH, // Accuracy level
        },
        (location) => postLocationToAPI(location),
        (error) => console.error('Error fetching location in foreground timer:', error)
      );
    }, 10000); // 10 seconds interval
  };

  // Stop foreground timer
  const stopForegroundTimer = () => {
    if (foregroundTimer) {
      clearInterval(foregroundTimer);
      foregroundTimer = null;
    }
  };

  // Configure Background Fetch for periodic location fetch
  const configureBackgroundFetch = () => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Minimum 15 minutes for background fetch
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      },
      async (taskId) => {
        console.log('[BackgroundFetch] Task triggered:', taskId);
        BackgroundGeolocation.getCurrentPosition(
          {
            timeout: 30,
            maximumAge: 5000,
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          },
          (location) => postLocationToAPI(location),
          (error) => console.error('Error fetching location during BackgroundFetch:', error)
        );
        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.error('[BackgroundFetch] Failed to configure:', error);
      }
    );
  };

  useEffect(() => {
    requestPermissions();
    fetchLocationCount();

    BackgroundGeolocation.ready(
      {
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 50,
        stopOnTerminate: false,
        startOnBoot: true,
      },
      (state) => {
        if (!state.enabled) {
          BackgroundGeolocation.start();
        }
      }
    );

    startForegroundTimer();
    configureBackgroundFetch();

    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        console.log('App moved to background');
        stopForegroundTimer();
      } else if (nextAppState === 'active') {
        console.log('App moved to foreground');
        startForegroundTimer();
      }
      setAppState(nextAppState);
    });

    return () => {
      BackgroundGeolocation.removeListeners();
      BackgroundFetch.stop();
      stopForegroundTimer();
      appStateListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Location Post Count: {locationCount}</Text>
      <Text>App State: {appState}</Text>
    </View>
  );
};

export default App;

/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';

const HeadlessTask = async (event) => {
  console.log('[BackgroundFetch HeadlessTask] Start:', event);

  // Perform the API call
  try {
    const response = await fetch('https://location-ckvi.onrender.com/api/store-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: '17.9788',
        longitude: '15.8789',
        street: 'MG Road',
        area: 'Central Bangalore',
        town: 'Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
        fullAddress: 'MG Road, Central Bangalore, Bangalore, Karnataka, India',
      }),
    });

    const result = await response.json();
    console.log('[BackgroundFetch HeadlessTask] API Response:', result);
  } catch (error) {
    console.error('[BackgroundFetch HeadlessTask] Error:', error);
  }

  BackgroundFetch.finish(event.taskId);
};

// Register HeadlessTask
BackgroundFetch.registerHeadlessTask(HeadlessTask);

AppRegistry.registerComponent(appName, () => App);

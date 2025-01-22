/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import StorageUtils from './src/utils/storage';
import { setCredentials } from './src/store/slices/authSlice';

const styles = {
  root: {
    flex: 1,
  },
};

const App = () => {
  useEffect(() => {
    // Check for stored auth data on app launch
    const initializeAuth = async () => {
      const token = StorageUtils.getAuthToken();
      console.log('Token:', token);
      const userData = StorageUtils.getUserData();

      if (token && userData) {
        // Restore auth state from storage
        store.dispatch(setCredentials({
          user: userData,
          token: token,
        }));
      }
    };

    initializeAuth();
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;

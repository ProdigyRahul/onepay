import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.background,
          },
          headerTintColor: Theme.colors.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'OnePay',
          }}
        />
      </Stack>
    </>
  );
}

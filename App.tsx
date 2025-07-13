// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // 헤더 완전히 숨기기
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
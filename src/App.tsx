import React, { useReducer } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import { reducer, initialState } from './state/reducer';

export default function App() {
  // useReducer 세팅
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SafeAreaView style={styles.container}>
      {/* HomeScreen에 state와 dispatch 전달 */}
      <HomeScreen
        categories={state.categories}
        dispatch={dispatch}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
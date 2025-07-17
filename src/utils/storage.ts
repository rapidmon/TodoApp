// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { State } from '../types';

const STORAGE_KEY = 'TodoApp_Categories';

export const saveState = async (state: State): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('State saved successfully');
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

export const loadState = async (): Promise<State | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const state = JSON.parse(jsonValue);
      console.log('State loaded successfully');
      return state;
    }
    return null;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
};

export const clearState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('State cleared successfully');
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};
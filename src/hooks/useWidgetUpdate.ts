// src/hooks/useWidgetUpdate.ts
import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { State } from '../state/reducer';

const { WidgetDataManager } = NativeModules;

export const useWidgetUpdate = (state: State) => {
  useEffect(() => {
    if (Platform.OS === 'android' && WidgetDataManager) {
      // 상태가 변경될 때마다 위젯 업데이트
      const updateWidget = async () => {
        try {
          await WidgetDataManager.updateWidgetData(JSON.stringify(state.categories));
          console.log('Widget updated successfully');
        } catch (error) {
          console.error('Failed to update widget:', error);
        }
      };
      
      updateWidget();
    }
  }, [state]);
};
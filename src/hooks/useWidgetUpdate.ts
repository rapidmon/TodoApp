// src/hooks/useWidgetUpdate.ts
import { useEffect } from 'react';
import { NativeModules, Platform, AppState, AppStateStatus } from 'react-native';
import { State } from '../types';
import { Action } from '../state/actions';

const { WidgetDataManager } = NativeModules;

interface WidgetChange {
  action: string;
  categoryId: string;
  todoId: string;
  timestamp: number;
}

export const useWidgetUpdate = (state: State, dispatch: React.Dispatch<Action>) => {
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

  useEffect(() => {
    if (Platform.OS === 'android' && WidgetDataManager) {
      // 앱이 활성화될 때 위젯 변경사항 확인
      const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          try {
            const changesJson = await WidgetDataManager.getWidgetChanges();
            const changes: WidgetChange[] = JSON.parse(changesJson);
            
            // 위젯에서 발생한 변경사항 적용
            changes.forEach((change: WidgetChange) => {
              switch (change.action) {
                case 'TOGGLE_COMPLETED':
                  dispatch({
                    type: 'TOGGLE_TODO_COMPLETED',
                    payload: {
                      categoryId: change.categoryId,
                      todoId: change.todoId
                    }
                  });
                  break;
                case 'DELETE':
                  dispatch({
                    type: 'REMOVE_TODO',
                    payload: {
                      categoryId: change.categoryId,
                      todoId: change.todoId
                    }
                  });
                  break;
              }
            });
            
            if (changes.length > 0) {
              console.log(`Applied ${changes.length} widget changes`);
            }
          } catch (error) {
            console.error('Failed to sync widget changes:', error);
          }
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription?.remove();
      };
    }
  }, [dispatch]);
};
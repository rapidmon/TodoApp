// src/screens/HomeScreen.tsx
import React, { useReducer, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reducer, initialState } from '../state/reducer';
import { useWidgetUpdate } from '../hooks/useWidgetUpdate';
import { saveState, loadState } from '../utils/storage';
import AddCategory from '../components/AddCategory';
import Category from '../components/Category';

export default function HomeScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  
  useWidgetUpdate(state, dispatch);

  // 앱 시작 시 저장된 데이터 불러오기
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const savedState = await loadState();
        if (savedState) {
          // 저장된 데이터가 있으면 복원
          dispatch({ type: 'RESTORE_STATE', payload: savedState });
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // 상태 변경 시마다 자동으로 저장
  useEffect(() => {
    if (!isLoading) {
      saveState(state);
    }
  }, [state, isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>할 일 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>할 일 목록</Text>
          <AddCategory onAddCategory={(name) => dispatch({ type: 'ADD_CATEGORY', payload: { name } })} />
        </View>
        
        {state.categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>아직 카테고리가 없습니다.</Text>
            <Text style={styles.emptySubtext}>위의 버튼을 눌러 새 카테고리를 만들어보세요!</Text>
          </View>
        ) : (
          state.categories.map((category) => (
            <Category
              key={category.id}
              category={category}
              onRemoveCategory={(categoryId) => dispatch({ type: 'REMOVE_CATEGORY', payload: { categoryId } })}
              onUpdateCategory={(categoryId, name) => dispatch({ type: 'UPDATE_CATEGORY', payload: { categoryId, name } })}
              onAddTodo={(categoryId, title, timeLeft, isRoutine, routineType, routineConfig) => 
                dispatch({ 
                  type: 'ADD_TODO', 
                  payload: { categoryId, title, timeLeft, isRoutine, routineType, routineConfig } 
                })
              }
              onRemoveTodo={(categoryId, todoId) => dispatch({ type: 'REMOVE_TODO', payload: { categoryId, todoId } })}
              onUpdateTodo={(categoryId, todoId, title, timeLeft, isRoutine, routineType, routineConfig) => 
                dispatch({ 
                  type: 'UPDATE_TODO', 
                  payload: { categoryId, todoId, title, timeLeft, isRoutine, routineType, routineConfig } 
                })
              }
              onToggleTodoCompleted={(categoryId, todoId) => dispatch({ type: 'TOGGLE_TODO_COMPLETED', payload: { categoryId, todoId } })}
              onRemoveCompletedTodos={(categoryId) => dispatch({ type: 'REMOVE_COMPLETED_TODOS', payload: { categoryId } })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
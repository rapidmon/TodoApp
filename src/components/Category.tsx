// src/components/Category.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Category as CategoryType } from '../types';
import AddTodo from './Addtodo';
import Todo from './Todo';

interface Props {
  category: CategoryType;
  onRemoveCategory: (categoryId: string) => void;
  onUpdateCategory: (categoryId: string, name: string) => void;
  onAddTodo: (categoryId: string, title: string, timeLeft: number, isRoutine: boolean, routineType?: 'daily' | 'weekly' | 'monthly', routineConfig?: { days?: number[], date?: number }) => void;
  onRemoveTodo: (categoryId: string, todoId: string) => void;
  onUpdateTodo: (categoryId: string, todoId: string, title?: string, timeLeft?: number, isRoutine?: boolean, routineType?: 'daily' | 'weekly' | 'monthly', routineConfig?: { days?: number[], date?: number }) => void;
  onToggleTodoCompleted: (categoryId: string, todoId: string) => void;
  onRemoveCompletedTodos: (categoryId: string) => void;
}

export default function Category({ 
  category, 
  onRemoveCategory, 
  onUpdateCategory, 
  onAddTodo, 
  onRemoveTodo, 
  onUpdateTodo,
  onToggleTodoCompleted,
  onRemoveCompletedTodos
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRemove = () => {
    Alert.alert(
      '카테고리 삭제',
      `"${category.name}" 카테고리를 삭제하시겠습니까?\n모든 할 일이 함께 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onRemoveCategory(category.id) }
      ]
    );
  };

  const handleUpdate = () => {
    if (editName.trim()) {
      onUpdateCategory(category.id, editName.trim());
      setIsEditing(false);
    } else {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
    }
  };

  const handleCancelEdit = () => {
    setEditName(category.name);
    setIsEditing(false);
  };

  // 루틴과 일반 할 일을 분리
  const routineTodos = category.todos.filter(todo => todo.isRoutine);
  const regularTodos = category.todos.filter(todo => !todo.isRoutine);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>{category.name}</Text>
            <View style={styles.buttonContainer}>
              {category.todos.some(todo => todo.completed) && (
                <TouchableOpacity 
                  style={styles.clearCompletedButton} 
                  onPress={() => onRemoveCompletedTodos(category.id)}
                >
                  <Text style={styles.clearCompletedButtonText}>완료 삭제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <Text style={styles.removeButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {isExpanded && (
        <View style={styles.content}>
          <AddTodo 
            onAddTodo={(title, timeLeft, isRoutine, routineType, routineConfig) => 
              onAddTodo(category.id, title, timeLeft, isRoutine, routineType, routineConfig)
            }
          />
          
          {category.todos.length === 0 ? (
            <Text style={styles.emptyText}>아직 할 일이 없습니다.</Text>
          ) : (
            <>
              {/* 루틴 할 일들 */}
              {routineTodos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔄 루틴 업무</Text>
                  {routineTodos.map((todo) => (
                    <Todo
                      key={todo.id}
                      todo={todo}
                      onRemove={() => onRemoveTodo(category.id, todo.id)}
                      onUpdate={(title, timeLeft, isRoutine, routineType, routineConfig) => 
                        onUpdateTodo(category.id, todo.id, title, timeLeft, isRoutine, routineType, routineConfig)
                      }
                      onToggleCompleted={() => onToggleTodoCompleted(category.id, todo.id)}
                    />
                  ))}
                </View>
              )}
              
              {/* 일반 할 일들 */}
              {regularTodos.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 일반 업무</Text>
                  {regularTodos.map((todo) => (
                    <Todo
                      key={todo.id}
                      todo={todo}
                      onRemove={() => onRemoveTodo(category.id, todo.id)}
                      onUpdate={(title, timeLeft, isRoutine, routineType, routineConfig) => 
                        onUpdateTodo(category.id, todo.id, title, timeLeft, isRoutine, routineType, routineConfig)
                      }
                      onToggleCompleted={() => onToggleTodoCompleted(category.id, todo.id)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expandButton: {
    marginRight: 12,
    padding: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearCompletedButton: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
  },
  clearCompletedButtonText: {
    color: '#388e3c',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#666',
    fontSize: 14,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    marginRight: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
});
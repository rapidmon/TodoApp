// src/components/Todo.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Todo as TodoType } from '../types';

interface Props {
  todo: TodoType;
  onRemove: () => void;
  onUpdate: (title?: string, timeLeft?: number) => void;
  onToggleCompleted: () => void;
}

export default function Todo({ todo, onRemove, onUpdate, onToggleCompleted }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDate, setEditDate] = useState(() => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + todo.timeLeft);
    return targetDate;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRemove = () => {
    Alert.alert(
      '할 일 삭제',
      `"${todo.title}"을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: onRemove }
      ]
    );
  };

  const handleUpdate = () => {
    if (editTitle.trim()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(editDate);
      targetDate.setHours(0, 0, 0, 0);
      
      const timeDiff = targetDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      onUpdate(editTitle.trim(), daysDiff);
      setIsEditing(false);
    } else {
      Alert.alert('알림', '할 일 제목을 입력해주세요.');
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + todo.timeLeft);
    setEditDate(targetDate);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setEditDate(date);
    }
  };

  const getBarColor = (timeLeft: number, completed: boolean) => {
    if (completed) {
      return '#888'; // 회색 - 완료됨
    }
    if (timeLeft < 0) {
      return '#d32f2f'; // 빨간색 - 지난 일
    } else if (timeLeft === 0) {
      return '#ff9800'; // 주황색 - 오늘
    } else if (timeLeft <= 3) {
      return '#f57c00'; // 주황색 - 3일 이내
    } else {
      return '#388e3c'; // 초록색 - 여유있음
    }
  };

  const renderTimeBar = () => {
    const maxBars = 21; // 3주
    const timeLeft = todo.timeLeft;
    
    // 완료된 경우 모든 바를 회색으로
    if (todo.completed) {
      const bars = [];
      for (let i = 0; i < maxBars; i++) {
        bars.push(
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: '#d0d0d0' },
            ]}
          />
        );
      }
      return (
        <View style={styles.barContainer}>
          <View style={styles.barsWrapper}>
            {bars}
          </View>
        </View>
      );
    }
    
    // 바의 개수 계산 (최대 21개)
    let barCount = Math.min(Math.max(timeLeft, 0), maxBars);
    
    // 지난 날짜인 경우 0개
    if (timeLeft < 0) {
      barCount = 0;
    }
    
    const bars = [];
    
    for (let i = 0; i < maxBars; i++) {
      const isActive = i < barCount;
      bars.push(
        <View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: isActive ? getBarColor(timeLeft, todo.completed) : '#e0e0e0',
            },
          ]}
        />
      );
    }
    
    return (
      <View style={styles.barContainer}>
        <View style={styles.barsWrapper}>
          {bars}
        </View>
      </View>
    );
  };

  const truncateTitle = (title: string, maxLength: number = 10) => {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength) + '...';
  };

  if (isEditing) {
    return (
      <View style={[styles.container, styles.editingContainer]}>
        <TextInput
          style={styles.editInput}
          value={editTitle}
          onChangeText={setEditTitle}
          autoFocus
        />
        
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>마감일: {formatDate(editDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={editDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.editButtonContainer}>
          <TouchableOpacity style={styles.cancelEditButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelEditButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, todo.completed && styles.completedContainer]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        {/* 체크박스 */}
        <TouchableOpacity 
          style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
          onPress={onToggleCompleted}
        >
          {todo.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.title, todo.completed && styles.completedTitle]}>
          {truncateTitle(todo.title)}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Text style={styles.removeButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 체력바 스타일 시간 표시 */}
      {renderTimeBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  editingContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#388e3c',
    borderColor: '#388e3c',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 12,
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
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '500',
  },
  barContainer: {
    marginTop: 4,
  },
  barsWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  bar: {
    width: 10,
    height: 16,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelEditButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
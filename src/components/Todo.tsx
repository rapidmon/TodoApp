// src/components/Todo.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Todo as TodoType } from '../types';

interface Props {
  todo: TodoType;
  onRemove: () => void;
  onUpdate: (title?: string, timeLeft?: number) => void;
}

export default function Todo({ todo, onRemove, onUpdate }: Props) {
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

  const getTimeLeftText = (timeLeft: number) => {
    if (timeLeft < 0) {
      return `${Math.abs(timeLeft)}일 지남`;
    } else if (timeLeft === 0) {
      return '오늘';
    } else {
      return `${timeLeft}일 남음`;
    }
  };

  const getTimeLeftColor = (timeLeft: number) => {
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{todo.title}</Text>
        <Text style={[styles.timeLeft, { color: getTimeLeftColor(todo.timeLeft) }]}>
          {getTimeLeftText(todo.timeLeft)}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Text style={styles.removeButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editingContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timeLeft: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
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
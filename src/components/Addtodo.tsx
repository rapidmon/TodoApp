// src/components/AddTodo.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  onAddTodo: (title: string, timeLeft: number) => void;
}

export default function AddTodo({ onAddTodo }: Props) {
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      
      const timeDiff = targetDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      onAddTodo(title.trim(), daysDiff);
      setTitle('');
      setSelectedDate(new Date());
      setIsVisible(false);
    } else {
      Alert.alert('알림', '할 일 제목을 입력해주세요.');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setSelectedDate(new Date());
    setIsVisible(false);
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
      setSelectedDate(date);
    }
  };

  if (!isVisible) {
    return (
      <TouchableOpacity style={styles.button} onPress={() => setIsVisible(true)}>
        <Text style={styles.buttonText}>+ 새 할 일</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="할 일을 입력하세요"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />
      
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>마감일: {formatDate(selectedDate)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
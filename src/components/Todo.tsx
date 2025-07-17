// src/components/Todo.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Todo as TodoType } from '../types';

interface Props {
  todo: TodoType;
  onRemove: () => void;
  onUpdate: (title?: string, timeLeft?: number, isRoutine?: boolean, routineType?: 'daily' | 'weekly' | 'monthly', routineConfig?: { days?: number[], date?: number }) => void;
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
  const [editIsRoutine, setEditIsRoutine] = useState(todo.isRoutine);
  const [editRoutineType, setEditRoutineType] = useState<'daily' | 'weekly' | 'monthly'>(todo.routineType || 'daily');
  const [editSelectedDays, setEditSelectedDays] = useState<number[]>(todo.routineConfig?.days || []);
  const [editMonthlyDate, setEditMonthlyDate] = useState(todo.routineConfig?.date || 1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
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

  const getNextRoutineDate = (type: 'daily' | 'weekly' | 'monthly', config: { days?: number[], date?: number }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'daily') {
      return 1;
    } else if (type === 'weekly' && config.days) {
      const todayDay = today.getDay();
      const sortedDays = config.days.sort((a, b) => a - b);
      
      let nextDay = sortedDays.find(day => day > todayDay);
      if (!nextDay) {
        nextDay = sortedDays[0];
      }
      
      const daysUntilNext = nextDay > todayDay ? 
        nextDay - todayDay : 
        7 - todayDay + nextDay;
      
      return daysUntilNext;
    } else if (type === 'monthly' && config.date) {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentDate = today.getDate();
      
      let nextMonth = currentMonth;
      let nextYear = currentYear;
      
      if (currentDate >= config.date) {
        nextMonth += 1;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
      }
      
      const nextDate = new Date(nextYear, nextMonth, config.date);
      const timeDiff = nextDate.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    return 0;
  };

  const handleUpdate = () => {
    if (editTitle.trim()) {
      let timeLeft = 0;
      let routineConfig = undefined;

      if (editIsRoutine) {
        if (editRoutineType === 'daily') {
          timeLeft = 1;
        } else if (editRoutineType === 'weekly') {
          if (editSelectedDays.length === 0) {
            Alert.alert('알림', '루틴 요일을 선택해주세요.');
            return;
          }
          routineConfig = { days: editSelectedDays };
          timeLeft = getNextRoutineDate(editRoutineType, routineConfig);
        } else if (editRoutineType === 'monthly') {
          routineConfig = { date: editMonthlyDate };
          timeLeft = getNextRoutineDate(editRoutineType, routineConfig);
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(editDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const timeDiff = targetDate.getTime() - today.getTime();
        timeLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }
      
      onUpdate(editTitle.trim(), timeLeft, editIsRoutine, editRoutineType, routineConfig);
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
    setEditIsRoutine(todo.isRoutine);
    setEditRoutineType(todo.routineType || 'daily');
    setEditSelectedDays(todo.routineConfig?.days || []);
    setEditMonthlyDate(todo.routineConfig?.date || 1);
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

  const toggleDay = (day: number) => {
    setEditSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
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
    const maxBars = 21;
    const timeLeft = todo.timeLeft;
    
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
    
    let barCount = Math.min(Math.max(timeLeft, 0), maxBars);
    
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

  const getRoutineText = () => {
    if (!todo.isRoutine) return '';
    
    if (todo.routineType === 'daily') {
      return '매일 반복';
    } else if (todo.routineType === 'weekly' && todo.routineConfig?.days) {
      const dayNames = todo.routineConfig.days.map(day => weekDays[day]).join(', ');
      return `매주 ${dayNames}`;
    } else if (todo.routineType === 'monthly' && todo.routineConfig?.date) {
      return `매월 ${todo.routineConfig.date}일`;
    }
    
    return '루틴';
  };

  const truncateTitle = (title: string, maxLength: number = 10) => {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength) + '...';
  };

  if (isEditing) {
    return (
      <ScrollView style={[styles.container, styles.editingContainer]}>
        <TextInput
          style={styles.editInput}
          value={editTitle}
          onChangeText={setEditTitle}
          autoFocus
        />
        
        {/* 루틴 설정 */}
        <View style={styles.routineContainer}>
          <TouchableOpacity 
            style={styles.routineToggle}
            onPress={() => setEditIsRoutine(!editIsRoutine)}
          >
            <View style={[styles.checkbox, editIsRoutine && styles.checkboxCompleted]}>
              {editIsRoutine && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.routineLabel}>루틴 업무</Text>
          </TouchableOpacity>
          
          {editIsRoutine && (
            <View style={styles.routineOptions}>
              <View style={styles.routineTypeContainer}>
                <TouchableOpacity 
                  style={[styles.routineTypeButton, editRoutineType === 'daily' && styles.routineTypeButtonActive]}
                  onPress={() => setEditRoutineType('daily')}
                >
                  <Text style={[styles.routineTypeText, editRoutineType === 'daily' && styles.routineTypeTextActive]}>매일</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.routineTypeButton, editRoutineType === 'weekly' && styles.routineTypeButtonActive]}
                  onPress={() => setEditRoutineType('weekly')}
                >
                  <Text style={[styles.routineTypeText, editRoutineType === 'weekly' && styles.routineTypeTextActive]}>주간</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.routineTypeButton, editRoutineType === 'monthly' && styles.routineTypeButtonActive]}
                  onPress={() => setEditRoutineType('monthly')}
                >
                  <Text style={[styles.routineTypeText, editRoutineType === 'monthly' && styles.routineTypeTextActive]}>월간</Text>
                </TouchableOpacity>
              </View>
              
              {editRoutineType === 'weekly' && (
                <View style={styles.weeklyContainer}>
                  <Text style={styles.weeklyLabel}>요일 선택:</Text>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDayButton,
                          editSelectedDays.includes(index) && styles.weekDayButtonSelected
                        ]}
                        onPress={() => toggleDay(index)}
                      >
                        <Text style={[
                          styles.weekDayText,
                          editSelectedDays.includes(index) && styles.weekDayTextSelected
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {editRoutineType === 'monthly' && (
                <View style={styles.monthlyContainer}>
                  <Text style={styles.monthlyLabel}>매월 {editMonthlyDate}일</Text>
                  <View style={styles.monthlyDateContainer}>
                    <TouchableOpacity 
                      style={styles.monthlyButton}
                      onPress={() => setEditMonthlyDate(Math.max(1, editMonthlyDate - 1))}
                    >
                      <Text style={styles.monthlyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthlyDateText}>{editMonthlyDate}</Text>
                    <TouchableOpacity 
                      style={styles.monthlyButton}
                      onPress={() => setEditMonthlyDate(Math.min(31, editMonthlyDate + 1))}
                    >
                      <Text style={styles.monthlyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        
        {!editIsRoutine && (
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>마감일: {formatDate(editDate)}</Text>
          </TouchableOpacity>
        )}

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
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, todo.completed && styles.completedContainer]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
          onPress={onToggleCompleted}
        >
          {todo.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, todo.completed && styles.completedTitle]}>
            {truncateTitle(todo.title)}
          </Text>
          {todo.isRoutine && (
            <Text style={styles.routineText}>🔄 {getRoutineText()}</Text>
          )}
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
    maxHeight: 500,
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  routineText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  routineContainer: {
    marginBottom: 12,
  },
  routineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  routineOptions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  routineTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routineTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },
  routineTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  routineTypeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  routineTypeTextActive: {
    color: '#fff',
  },
  weeklyContainer: {
    marginTop: 8,
  },
  weeklyLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  weekDayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  weekDayText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  weekDayTextSelected: {
    color: '#fff',
  },
  monthlyContainer: {
    marginTop: 8,
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  monthlyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  monthlyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthlyDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
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
    marginTop: 12,
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
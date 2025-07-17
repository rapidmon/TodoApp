// src/components/AddTodo.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  onAddTodo: (title: string, timeLeft: number, isRoutine: boolean, routineType?: 'daily' | 'weekly' | 'monthly', routineConfig?: { days?: number[], date?: number }) => void;
}

export default function AddTodo({ onAddTodo }: Props) {
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRoutine, setIsRoutine] = useState(false);
  const [routineType, setRoutineType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [monthlyDate, setMonthlyDate] = useState(1);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  const handleAdd = () => {
    if (title.trim()) {
      let timeLeft = 0;
      let routineConfig = undefined;

      if (isRoutine) {
        const today = new Date();
        
        if (routineType === 'daily') {
          timeLeft = 0; // 매일 루틴은 오늘
        } else if (routineType === 'weekly') {
          if (selectedDays.length === 0) {
            Alert.alert('알림', '루틴 요일을 선택해주세요.');
            return;
          }
          routineConfig = { days: selectedDays };
          timeLeft = getNextRoutineDate(routineType, routineConfig);
        } else if (routineType === 'monthly') {
          routineConfig = { date: monthlyDate };
          timeLeft = getNextRoutineDate(routineType, routineConfig);
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const timeDiff = targetDate.getTime() - today.getTime();
        timeLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }
      
      onAddTodo(title.trim(), timeLeft, isRoutine, routineType, routineConfig);
      resetForm();
    } else {
      Alert.alert('알림', '할 일을 입력해주세요.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setSelectedDate(new Date());
    setIsRoutine(false);
    setRoutineType('daily');
    setSelectedDays([]);
    setMonthlyDate(1);
    setIsVisible(false);
  };

  const getNextRoutineDate = (type: 'daily' | 'weekly' | 'monthly', config: { days?: number[], date?: number }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'daily') {
      return 0; // 매일
    } else if (type === 'weekly' && config.days) {
      const todayDay = today.getDay();
      const sortedDays = config.days.sort((a, b) => a - b);
      
      // 오늘 이후의 가장 가까운 요일 찾기
      let nextDay = sortedDays.find(day => day > todayDay);
      if (!nextDay) {
        nextDay = sortedDays[0]; // 다음 주의 첫 번째 요일
      }
      
      const daysUntilNext = nextDay > todayDay ? 
        nextDay - todayDay : 
        7 - todayDay + nextDay;
      
      return daysUntilNext;
    } else if (type === 'monthly' && config.date) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, config.date);
      const timeDiff = nextMonth.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    return 0;
  };

  const handleCancel = () => {
    resetForm();
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

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  if (!isVisible) {
    return (
      <TouchableOpacity style={styles.button} onPress={() => setIsVisible(true)}>
        <Text style={styles.buttonText}>+ 새 할 일</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="할 일을 입력하세요"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />
      
      {/* 루틴 설정 */}
      <View style={styles.routineContainer}>
        <TouchableOpacity 
          style={styles.routineToggle}
          onPress={() => setIsRoutine(!isRoutine)}
        >
          <View style={[styles.checkbox, isRoutine && styles.checkboxChecked]}>
            {isRoutine && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.routineLabel}>루틴 업무</Text>
        </TouchableOpacity>
        
        {isRoutine && (
          <View style={styles.routineOptions}>
            {/* 루틴 타입 선택 */}
            <View style={styles.routineTypeContainer}>
              <TouchableOpacity 
                style={[styles.routineTypeButton, routineType === 'daily' && styles.routineTypeButtonActive]}
                onPress={() => setRoutineType('daily')}
              >
                <Text style={[styles.routineTypeText, routineType === 'daily' && styles.routineTypeTextActive]}>매일</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.routineTypeButton, routineType === 'weekly' && styles.routineTypeButtonActive]}
                onPress={() => setRoutineType('weekly')}
              >
                <Text style={[styles.routineTypeText, routineType === 'weekly' && styles.routineTypeTextActive]}>주간</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.routineTypeButton, routineType === 'monthly' && styles.routineTypeButtonActive]}
                onPress={() => setRoutineType('monthly')}
              >
                <Text style={[styles.routineTypeText, routineType === 'monthly' && styles.routineTypeTextActive]}>월간</Text>
              </TouchableOpacity>
            </View>
            
            {/* 주간 루틴 설정 */}
            {routineType === 'weekly' && (
              <View style={styles.weeklyContainer}>
                <Text style={styles.weeklyLabel}>요일 선택:</Text>
                <View style={styles.weekDaysContainer}>
                  {weekDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.weekDayButton,
                        selectedDays.includes(index) && styles.weekDayButtonSelected
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[
                        styles.weekDayText,
                        selectedDays.includes(index) && styles.weekDayTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* 월간 루틴 설정 */}
            {routineType === 'monthly' && (
              <View style={styles.monthlyContainer}>
                <Text style={styles.monthlyLabel}>매월 {monthlyDate}일</Text>
                <View style={styles.monthlyDateContainer}>
                  <TouchableOpacity 
                    style={styles.monthlyButton}
                    onPress={() => setMonthlyDate(Math.max(1, monthlyDate - 1))}
                  >
                    <Text style={styles.monthlyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthlyDateText}>{monthlyDate}</Text>
                  <TouchableOpacity 
                    style={styles.monthlyButton}
                    onPress={() => setMonthlyDate(Math.min(31, monthlyDate + 1))}
                  >
                    <Text style={styles.monthlyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* 일반 할 일 마감일 설정 */}
      {!isRoutine && (
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>마감일: {formatDate(selectedDate)}</Text>
        </TouchableOpacity>
      )}

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
    </ScrollView>
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
    maxHeight: 400,
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
  routineContainer: {
    marginBottom: 12,
  },
  routineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routineLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  routineOptions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  monthlyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthlyDateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
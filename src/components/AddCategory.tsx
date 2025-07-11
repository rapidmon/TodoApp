// src/components/AddCategory.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

interface Props {
  onAddCategory: (name: string) => void;
}

export default function AddCategory({ onAddCategory }: Props) {
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleAdd = () => {
    if (name.trim()) {
      onAddCategory(name.trim());
      setName('');
      setIsVisible(false);
    } else {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
    }
  };

  const handleCancel = () => {
    setName('');
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <TouchableOpacity style={styles.button} onPress={() => setIsVisible(true)}>
        <Text style={styles.buttonText}>+ 새 카테고리</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="카테고리 이름을 입력하세요"
        value={name}
        onChangeText={setName}
        autoFocus
      />
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
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
    backgroundColor: '#007AFF',
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
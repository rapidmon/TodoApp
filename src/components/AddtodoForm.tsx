import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Action } from '../state/actions';

interface AddTodoFormProps {
    categoryId: string;
    dispatch: React.Dispatch<Action>;
}

const styles = StyleSheet.create({
    form: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginRight: 8,
    },
});

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ categoryId, dispatch }) => {
    const [title, setTitle] = useState('');
    const [timeLeft, setTimeLeft] = useState('');

    const onAdd = () => {
        if (!title.trim() || !timeLeft.trim()) return;
        dispatch({
        type: 'ADD_TODO',
        payload: { categoryId, title: title.trim(), timeLeft: parseInt(timeLeft, 10) },
        });
        setTitle('');
        setTimeLeft('');
    };

    return (
        <View style={styles.form}>
        <TextInput
            style={styles.input}
            placeholder="할 일"
            value={title}
            onChangeText={setTitle}
        />
        <TextInput
            style={styles.input}
            placeholder="남은 시간(분)"
            value={timeLeft}
            onChangeText={setTimeLeft}
            keyboardType="numeric"
        />
        <Button title="추가" onPress={onAdd} />
        </View>
    );
};
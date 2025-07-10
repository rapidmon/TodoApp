import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Todo } from '../types';
import { Action } from '../state/actions';

interface TodoItemProps {
    categoryId: string;
    todo: Todo;
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        marginRight: 8,
        height: 40,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    texts: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
});

export const TodoItem: React.FC<TodoItemProps> = ({ categoryId, todo, dispatch }) => {
    const onRemove = () => {
        dispatch({ type: 'REMOVE_TODO', payload: { categoryId, todoId: todo.id } });
    };

    return (
        <View style={styles.item}>
        <View style={styles.texts}>
            <Text style={styles.title}>{todo.title}</Text>
            <Text style={styles.time}>{todo.timeLeft}분 남음</Text>
        </View>
        <Button title="삭제" onPress={onRemove} />
        </View>
    );
};
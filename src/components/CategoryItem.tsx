import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { Category, Todo } from '../types';
import { Action } from '../state/actions';
import { AddTodoForm } from './AddtodoForm';
import { TodoItem } from './TodoItem';

interface Props {
    category: Category;
    dispatch: React.Dispatch<Action>;
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        padding: 12,
        backgroundColor: '#fafafa',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 16,
    },
});

const CategoryItem: React.FC<Props> = ({ category, dispatch }) => {
    const onRemoveCategory = () => {
        dispatch({ type: 'REMOVE_CATEGORY', payload: { categoryId: category.id } });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{category.name}</Text>
                <Button title="삭제" onPress={onRemoveCategory} />
            </View>

            <AddTodoForm categoryId={category.id} dispatch={dispatch} />

            <FlatList
                data={category.todos}
                keyExtractor={(item: Todo) => item.id}
                renderItem={({ item }) => (
                <TodoItem
                    todo={item}
                    categoryId={category.id}
                    dispatch={dispatch}
                />
                )}
                ListEmptyComponent={<Text style={styles.empty}>할 일이 없습니다</Text>}
            />
        </View>
    );
};

export default CategoryItem;
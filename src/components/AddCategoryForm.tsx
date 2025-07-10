import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Action } from '../state/actions';

interface Props {
    dispatch: React.Dispatch<Action>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginRight: 8,
        height: 40,
    },
});

const AddCategoryForm: React.FC<Props> = ({ dispatch }) => {
    const [name, setName] = useState('');

    const onAdd = () => {
        if (name.trim().length === 0) return;
        dispatch({ type: 'ADD_CATEGORY', payload: { name: name.trim() } });
        setName('');
    };

    return (
        <View style={styles.container}>
        <TextInput
            style={styles.input}
            placeholder="새 카테고리"
            value={name}
            onChangeText={setName}
        />
        <Button title="추가" onPress={onAdd} />
        </View>
    );
};

export default AddCategoryForm;
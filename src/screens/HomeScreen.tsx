import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Category } from '../types';
import { Action } from '../state/actions';
import AddCategoryForm from '../components/AddCategoryForm';
import CategoryItem from '../components/CategoryItem';

interface HomeScreenProps {
  categories: Category[];
  dispatch: React.Dispatch<Action>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ categories, dispatch }) => {
  return (
    <View style={styles.container}>
      <AddCategoryForm dispatch={dispatch} />
      <ScrollView contentContainerStyle={styles.categoriesContainer}>
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            dispatch={dispatch}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
});

export default HomeScreen;

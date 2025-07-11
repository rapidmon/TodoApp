// src/state/reducer.ts
import { Category, Todo } from '../types';
import { Action } from './actions';

export interface State {
    categories: Category[];
}

export const initialState: State = { categories: [] };

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD_CATEGORY': {
            const newCat: Category = {
                id: Date.now().toString(),
                name: action.payload.name,
                todos: [],
            };
            return { ...state, categories: [...state.categories, newCat] };
        }
        case 'REMOVE_CATEGORY': {
            return {
                ...state,
                categories: state.categories.filter(c => c.id !== action.payload.categoryId),
            };
        }
        case 'UPDATE_CATEGORY': {
            return {
                ...state,
                categories: state.categories.map(c => c.id === action.payload.categoryId ? { ...c, ...action.payload} : c),
            };
        }
        case 'ADD_TODO': {
            return {
                ...state,
                categories: state.categories.map(c =>
                c.id === action.payload.categoryId
                    ? {
                        ...c,
                        todos: [
                        ...c.todos,
                        {
                            id: Date.now().toString(),
                            title: action.payload.title,
                            timeLeft: action.payload.timeLeft,
                        } as Todo,
                        ],
                    }
                    : c
                ),
            };
        }
        case 'REMOVE_TODO': {
            return {
                ...state,
                categories: state.categories.map(c =>
                c.id === action.payload.categoryId
                    ? { ...c, todos: c.todos.filter(t => t.id !== action.payload.todoId) }
                    : c
                ),
            };
        }
        case 'UPDATE_TODO': {
            return {
                ...state,
                categories: state.categories.map(c =>
                c.id === action.payload.categoryId
                    ? {
                        ...c,
                        todos: c.todos.map(t =>
                        t.id === action.payload.todoId
                            ? { ...t, ...action.payload }
                            : t
                        ),
                    }
                    : c
                ),
            };
        }
        default:
        return state;
    }
}

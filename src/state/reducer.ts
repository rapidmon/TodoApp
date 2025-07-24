// src/state/reducer.ts
import { Category, Todo, State } from '../types';
import { Action } from './actions';
import { formatDateToString, calculateTimeLeft, getNextRoutineDate } from '../utils/DateCaculating';

export const initialState: State = { categories: [] };

// 모든 할 일의 timeLeft 업데이트
export const updateAllTimeLeft = (state: State): State => {
    return {
        ...state,
        categories: state.categories.map(category => ({
            ...category,
            todos: category.todos.map(todo => ({
                ...todo,
                timeLeft: calculateTimeLeft(todo.dueDate)
            }))
        }))
    };
};

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
                categories: state.categories.map(c => 
                    c.id === action.payload.categoryId ? { ...c, name: action.payload.name } : c
                ),
            };
        }
        case 'ADD_TODO': {
            const newTodo: Todo = {
                id: Date.now().toString(),
                title: action.payload.title,
                timeLeft: action.payload.timeLeft,
                dueDate: action.payload.dueDate,
                completed: false,
                isRoutine: action.payload.isRoutine || false,
                routineType: action.payload.routineType,
                routineConfig: action.payload.routineConfig,
            };
            
            return {
                ...state,
                categories: state.categories.map(c =>
                    c.id === action.payload.categoryId
                        ? { ...c, todos: [...c.todos, newTodo] }
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
                            ? { 
                                ...t, 
                                title: action.payload.title !== undefined ? action.payload.title : t.title,
                                timeLeft: action.payload.timeLeft !== undefined ? action.payload.timeLeft : t.timeLeft,
                                isRoutine: action.payload.isRoutine !== undefined ? action.payload.isRoutine : t.isRoutine,
                                routineType: action.payload.routineType !== undefined ? action.payload.routineType : t.routineType,
                                routineConfig: action.payload.routineConfig !== undefined ? action.payload.routineConfig : t.routineConfig,
                            }
                            : t
                        ),
                    }
                    : c
                ),
            };
        }
        case 'TOGGLE_TODO_COMPLETED': {
            return {
                ...state,
                categories: state.categories.map(c =>
                c.id === action.payload.categoryId
                    ? {
                        ...c,
                        todos: c.todos.map(t => {
                            if (t.id === action.payload.todoId) {
                                const newCompleted = !t.completed;
                                
                                // 루틴이고 완료 상태로 변경되는 경우
                                if (t.isRoutine && newCompleted && t.routineType && t.routineConfig) {
                                    const nextTimeLeft = calculateNextRoutineDate(t.routineType, t.routineConfig);
                                    return {
                                        ...t,
                                        completed: true, // 루틴 완료 시 일시적으로 완료 상태로 표시
                                        timeLeft: nextTimeLeft,
                                    };
                                }
                                
                                // 일반 할 일이거나 루틴을 미완료로 변경하는 경우
                                return { ...t, completed: newCompleted };
                            }
                            return t;
                        }),
                    }
                    : c
                ),
            };
        }
        case 'REMOVE_COMPLETED_TODOS': {
            return {
                ...state,
                categories: state.categories.map(c =>
                c.id === action.payload.categoryId
                    ? { ...c, todos: c.todos.filter(t => !t.completed || t.isRoutine) }
                    : c
                ),
            };
        }
        case 'RESTORE_STATE': {
            return action.payload;
        }
        default:
        return state;
    }
}
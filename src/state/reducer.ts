// src/state/reducer.ts
import { Category, Todo } from '../types';
import { Action } from './actions';

export interface State {
    categories: Category[];
}

export const initialState: State = { categories: [] };

// 다음 루틴 날짜 계산 함수 (완료 시점부터)
const calculateNextRoutineDate = (routineType: 'daily' | 'weekly' | 'monthly', routineConfig: { days?: number[], date?: number }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (routineType === 'daily') {
        return 1; // 완료 시점부터 1일 후 (내일)
    } else if (routineType === 'weekly' && routineConfig.days) {
        const todayDay = today.getDay();
        const sortedDays = routineConfig.days.sort((a, b) => a - b);
        
        // 완료 시점(오늘) 이후의 가장 가까운 요일 찾기
        let nextDay = sortedDays.find(day => day > todayDay);
        if (!nextDay) {
            nextDay = sortedDays[0]; // 다음 주의 첫 번째 요일
        }
        
        const daysUntilNext = nextDay > todayDay ? 
            nextDay - todayDay : 
            7 - todayDay + nextDay;
        
        return daysUntilNext;
    } else if (routineType === 'monthly' && routineConfig.date) {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDate = today.getDate();
        
        let nextMonth = currentMonth;
        let nextYear = currentYear;
        
        // 완료 시점(오늘) 이후의 해당 날짜로 설정
        if (currentDate >= routineConfig.date) {
            nextMonth += 1;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear += 1;
            }
        }
        
        const nextDate = new Date(nextYear, nextMonth, routineConfig.date);
        const timeDiff = nextDate.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    return 1; // 기본값
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
                            completed: false,
                            isRoutine: action.payload.isRoutine,
                            routineType: action.payload.routineType,
                            routineConfig: action.payload.routineConfig,
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
                                        completed: false, // 루틴은 완료 상태를 유지하지 않음
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
                    ? { ...c, todos: c.todos.filter(t => !t.completed) }
                    : c
                ),
            };
        }
        default:
        return state;
    }
}
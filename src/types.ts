// src/types.ts
export interface Todo {
    id: string;
    title: string;
    timeLeft: number;
    completed: boolean;
    isRoutine: boolean;
    routineType?: 'daily' | 'weekly' | 'monthly';
    routineConfig?: {
        days?: number[]; // 주간 루틴의 경우 요일 (0=일요일, 1=월요일, ..., 6=토요일)
        date?: number;   // 월간 루틴의 경우 날짜 (1-31)
    };
}

export interface Category {
    id: string;
    name: string;
    todos: Todo[];
}

export interface State {
    categories: Category[];
}
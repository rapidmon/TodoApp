// src/types.ts
export interface Todo {
    id: string;
    title: string;
    timeLeft: number;
    completed: boolean;
}

export interface Category {
    id: string;
    name: string;
    todos: Todo[];
}
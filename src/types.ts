// src/types.ts
export interface Todo {
    id: string;
    title: string;
    timeLeft: number;
}

export interface Category {
    id: string;
    name: string;
    todos: Todo[];
}
// src/state/actions.ts
export type Action =
  | { type: 'ADD_CATEGORY'; payload: { name: string } }
  | { type: 'REMOVE_CATEGORY'; payload: { categoryId: string } }
  | { type: 'UPDATE_CATEGORY'; payload: { categoryId: string; name: string } }
  | { type: 'ADD_TODO'; payload: { categoryId: string; title: string; timeLeft: number } }
  | { type: 'REMOVE_TODO'; payload: { categoryId: string; todoId: string } }
  | { type: 'UPDATE_TODO'; payload: { categoryId: string; todoId: string; title?: string; timeLeft?: number } };

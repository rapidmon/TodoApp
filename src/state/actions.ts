
// src/state/actions.ts
export type Action =
  | { type: 'ADD_CATEGORY'; payload: { name: string } }
  | { type: 'REMOVE_CATEGORY'; payload: { categoryId: string } }
  | { type: 'UPDATE_CATEGORY'; payload: { categoryId: string; name: string } }
  | { type: 'ADD_TODO'; payload: { 
      categoryId: string; 
      title: string; 
      timeLeft: number; 
      isRoutine: boolean; 
      routineType?: 'daily' | 'weekly' | 'monthly'; 
      routineConfig?: { days?: number[], date?: number } 
    } }
  | { type: 'REMOVE_TODO'; payload: { categoryId: string; todoId: string } }
  | { type: 'UPDATE_TODO'; payload: { 
      categoryId: string; 
      todoId: string; 
      title?: string; 
      timeLeft?: number; 
      isRoutine?: boolean; 
      routineType?: 'daily' | 'weekly' | 'monthly'; 
      routineConfig?: { days?: number[], date?: number } 
    } }
  | { type: 'TOGGLE_TODO_COMPLETED'; payload: { categoryId: string; todoId: string } }
  | { type: 'REMOVE_COMPLETED_TODOS'; payload: { categoryId: string } };
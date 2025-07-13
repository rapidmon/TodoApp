// android/app/src/main/java/com/anonymous/todolistapp/WidgetDataManager.java
package com.anonymous.todolistapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import org.json.JSONArray;
import org.json.JSONObject;

public class WidgetDataManager extends ReactContextBaseJavaModule {
    
    private ReactApplicationContext reactContext;
    
    public WidgetDataManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }
    
    @Override
    public String getName() {
        return "WidgetDataManager";
    }
    
    @ReactMethod
    public void updateWidgetData(String todosJson, Promise promise) {
        try {
            JSONArray todos = new JSONArray(todosJson);
            
            // 모든 카테고리의 할 일을 하나의 배열로 합치기
            JSONArray allTodos = new JSONArray();
            
            for (int i = 0; i < todos.length(); i++) {
                JSONObject category = todos.getJSONObject(i);
                JSONArray categoryTodos = category.getJSONArray("todos");
                
                for (int j = 0; j < categoryTodos.length(); j++) {
                    JSONObject todo = categoryTodos.getJSONObject(j);
                    // 완료되지 않은 할 일만 추가
                    if (!todo.getBoolean("completed")) {
                        allTodos.put(todo);
                    }
                }
            }
            
            // 마감일 순으로 정렬 (가까운 순서대로)
            JSONArray sortedTodos = sortTodosByTimeLeft(allTodos);
            
            // 🎨 Canvas 기반 위젯 업데이트
            TodoWidgetProvider.updateWidgetData(reactContext, sortedTodos);
            
            promise.resolve("Widget updated successfully");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
    
    private JSONArray sortTodosByTimeLeft(JSONArray todos) {
        try {
            // Simple bubble sort by timeLeft
            for (int i = 0; i < todos.length() - 1; i++) {
                for (int j = 0; j < todos.length() - i - 1; j++) {
                    JSONObject todo1 = todos.getJSONObject(j);
                    JSONObject todo2 = todos.getJSONObject(j + 1);
                    
                    int timeLeft1 = todo1.getInt("timeLeft");
                    int timeLeft2 = todo2.getInt("timeLeft");
                    
                    // 지난 일은 뒤로, 그 외는 시간 순
                    if ((timeLeft1 < 0 && timeLeft2 >= 0) || 
                        (timeLeft1 >= 0 && timeLeft2 >= 0 && timeLeft1 > timeLeft2)) {
                        
                        // Swap
                        todos.put(j, todo2);
                        todos.put(j + 1, todo1);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return todos;
    }
}
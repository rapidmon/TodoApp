// android/app/src/main/java/com/anonymous/todolistapp/WidgetDataManager.kt
package com.anonymous.todolistapp

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject

class WidgetDataManager(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String = "WidgetDataManager"
    
    @ReactMethod
    fun updateWidgetData(todosJson: String, promise: Promise) {
        try {
            val categoriesArray = JSONArray(todosJson)
            
            // 모든 카테고리의 할 일을 하나의 배열로 합치기
            val allTodos = JSONArray()
            
            for (i in 0 until categoriesArray.length()) {
                val category = categoriesArray.getJSONObject(i)
                val categoryId = category.getString("id")
                val categoryTodos = category.getJSONArray("todos")
                
                for (j in 0 until categoryTodos.length()) {
                    val todo = categoryTodos.getJSONObject(j)
                    // 카테고리 ID를 할 일에 추가
                    todo.put("categoryId", categoryId)
                    allTodos.put(todo)
                }
            }
            
            // 마감일 순으로 정렬
            val sortedTodos = sortTodosByPriority(allTodos)
            
            // SharedPreferences에 저장
            saveToSharedPreferences(sortedTodos, todosJson)
            
            // 위젯 업데이트
            TodoWidgetProvider.updateWidgetData(reactContext, sortedTodos)
            
            promise.resolve("Widget updated successfully")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }
    
    @ReactMethod
    fun getWidgetChanges(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            val changes = prefs.getString("widgetChanges", "[]") ?: "[]"
            
            // 변경사항 반환 후 클리어
            prefs.edit().remove("widgetChanges").apply()
            
            promise.resolve(changes)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error")
        }
    }
    
    private fun sortTodosByPriority(todos: JSONArray): JSONArray {
        val todoList = mutableListOf<JSONObject>()
        
        // JSONArray를 List로 변환
        for (i in 0 until todos.length()) {
            todoList.add(todos.getJSONObject(i))
        }
        
        // 정렬: 완료되지 않은 할 일 우선, 그 다음 timeLeft 순
        todoList.sortWith { todo1, todo2 ->
            try {
                val completed1 = todo1.getBoolean("completed")
                val completed2 = todo2.getBoolean("completed")
                val timeLeft1 = todo1.getInt("timeLeft")
                val timeLeft2 = todo2.getInt("timeLeft")
                
                when {
                    // 완료되지 않은 할 일이 우선
                    !completed1 && completed2 -> -1
                    completed1 && !completed2 -> 1
                    // 둘 다 완료되지 않은 경우 timeLeft로 정렬
                    !completed1 && !completed2 -> {
                        when {
                            timeLeft1 < 0 && timeLeft2 >= 0 -> 1  // 지난 일은 뒤로
                            timeLeft1 >= 0 && timeLeft2 < 0 -> -1 // 지나지 않은 일이 앞으로
                            else -> timeLeft1.compareTo(timeLeft2) // 시간 순
                        }
                    }
                    // 둘 다 완료된 경우 timeLeft로 정렬
                    else -> timeLeft1.compareTo(timeLeft2)
                }
            } catch (e: Exception) {
                0 // 에러 시 순서 유지
            }
        }
        
        // 다시 JSONArray로 변환
        val sortedArray = JSONArray()
        todoList.forEach { todo ->
            sortedArray.put(todo)
        }
        
        return sortedArray
    }
    
    private fun saveToSharedPreferences(todos: JSONArray, originalJson: String) {
        try {
            val prefs = reactContext.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("todos", todos.toString())
                putString("originalTodos", originalJson)
                apply()
            }
        } catch (e: Exception) {
            android.util.Log.e("WidgetDataManager", "Error saving to preferences: ${e.message}")
        }
    }
}
// android/app/src/main/java/com/anonymous/todolistapp/TodoWidgetProvider.kt
package com.anonymous.todolistapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.util.Log
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject

class TodoWidgetProvider : AppWidgetProvider() {
    
    companion object {
        private const val TAG = "TodoWidget"
        private const val MAX_BARS = 21 // 3주
        
        // 버튼 액션들
        private const val ACTION_COMPLETE_TODO = "com.anonymous.todolistapp.ACTION_COMPLETE_TODO"
        private const val ACTION_DELETE_TODO = "com.anonymous.todolistapp.ACTION_DELETE_TODO"
        private const val EXTRA_TODO_ID = "todo_id"
        private const val EXTRA_CATEGORY_ID = "category_id"
        
        fun updateWidgetData(context: Context, todos: JSONArray) {
            Log.d(TAG, "updateWidgetData called with ${todos.length()} todos")
            
            try {
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val thisWidget = android.content.ComponentName(context, TodoWidgetProvider::class.java)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
                
                // 리스트뷰 데이터 새로고침
                appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.todo_list)
                
                for (appWidgetId in appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId)
                }
                
                Log.d(TAG, "Widget data updated successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Error updating widget data: ${e.message}", e)
            }
        }
        
        private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            Log.d(TAG, "updateAppWidget called for widget ID: $appWidgetId")
            
            try {
                val views = RemoteViews(context.packageName, R.layout.todo_widget_scrollable_layout)
                
                // 리스트뷰 어댑터 설정
                val serviceIntent = Intent(context, TodoWidgetService::class.java)
                views.setRemoteAdapter(R.id.todo_list, serviceIntent)
                
                // 빈 뷰 설정
                views.setEmptyView(R.id.todo_list, android.R.id.empty)
                
                // 버튼 클릭을 위한 인텐트 템플릿 설정
                val buttonIntent = Intent(context, TodoWidgetProvider::class.java)
                val buttonPendingIntent = android.app.PendingIntent.getBroadcast(
                    context, 0, buttonIntent, 
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_MUTABLE
                )
                views.setPendingIntentTemplate(R.id.todo_list, buttonPendingIntent)
                
                appWidgetManager.updateAppWidget(appWidgetId, views)
                Log.d(TAG, "Widget updated successfully")
                
            } catch (e: Exception) {
                Log.e(TAG, "Error updating widget: ${e.message}", e)
                
                // 에러 시 기본 메시지
                val views = RemoteViews(context.packageName, R.layout.todo_widget_scrollable_layout)
                views.setTextViewText(android.R.id.empty, "위젯 에러: ${e.message}")
                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
        }
        
        // 할 일 데이터 로드 (여전히 필요)
        private fun loadTodos(context: Context): JSONArray {
            return try {
                val prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
                val todosJson = prefs.getString("todos", "[]") ?: "[]"
                Log.d(TAG, "Loaded todos JSON: $todosJson")
                JSONArray(todosJson)
            } catch (e: Exception) {
                Log.e(TAG, "Error loading todos: ${e.message}", e)
                JSONArray()
            }
        }
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        when (intent.action) {
            ACTION_COMPLETE_TODO -> {
                val todoId = intent.getStringExtra(EXTRA_TODO_ID)
                val categoryId = intent.getStringExtra(EXTRA_CATEGORY_ID)
                if (todoId != null && categoryId != null) {
                    handleCompleteTodo(context, categoryId, todoId)
                }
            }
            ACTION_DELETE_TODO -> {
                val todoId = intent.getStringExtra(EXTRA_TODO_ID)
                val categoryId = intent.getStringExtra(EXTRA_CATEGORY_ID)
                if (todoId != null && categoryId != null) {
                    handleDeleteTodo(context, categoryId, todoId)
                }
            }
        }
    }
    
    private fun handleCompleteTodo(context: Context, categoryId: String, todoId: String) {
        try {
            // SharedPreferences에서 데이터 로드
            val prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            val todosJson = prefs.getString("todos", "[]") ?: "[]"
            val todos = JSONArray(todosJson)
            
            // 해당 할 일 찾아서 완료 토글
            var found = false
            for (i in 0 until todos.length()) {
                val todo = todos.getJSONObject(i)
                if (todo.getString("id") == todoId) {
                    val currentCompleted = todo.getBoolean("completed")
                    todo.put("completed", !currentCompleted)
                    found = true
                    
                    // 위젯 변경사항 기록
                    recordWidgetChange(context, "TOGGLE_COMPLETED", categoryId, todoId)
                    break
                }
            }
            
            if (found) {
                // SharedPreferences에 저장
                prefs.edit().apply {
                    putString("todos", todos.toString())
                    apply()
                }
                
                // 위젯 업데이트
                updateWidgetData(context, todos)
                
                Log.d(TAG, "Todo completed: $todoId")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error completing todo: ${e.message}", e)
        }
    }
    
    private fun handleDeleteTodo(context: Context, categoryId: String, todoId: String) {
        try {
            // SharedPreferences에서 데이터 로드
            val prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            val todosJson = prefs.getString("todos", "[]") ?: "[]"
            val todos = JSONArray(todosJson)
            
            // 해당 할 일 찾아서 삭제
            var foundIndex = -1
            for (i in 0 until todos.length()) {
                val todo = todos.getJSONObject(i)
                if (todo.getString("id") == todoId) {
                    foundIndex = i
                    break
                }
            }
            
            if (foundIndex != -1) {
                todos.remove(foundIndex)
                
                // SharedPreferences에 저장
                prefs.edit().apply {
                    putString("todos", todos.toString())
                    apply()
                }
                
                // 위젯 변경사항 기록
                recordWidgetChange(context, "DELETE", categoryId, todoId)
                
                // 위젯 업데이트
                updateWidgetData(context, todos)
                
                Log.d(TAG, "Todo deleted: $todoId")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting todo: ${e.message}", e)
        }
    }
    
    private fun recordWidgetChange(context: Context, action: String, categoryId: String, todoId: String) {
        try {
            val prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            val existingChanges = prefs.getString("widgetChanges", "[]") ?: "[]"
            val changes = JSONArray(existingChanges)
            
            val change = JSONObject().apply {
                put("action", action)
                put("categoryId", categoryId)
                put("todoId", todoId)
                put("timestamp", System.currentTimeMillis())
            }
            
            changes.put(change)
            
            prefs.edit().apply {
                putString("widgetChanges", changes.toString())
                apply()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error recording widget change: ${e.message}", e)
        }
    }
    
    override fun onEnabled(context: Context) {
        Log.d(TAG, "Widget enabled")
    }
    
    override fun onDisabled(context: Context) {
        Log.d(TAG, "Widget disabled")
    }
}
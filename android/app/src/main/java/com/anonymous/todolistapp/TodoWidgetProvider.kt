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
import java.util.*

class TodoWidgetProvider : AppWidgetProvider() {
    
    companion object {
        private const val TAG = "TodoWidget"
        private const val MAX_BARS = 21 // 3주
        
        // 버튼 액션들
        private const val ACTION_COMPLETE_TODO = "com.anonymous.todolistapp.ACTION_COMPLETE_TODO"
        private const val ACTION_DELETE_TODO = "com.anonymous.todolistapp.ACTION_DELETE_TODO"
        private const val ACTION_OPEN_APP = "com.anonymous.todolistapp.ACTION_OPEN_APP"
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
        
        // 할 일 데이터 로드
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
        
        // 다음 루틴 날짜 계산 (완료 시점부터)
        private fun calculateNextRoutineDate(routineType: String, routineConfig: JSONObject): Int {
            val now = Calendar.getInstance()
            now.set(Calendar.HOUR_OF_DAY, 0)
            now.set(Calendar.MINUTE, 0)
            now.set(Calendar.SECOND, 0)
            now.set(Calendar.MILLISECOND, 0)
            
            return when (routineType) {
                "daily" -> 1 // 내일
                "weekly" -> {
                    val days = routineConfig.optJSONArray("days")
                    if (days != null) {
                        val todayDay = now.get(Calendar.DAY_OF_WEEK) - 1 // 0=일요일, 1=월요일...
                        val selectedDays = mutableListOf<Int>()
                        
                        for (i in 0 until days.length()) {
                            selectedDays.add(days.getInt(i))
                        }
                        
                        selectedDays.sort()
                        
                        // 완료 시점(오늘) 이후의 가장 가까운 요일 찾기
                        var nextDay = selectedDays.find { it > todayDay }
                        if (nextDay == null) {
                            nextDay = selectedDays[0] // 다음 주의 첫 번째 요일
                        }
                        
                        val daysUntilNext = if (nextDay > todayDay) {
                            nextDay - todayDay
                        } else {
                            7 - todayDay + nextDay
                        }
                        
                        daysUntilNext
                    } else {
                        7 // 기본값: 일주일 후
                    }
                }
                "monthly" -> {
                    val date = routineConfig.optInt("date", 1)
                    val currentMonth = now.get(Calendar.MONTH)
                    val currentYear = now.get(Calendar.YEAR)
                    val currentDate = now.get(Calendar.DAY_OF_MONTH)
                    
                    var nextMonth = currentMonth
                    var nextYear = currentYear
                    
                    // 완료 시점(오늘) 이후의 해당 날짜로 설정
                    if (currentDate >= date) {
                        nextMonth += 1
                        if (nextMonth > 11) {
                            nextMonth = 0
                            nextYear += 1
                        }
                    }
                    
                    val nextDate = Calendar.getInstance()
                    nextDate.set(nextYear, nextMonth, date, 0, 0, 0)
                    nextDate.set(Calendar.MILLISECOND, 0)
                    
                    val timeDiff = nextDate.timeInMillis - now.timeInMillis
                    Math.ceil(timeDiff / (1000.0 * 60 * 60 * 24)).toInt()
                }
                else -> 1
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
            ACTION_OPEN_APP -> {
                handleOpenApp(context)
            }
        }
    }
    
    private fun handleCompleteTodo(context: Context, categoryId: String, todoId: String) {
        try {
            // SharedPreferences에서 데이터 로드
            val prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE)
            val todosJson = prefs.getString("todos", "[]") ?: "[]"
            val todos = JSONArray(todosJson)
            
            // 해당 할 일 찾아서 처리
            var found = false
            for (i in 0 until todos.length()) {
                val todo = todos.getJSONObject(i)
                if (todo.getString("id") == todoId) {
                    val isRoutine = todo.optBoolean("isRoutine", false)
                    val currentCompleted = todo.optBoolean("completed", false)
                    
                    if (isRoutine) {
                        if (currentCompleted) {
                            // 루틴 업무가 이미 완료된 경우 - 미완료로 되돌리기
                            todo.put("completed", false)
                            Log.d(TAG, "Routine todo uncompleted: $todoId")
                        } else {
                            // 루틴 업무 완료 처리
                            val routineType = todo.optString("routineType", "daily")
                            val routineConfig = todo.optJSONObject("routineConfig") ?: JSONObject()
                            
                            val nextTimeLeft = calculateNextRoutineDate(routineType, routineConfig)
                            todo.put("timeLeft", nextTimeLeft)
                            todo.put("completed", true) // 루틴 완료 시 일시적으로 완료 상태로 표시
                            
                            Log.d(TAG, "Routine todo completed: $todoId, nextTimeLeft: $nextTimeLeft")
                        }
                        
                        // 위젯 변경사항 기록
                        recordWidgetChange(context, "TOGGLE_COMPLETED", categoryId, todoId)
                    } else {
                        // 일반 업무인 경우: 완료 처리하고 위젯에서 제거
                        todo.put("completed", true)
                        
                        Log.d(TAG, "Regular todo completed: $todoId")
                        
                        // 위젯 변경사항 기록
                        recordWidgetChange(context, "TOGGLE_COMPLETED", categoryId, todoId)
                    }
                    
                    found = true
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
    
    private fun handleOpenApp(context: Context) {
        try {
            val packageManager = context.packageManager
            val intent = packageManager.getLaunchIntentForPackage(context.packageName)
            intent?.let {
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(it)
                Log.d(TAG, "App opened from widget")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening app: ${e.message}", e)
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
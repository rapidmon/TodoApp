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
                
                // 클릭 시 앱 열기를 위한 인텐트 설정
                val appIntent = Intent(context, MainActivity::class.java)
                appIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                
                val pendingIntent = android.app.PendingIntent.getActivity(
                    context, 0, appIntent, 
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setPendingIntentTemplate(R.id.todo_list, pendingIntent)
                
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
    
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Log.d(TAG, "onUpdate called with ${appWidgetIds.size} widgets")
        
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    override fun onEnabled(context: Context) {
        Log.d(TAG, "Widget enabled")
    }
    
    override fun onDisabled(context: Context) {
        Log.d(TAG, "Widget disabled")
    }
}
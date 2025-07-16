// android/app/src/main/java/com/anonymous/todolistapp/TodoWidgetProvider.kt
package com.anonymous.todolistapp

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
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
                val views = RemoteViews(context.packageName, R.layout.todo_widget_layout)
                
                // 실제 할 일 데이터 로드
                val todos = loadTodos(context)
                val firstTodo = findFirstActiveTodo(todos)
                
                if (firstTodo != null) {
                    val title = firstTodo.getString("title")
                    val timeLeft = firstTodo.getInt("timeLeft")
                    val completed = firstTodo.getBoolean("completed")
                    
                    // 제목 설정
                    views.setTextViewText(R.id.todo_title, truncateTitle(title, 20))
                    
                    // 시간 텍스트 설정
                    views.setTextViewText(R.id.time_text, getTimeLeftText(timeLeft))
                    
                    // 체력바 이미지 생성 및 설정
                    val barBitmap = createHealthBarBitmap(context, timeLeft, completed)
                    views.setImageViewBitmap(R.id.health_bar, barBitmap)
                    
                    // 완료 상태에 따른 스타일 적용
                    if (completed) {
                        views.setInt(R.id.todo_title, "setTextColor", Color.GRAY)
                        views.setInt(R.id.time_text, "setTextColor", Color.GRAY)
                    } else {
                        views.setInt(R.id.todo_title, "setTextColor", Color.BLACK)
                        views.setInt(R.id.time_text, "setTextColor", getTextColor(timeLeft))
                    }
                    
                    Log.d(TAG, "Showing todo: $title (timeLeft: $timeLeft, completed: $completed)")
                } else {
                    views.setTextViewText(R.id.todo_title, "할 일이 없습니다")
                    views.setTextViewText(R.id.time_text, "앱에서 할 일을 추가하세요!")
                    views.setInt(R.id.todo_title, "setTextColor", Color.GRAY)
                    views.setInt(R.id.time_text, "setTextColor", Color.GRAY)
                    
                    // 빈 체력바 표시
                    val emptyBarBitmap = createEmptyBarBitmap(context)
                    views.setImageViewBitmap(R.id.health_bar, emptyBarBitmap)
                }
                
                appWidgetManager.updateAppWidget(appWidgetId, views)
                Log.d(TAG, "Widget updated successfully")
                
            } catch (e: Exception) {
                Log.e(TAG, "Error updating widget: ${e.message}", e)
                
                // 에러 시 기본 메시지
                val views = RemoteViews(context.packageName, R.layout.todo_widget_layout)
                views.setTextViewText(R.id.todo_title, "위젯 에러")
                views.setTextViewText(R.id.time_text, e.message ?: "알 수 없는 오류")
                views.setInt(R.id.todo_title, "setTextColor", Color.RED)
                views.setInt(R.id.time_text, "setTextColor", Color.RED)
                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
        }
        
        private fun createHealthBarBitmap(context: Context, timeLeft: Int, completed: Boolean): Bitmap {
            val density = context.resources.displayMetrics.density
            val barWidth = (10 * density).toInt()
            val barHeight = (16 * density).toInt()
            val barSpacing = (3 * density).toInt()
            val totalWidth = MAX_BARS * barWidth + (MAX_BARS - 1) * barSpacing
            val totalHeight = barHeight
            
            val bitmap = Bitmap.createBitmap(totalWidth, totalHeight, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            
            // 배경 투명
            canvas.drawColor(Color.TRANSPARENT)
            
            val paint = Paint().apply {
                isAntiAlias = true
                style = Paint.Style.FILL
            }
            
            // 바 그리기
            for (i in 0 until MAX_BARS) {
                val x = i * (barWidth + barSpacing).toFloat()
                val rect = RectF(x, 0f, x + barWidth, barHeight.toFloat())
                
                // 코너 반지름 적용
                val cornerRadius = (3 * density)
                
                when {
                    completed -> {
                        paint.color = Color.parseColor("#d0d0d0") // 완료된 경우 회색
                    }
                    timeLeft < 0 -> {
                        paint.color = Color.parseColor("#e0e0e0") // 지난 경우 모든 바 비활성
                    }
                    i < minOf(maxOf(timeLeft, 0), MAX_BARS) -> {
                        paint.color = getBarColor(timeLeft, completed)
                    }
                    else -> {
                        paint.color = Color.parseColor("#e0e0e0") // 비활성 바
                    }
                }
                
                canvas.drawRoundRect(rect, cornerRadius, cornerRadius, paint)
            }
            
            return bitmap
        }
        
        private fun createEmptyBarBitmap(context: Context): Bitmap {
            val density = context.resources.displayMetrics.density
            val barWidth = (10 * density).toInt()
            val barHeight = (16 * density).toInt()
            val barSpacing = (3 * density).toInt()
            val totalWidth = MAX_BARS * barWidth + (MAX_BARS - 1) * barSpacing
            val totalHeight = barHeight
            
            val bitmap = Bitmap.createBitmap(totalWidth, totalHeight, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.TRANSPARENT)
            
            val paint = Paint().apply {
                isAntiAlias = true
                style = Paint.Style.FILL
                color = Color.parseColor("#e0e0e0")
            }
            
            val cornerRadius = (3 * density)
            
            for (i in 0 until MAX_BARS) {
                val x = i * (barWidth + barSpacing).toFloat()
                val rect = RectF(x, 0f, x + barWidth, barHeight.toFloat())
                canvas.drawRoundRect(rect, cornerRadius, cornerRadius, paint)
            }
            
            return bitmap
        }
        
        private fun getBarColor(timeLeft: Int, completed: Boolean): Int {
            return when {
                completed -> Color.parseColor("#888888") // 회색 - 완료됨
                timeLeft < 0 -> Color.parseColor("#d32f2f") // 빨간색 - 지난 일
                timeLeft == 0 -> Color.parseColor("#ff9800") // 주황색 - 오늘
                timeLeft <= 3 -> Color.parseColor("#f57c00") // 주황색 - 3일 이내
                else -> Color.parseColor("#388e3c") // 초록색 - 여유있음
            }
        }
        
        private fun getTextColor(timeLeft: Int): Int {
            return when {
                timeLeft < 0 -> Color.parseColor("#d32f2f") // 빨간색 - 지난 일
                timeLeft == 0 -> Color.parseColor("#ff9800") // 주황색 - 오늘
                timeLeft <= 3 -> Color.parseColor("#f57c00") // 주황색 - 3일 이내
                else -> Color.parseColor("#388e3c") // 초록색 - 여유있음
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
        
        // 첫 번째 활성 할 일 찾기
        private fun findFirstActiveTodo(todos: JSONArray): JSONObject? {
            for (i in 0 until todos.length()) {
                try {
                    val todo = todos.getJSONObject(i)
                    if (!todo.getBoolean("completed")) {
                        return todo
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking todo: ${e.message}", e)
                }
            }
            return null
        }
        
        // 제목 자르기
        private fun truncateTitle(title: String, maxLength: Int): String {
            return if (title.length <= maxLength) {
                title
            } else {
                "${title.substring(0, maxLength)}..."
            }
        }
        
        // 시간 텍스트 변환
        private fun getTimeLeftText(timeLeft: Int): String {
            return when {
                timeLeft < 0 -> "⚠️ ${kotlin.math.abs(timeLeft)}일 지남"
                timeLeft == 0 -> "🔥 오늘 마감!"
                timeLeft == 1 -> "📅 내일 마감"
                timeLeft <= 7 -> "📅 ${timeLeft}일 남음"
                else -> "📅 ${timeLeft}일 남음"
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
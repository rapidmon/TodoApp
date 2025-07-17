// android/app/src/main/java/com/anonymous/todolistapp/TodoWidgetService.kt
package com.anonymous.todolistapp

import android.content.Context
import android.content.Intent
import android.graphics.*
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import org.json.JSONArray
import org.json.JSONObject
import android.util.Log

class TodoWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return TodoRemoteViewsFactory(this.applicationContext, intent)
    }
}

class TodoRemoteViewsFactory(
    private val context: Context,
    intent: Intent
) : RemoteViewsService.RemoteViewsFactory {

    private var todoList = mutableListOf<JSONObject>()
    
    companion object {
        private const val TAG = "TodoWidgetService"
        private const val MAX_BARS = 21
    }

    override fun onCreate() {
        Log.d(TAG, "TodoRemoteViewsFactory created")
    }

    override fun onDataSetChanged() {
        Log.d(TAG, "onDataSetChanged called")
        // 데이터 새로고침
        todoList.clear()
        
        val todos = loadTodos()
        for (i in 0 until todos.length()) {
            try {
                val todo = todos.getJSONObject(i)
                val isRoutine = todo.optBoolean("isRoutine", false)
                val completed = todo.optBoolean("completed", false)
                
                // 완료된 일반 업무는 위젯에서 제외
                if (!completed || isRoutine) {
                    todoList.add(todo)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing todo: ${e.message}")
            }
        }
        
        Log.d(TAG, "Loaded ${todoList.size} todos (excluding completed regular todos)")
    }

    override fun onDestroy() {
        todoList.clear()
    }

    override fun getCount(): Int = todoList.size

    override fun getViewAt(position: Int): RemoteViews {
        if (position >= todoList.size) {
            return getErrorView()
        }

        val todo = todoList[position]
        val views = RemoteViews(context.packageName, R.layout.todo_widget_item_layout)

        try {
            val todoId = todo.getString("id")
            val title = todo.getString("title")
            val timeLeft = todo.getInt("timeLeft")
            val completed = todo.getBoolean("completed")
            val isRoutine = todo.optBoolean("isRoutine", false)

            // 제목 설정
            views.setTextViewText(R.id.todo_title, truncateTitle(title, 20))
            
            // 시간 텍스트 설정
            views.setTextViewText(R.id.time_text, getSimpleTimeText(timeLeft))
            
            // 체력바 생성
            val barBitmap = createHealthBarBitmap(timeLeft, completed)
            views.setImageViewBitmap(R.id.health_bar, barBitmap)
            
            // 루틴 업무의 경우 완료 상태에 따른 색상 및 버튼 설정
            if (isRoutine && completed) {
                // 루틴 업무 완료 시 회색으로 표시
                views.setInt(R.id.todo_title, "setTextColor", Color.GRAY)
                views.setInt(R.id.time_text, "setTextColor", Color.GRAY)
                views.setTextViewText(R.id.btn_complete, "취소")
                
                // 완료 버튼을 회색으로 변경
                views.setInt(R.id.btn_complete, "setBackgroundResource", R.drawable.completed_button_background)
                views.setInt(R.id.btn_complete, "setTextColor", Color.WHITE)
            } else if (completed) {
                // 일반 업무 완료 시 (실제로는 위젯에서 보이지 않음)
                views.setInt(R.id.todo_title, "setTextColor", Color.GRAY)
                views.setInt(R.id.time_text, "setTextColor", Color.GRAY)
                views.setTextViewText(R.id.btn_complete, "취소")
            } else {
                // 미완료 상태
                views.setInt(R.id.todo_title, "setTextColor", Color.BLACK)
                views.setInt(R.id.time_text, "setTextColor", getTextColor(timeLeft))
                views.setTextViewText(R.id.btn_complete, "완료")
                
                // 완료 버튼을 원래 색상으로 설정
                views.setInt(R.id.btn_complete, "setBackgroundResource", R.drawable.complete_button_background)
                views.setInt(R.id.btn_complete, "setTextColor", Color.WHITE)
            }
            
            // 완료 버튼 클릭 인텐트
            val categoryId = if (todo.has("categoryId")) {
                todo.getString("categoryId")
            } else {
                "default"
            }
            
            val completeIntent = Intent()
            completeIntent.action = "com.anonymous.todolistapp.ACTION_COMPLETE_TODO"
            completeIntent.putExtra("todo_id", todoId)
            completeIntent.putExtra("category_id", categoryId)
            views.setOnClickFillInIntent(R.id.btn_complete, completeIntent)
            
            // 삭제 버튼 클릭 인텐트
            val deleteIntent = Intent()
            deleteIntent.action = "com.anonymous.todolistapp.ACTION_DELETE_TODO"
            deleteIntent.putExtra("todo_id", todoId)
            deleteIntent.putExtra("category_id", categoryId)
            views.setOnClickFillInIntent(R.id.btn_delete, deleteIntent)
            
            // 할 일 제목 클릭 시 앱 열기 인텐트
            val openAppIntent = Intent()
            openAppIntent.action = "com.anonymous.todolistapp.ACTION_OPEN_APP"
            openAppIntent.putExtra("todoId", todoId)
            views.setOnClickFillInIntent(R.id.todo_title, openAppIntent)
            
        } catch (e: Exception) {
            Log.e(TAG, "Error creating view for position $position: ${e.message}")
            return getErrorView()
        }

        return views
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 1

    override fun getItemId(position: Int): Long = position.toLong()

    override fun hasStableIds(): Boolean = true

    private fun getErrorView(): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.todo_widget_item_layout)
        views.setTextViewText(R.id.todo_title, "오류 발생")
        views.setTextViewText(R.id.time_text, "")
        return views
    }

    private fun loadTodos(): JSONArray {
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

    private fun createHealthBarBitmap(timeLeft: Int, completed: Boolean): Bitmap {
        val density = context.resources.displayMetrics.density
        val barWidth = (8 * density).toInt()  // 조금 더 작게
        val barHeight = (12 * density).toInt()
        val barSpacing = (2 * density).toInt()
        val totalWidth = MAX_BARS * barWidth + (MAX_BARS - 1) * barSpacing
        val totalHeight = barHeight
        
        val bitmap = Bitmap.createBitmap(totalWidth, totalHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        canvas.drawColor(Color.TRANSPARENT)
        
        val paint = Paint().apply {
            isAntiAlias = true
            style = Paint.Style.FILL
        }
        
        for (i in 0 until MAX_BARS) {
            val x = i * (barWidth + barSpacing).toFloat()
            val rect = RectF(x, 0f, x + barWidth, barHeight.toFloat())
            
            val cornerRadius = (2 * density)
            
            when {
                completed -> {
                    paint.color = Color.parseColor("#d0d0d0")
                }
                timeLeft < 0 -> {
                    paint.color = Color.parseColor("#e0e0e0")
                }
                i < minOf(maxOf(timeLeft + 1, 0), MAX_BARS) -> {
                    paint.color = getBarColor(timeLeft, completed)
                }
                else -> {
                    paint.color = Color.parseColor("#e0e0e0")
                }
            }
            
            canvas.drawRoundRect(rect, cornerRadius, cornerRadius, paint)
        }
        
        return bitmap
    }

    private fun getBarColor(timeLeft: Int, completed: Boolean): Int {
        return when {
            completed -> Color.parseColor("#888888")
            timeLeft < 0 -> Color.parseColor("#d32f2f")
            timeLeft == 0 -> Color.parseColor("#ff9800")
            timeLeft <= 3 -> Color.parseColor("#f57c00")
            else -> Color.parseColor("#388e3c")
        }
    }

    private fun getTextColor(timeLeft: Int): Int {
        return when {
            timeLeft < 0 -> Color.parseColor("#d32f2f")
            timeLeft == 0 -> Color.parseColor("#ff9800")
            timeLeft <= 3 -> Color.parseColor("#f57c00")
            else -> Color.parseColor("#388e3c")
        }
    }

    private fun truncateTitle(title: String, maxLength: Int): String {
        return if (title.length <= maxLength) {
            title
        } else {
            "${title.substring(0, maxLength)}..."
        }
    }

    private fun getSimpleTimeText(timeLeft: Int): String {
        return when {
            timeLeft < 0 -> "${kotlin.math.abs(timeLeft)}일 지남"
            timeLeft == 0 -> "오늘 마감"
            timeLeft == 1 -> "내일 마감"
            else -> "${timeLeft}일 뒤 마감"
        }
    }
}
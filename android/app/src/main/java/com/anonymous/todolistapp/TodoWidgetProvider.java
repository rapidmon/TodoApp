// android/app/src/main/java/com/anonymous/todolistapp/TodoWidgetProvider.java
// 🔧 최소한의 테스트 위젯
package com.anonymous.todolistapp;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;

public class TodoWidgetProvider extends AppWidgetProvider {
    
    private static final String TAG = "TodoWidget";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate called with " + appWidgetIds.length + " widgets");
        
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(TAG, "updateAppWidget called for widget ID: " + appWidgetId);
        
        try {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.simple_widget);
            
            // 🎮 실제 할 일 데이터 로드
            JSONArray todos = loadTodos(context);
            JSONObject firstTodo = findFirstActiveTodo(todos);
            
            if (firstTodo != null) {
                String title = firstTodo.getString("title");
                int timeLeft = firstTodo.getInt("timeLeft");
                boolean completed = firstTodo.getBoolean("completed");
                
                // 위젯 제목 표시
                views.setViewVisibility(R.id.widget_title, android.view.View.VISIBLE);
                views.setTextViewText(R.id.widget_title, "할 일 목록");
                
                // 할 일 아이템 표시
                views.setViewVisibility(R.id.todo_item_container, android.view.View.VISIBLE);
                views.setViewVisibility(R.id.simple_text, android.view.View.GONE);
                
                // 제목 표시 (10글자 제한 - React Native와 동일)
                String truncatedTitle = truncateTitle(title, 10);
                views.setTextViewText(R.id.todo_title, truncatedTitle);
                
                // 🎮 React Native와 동일한 21개 체력바 로직!
                renderHealthBars(views, timeLeft, completed);
                
                Log.d(TAG, "Showing todo: " + title + " (timeLeft: " + timeLeft + ", completed: " + completed + ")");
            } else {
                // 빈 상태 표시
                views.setViewVisibility(R.id.widget_title, android.view.View.VISIBLE);
                views.setTextViewText(R.id.widget_title, "할 일 목록");
                views.setViewVisibility(R.id.todo_item_container, android.view.View.GONE);
                views.setViewVisibility(R.id.simple_text, android.view.View.VISIBLE);
                views.setTextViewText(R.id.simple_text, "할 일이 없습니다\n앱에서 할 일을 추가하세요!");
            }
            
            // 위젯 업데이트
            appWidgetManager.updateAppWidget(appWidgetId, views);
            
            Log.d(TAG, "Widget updated successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget: " + e.getMessage(), e);
            
            // 에러 시 기본 메시지
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.simple_widget);
            views.setViewVisibility(R.id.simple_text, android.view.View.VISIBLE);
            views.setTextViewText(R.id.simple_text, "위젯 에러\n" + e.getMessage());
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
    
    @Override
    public void onEnabled(Context context) {
        Log.d(TAG, "Widget enabled");
    }

    @Override
    public void onDisabled(Context context) {
        Log.d(TAG, "Widget disabled");
    }
    
    // 🔧 WidgetDataManager에서 호출하는 메서드 추가
    public static void updateWidgetData(Context context, JSONArray todos) {
        Log.d(TAG, "updateWidgetData called with " + todos.length() + " todos");
        
        try {
            // 위젯 업데이트 (현재는 단순히 새로고침)
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            android.content.ComponentName thisWidget = new android.content.ComponentName(context, TodoWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            
            for (int appWidgetId : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            }
            
            Log.d(TAG, "Widget data updated successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget data: " + e.getMessage(), e);
        }
    }
    
    // 🎮 할 일 데이터 로드
    private static JSONArray loadTodos(Context context) {
        try {
            android.content.SharedPreferences prefs = context.getSharedPreferences("TodoWidgetPrefs", Context.MODE_PRIVATE);
            String todosJson = prefs.getString("todos", "[]");
            Log.d(TAG, "Loaded todos JSON: " + todosJson);
            return new JSONArray(todosJson);
        } catch (Exception e) {
            Log.e(TAG, "Error loading todos: " + e.getMessage(), e);
            return new JSONArray();
        }
    }
    
    // 첫 번째 활성 할 일 찾기
    private static JSONObject findFirstActiveTodo(JSONArray todos) {
        for (int i = 0; i < todos.length(); i++) {
            try {
                JSONObject todo = todos.getJSONObject(i);
                if (!todo.getBoolean("completed")) {
                    return todo;
                }
            } catch (Exception e) {
                Log.e(TAG, "Error checking todo: " + e.getMessage(), e);
            }
        }
        return null;
    }
    
    // 제목 자르기 (React Native와 동일 - 10글자)
    private static String truncateTitle(String title, int maxLength) {
        if (title == null) return "";
        if (title.length() <= maxLength) {
            return title;
        }
        return title.substring(0, maxLength) + "...";
    }
    
    // 🎮 React Native와 동일한 21개 체력바 렌더링!
    private static void renderHealthBars(RemoteViews views, int timeLeft, boolean completed) {
        final int maxBars = 21; // 3주 (React Native와 동일)
        
        // 바의 개수 계산 (React Native 로직과 완전 동일)
        int barCount;
        if (completed) {
            barCount = maxBars; // 완료된 경우 모든 바 표시 (회색으로)
        } else if (timeLeft < 0) {
            barCount = 0; // 지난 날짜인 경우 0개
        } else {
            barCount = Math.min(Math.max(timeLeft, 0), maxBars);
        }
        
        // 색상 결정 (React Native getBarColor 함수와 동일)
        int activeColor = getBarColor(timeLeft, completed);
        int inactiveColor = 0xFFE0E0E0; // 비활성 바 색상
        
        // 21개 바의 ID 배열
        int[] barIds = {
            R.id.bar_1, R.id.bar_2, R.id.bar_3, R.id.bar_4, R.id.bar_5, R.id.bar_6, R.id.bar_7,
            R.id.bar_8, R.id.bar_9, R.id.bar_10, R.id.bar_11, R.id.bar_12, R.id.bar_13, R.id.bar_14,
            R.id.bar_15, R.id.bar_16, R.id.bar_17, R.id.bar_18, R.id.bar_19, R.id.bar_20, R.id.bar_21
        };
        
        // 각 바의 색상 설정 (React Native 로직과 동일)
        for (int i = 0; i < barIds.length; i++) {
            boolean isActive;
            if (completed) {
                isActive = true; // 완료된 경우 모든 바를 활성으로 (색상은 회색)
            } else {
                isActive = i < barCount;
            }
            
            int color = isActive ? activeColor : inactiveColor;
            views.setInt(barIds[i], "setBackgroundColor", color);
        }
        
        Log.d(TAG, "Health bars rendered: barCount=" + barCount + ", completed=" + completed + ", timeLeft=" + timeLeft);
    }
    
    // 🎮 React Native getBarColor 함수와 완전 동일!
    private static int getBarColor(int timeLeft, boolean completed) {
        if (completed) {
            return 0xFFD0D0D0; // 회색 - 완료됨 (React Native와 동일)
        } else if (timeLeft < 0) {
            return 0xFFD32F2F; // 빨간색 - 지난 일
        } else if (timeLeft == 0) {
            return 0xFFFF9800; // 주황색 - 오늘
        } else if (timeLeft <= 3) {
            return 0xFFF57C00; // 주황색 - 3일 이내
        } else {
            return 0xFF388E3C; // 초록색 - 여유있음
        }
    }
}
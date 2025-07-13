// android/app/src/main/java/com/anonymous/todolistapp/TodoWidgetProvider.java
// 🔧 최소한의 테스트 위젯
package com.anonymous.todolistapp;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;
import android.util.Log;
import org.json.JSONArray;

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
            // 가장 간단한 TextView만 사용
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.simple_widget);
            
            // 간단한 텍스트 설정
            views.setTextViewText(R.id.simple_text, "Hello Widget!");
            
            // 위젯 업데이트
            appWidgetManager.updateAppWidget(appWidgetId, views);
            
            Log.d(TAG, "Widget updated successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget: " + e.getMessage(), e);
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
}
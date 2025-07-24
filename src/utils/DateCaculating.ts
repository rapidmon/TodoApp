// 유틸리티 함수들
export const calculateTimeLeft = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// 다음 루틴 날짜 계산
export const getNextRoutineDate = (type: 'daily' | 'weekly' | 'monthly', config: { days?: number[], date?: number }): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'daily') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow;
    } else if (type === 'weekly' && config.days) {
        const todayDay = today.getDay();
        const sortedDays = config.days.sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(day => day > todayDay);
        if (!nextDay) {
            nextDay = sortedDays[0];
        }
        
        const daysUntilNext = nextDay > todayDay ? 
            nextDay - todayDay : 
            7 - todayDay + nextDay;
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);
        return nextDate;
    } else if (type === 'monthly' && config.date) {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDate = today.getDate();
        
        let nextMonth = currentMonth;
        let nextYear = currentYear;
        
        if (currentDate >= config.date) {
            nextMonth += 1;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear += 1;
            }
        }
        
        return new Date(nextYear, nextMonth, config.date);
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
};
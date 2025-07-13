import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';

// 加载插件
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

/**
 * 格式化日期显示
 */
export const formatDateDisplay = (date?: number | Date) => {
  if (!date) return null;
  
  const day = dayjs(date);
  
  if (day.isToday()) {
    return { text: '今天', color: 'text-blue-600' };
  } else if (day.isTomorrow()) {
    return { text: '明天', color: 'text-green-600' };
  } else if (day.isYesterday()) {
    return { text: '昨天', color: 'text-gray-600' };
  } else if (day.isBefore(dayjs(), 'day')) {
    return { text: day.format('MM-DD'), color: 'text-red-600' };
  } else {
    return { text: day.format('MM-DD'), color: 'text-gray-600' };
  }
};

/**
 * 判断任务是否逾期
 */
export const isOverdue = (dueDate?: number) => {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs().startOf('day'));
};

/**
 * 判断任务是否到期（今天）
 */
export const isDueToday = (dueDate?: number) => {
  if (!dueDate) return false;
  return dayjs(dueDate).isToday();
};

/**
 * 格式化日期为字符串
 */
export const formatDate = (date?: number | Date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 获取今天的开始时间（毫秒）
 */
export const getTodayStart = () => {
  return dayjs().startOf('day').valueOf();
};

/**
 * 获取今天的结束时间（毫秒）
 */
export const getTodayEnd = () => {
  return dayjs().endOf('day').valueOf();
};

/**
 * 获取月份的开始日期
 */
export const getMonthStart = (date?: Date | number) => {
  return dayjs(date).startOf('month').toDate();
};

/**
 * 获取月份的结束日期
 */
export const getMonthEnd = (date?: Date | number) => {
  return dayjs(date).endOf('month').toDate();
};

/**
 * 获取日期所在月份的日历网格数据（6周42天）
 */
export const getCalendarDates = (date: Date | number) => {
  const monthStart = dayjs(date).startOf('month');
  const calendarStart = monthStart.startOf('week');
  
  const dates: Date[] = [];
  for (let i = 0; i < 42; i++) {
    dates.push(calendarStart.add(i, 'day').toDate());
  }
  
  return {
    dates,
    currentMonth: monthStart.month(),
    currentYear: monthStart.year()
  };
};

/**
 * 导航到上一个/下一个月
 */
export const navigateMonth = (currentDate: Date | number, direction: 'prev' | 'next') => {
  const current = dayjs(currentDate);
  const newDate = direction === 'prev' 
    ? current.subtract(1, 'month') 
    : current.add(1, 'month');
  
  return {
    start: newDate.startOf('month').valueOf(),
    end: newDate.endOf('month').valueOf()
  };
};

/**
 * 生成相对时间描述
 */
export const getRelativeTime = (date: number | Date) => {
  return dayjs(date).fromNow();
}; 
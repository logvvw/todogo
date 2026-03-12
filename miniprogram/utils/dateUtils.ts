/**
 * 日期处理工具函数
 */

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getToday(): string {
  const date = new Date();
  return formatDate(date);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 获取月份的所有日期
 */
export function getMonthDays(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取星期几的名称
 */
export function getWeekdayName(weekday: number): string {
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return names[weekday];
}

/**
 * 获取月份名称
 */
export function getMonthName(month: number): string {
  return `${month}月`;
}

/**
 * 比较两个日期字符串
 */
export function compareDates(date1: string, date2: string): number {
  return date1.localeCompare(date2);
}

/**
 * 检查日期是否是今天
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const date = new Date(timestamp);
    return formatDate(date);
  }
}

/**
 * 获取下个月的年月
 */
export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
}

/**
 * 获取上个月的年月
 */
export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
}

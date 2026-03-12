// components/calendar-view/calendar-view.ts
import { getCalendarData } from '../../utils/storage';
import { getNextMonth, getPrevMonth, getToday } from '../../utils/dateUtils';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 初始选中的日期
    initialDate: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [] as any[],
    selectedDate: '',
    isCurrentMonth: false
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      const today = getToday();
      const initialDate = this.properties.initialDate || today;

      this.setData({
        selectedDate: initialDate
      });

      // 如果指定了初始日期，跳转到该日期
      if (initialDate !== today) {
        const [year, month] = initialDate.split('-').map(Number);
        this.setData({
          year,
          month: month - 1
        }, () => {
          this.loadCalendarData();
        });
      } else {
        this.loadCalendarData();
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 加载日历数据
     */
    loadCalendarData() {
      const { year, month } = this.data;
      const calendarDays = getCalendarData(year, month);

      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

      this.setData({
        calendarDays,
        isCurrentMonth
      });
    },

    /**
     * 上个月
     */
    onPrevMonth() {
      const { year, month } = this.data;
      const { year: newYear, month: newMonth } = getPrevMonth(year, month);

      this.setData({
        year: newYear,
        month: newMonth
      }, () => {
        this.loadCalendarData();
      });
    },

    /**
     * 下个月
     */
    onNextMonth() {
      const { year, month } = this.data;
      const { year: newYear, month: newMonth } = getNextMonth(year, month);

      this.setData({
        year: newYear,
        month: newMonth
      }, () => {
        this.loadCalendarData();
      });
    },

    /**
     * 选择日期
     */
    onSelectDate(e: any) {
      const date = e.currentTarget.dataset.date;
      if (!date) return;

      this.setData({
        selectedDate: date
      });

      // 触发选择事件
      this.triggerEvent('datechange', {
        date
      });
    },

    /**
     * 回到今天
     */
    onBackToday() {
      const today = new Date();
      this.setData({
        year: today.getFullYear(),
        month: today.getMonth(),
        selectedDate: getToday()
      }, () => {
        this.loadCalendarData();
        this.triggerEvent('datechange', {
          date: getToday()
        });
      });
    }
  }
});

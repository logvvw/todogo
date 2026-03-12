// pages/calendar/calendar.ts
import {
  TodoStatus,
  TodoPriority,
  getTodosByDate,
  addTodo,
  completeTodo,
  uncompleteTodo
} from '../../utils/storage';
import { getToday, formatDate, isToday } from '../../utils/dateUtils';
import type { Todo } from '../../utils/storage';

interface FormData {
  title: string;
  description: string;
  priority: TodoPriority;
  date: string;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedDate: '',
    selectedTasks: [] as Todo[],
    isToday: false,
    showModal: false,
    form: {
      title: '',
      description: '',
      priority: TodoPriority.Low,
      date: ''
    } as FormData
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const today = getToday();
    this.setData({
      selectedDate: today,
      selectedTasks: getTodosByDate(today),
      isToday: true,
      'form.date': today
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.refreshTasks();
  },

  /**
   * 日期改变
   */
  onDateChange(e: any) {
    const date = e.detail.date;
    this.setData({
      selectedDate: date,
      selectedTasks: getTodosByDate(date),
      isToday: isToday(date),
      'form.date': date
    });
  },

  /**
   * 刷新任务列表
   */
  refreshTasks() {
    const { selectedDate } = this.data;
    this.setData({
      selectedTasks: getTodosByDate(selectedDate)
    });
  },

  /**
   * 切换任务状态
   */
  toggleTask(e: any) {
    const id = e.currentTarget.dataset.id;
    const task = this.data.selectedTasks.find(t => t.id === id);

    if (!task) return;

    if (task.status === TodoStatus.Completed) {
      uncompleteTodo(id);
    } else {
      completeTodo(id);
    }

    this.refreshTasks();
  },

  /**
   * 为选中日期添加任务
   */
  addTaskForDate() {
    this.setData({
      showModal: true,
      'form.title': '',
      'form.description': '',
      'form.priority': TodoPriority.Low
    });
  },

  /**
   * 隐藏弹窗
   */
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  /**
   * 输入标题
   */
  onTitleInput(e: any) {
    this.setData({
      'form.title': e.detail.value
    });
  },

  /**
   * 输入描述
   */
  onDescInput(e: any) {
    this.setData({
      'form.description': e.detail.value
    });
  },

  /**
   * 选择优先级
   */
  selectPriority(e: any) {
    const priority = parseInt(e.currentTarget.dataset.priority);
    this.setData({
      'form.priority': priority
    });
  },

  /**
   * 保存任务
   */
  saveTask() {
    const { form } = this.data;

    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      });
      return;
    }

    addTodo({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: TodoStatus.Pending,
      date: form.date
    });

    wx.showToast({
      title: '已添加',
      icon: 'success'
    });

    this.hideModal();
    this.refreshTasks();
  },

  /**
   * 回到今天
   */
  backToToday() {
    const today = getToday();
    this.setData({
      selectedDate: today,
      selectedTasks: getTodosByDate(today),
      isToday: true,
      'form.date': today
    });

    // 通知日历组件回到今天
    const calendar = this.selectComponent('#calendar');
    if (calendar) {
      (calendar as any).onBackToday();
    }
  }
});

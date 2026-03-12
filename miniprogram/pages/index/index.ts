// pages/index/index.ts
import {
  TodoStatus,
  TodoPriority,
  getTodosByDate,
  addTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  uncompleteTodo,
  getUserGrowth
} from '../../utils/storage';
import { getToday, getWeekdayName } from '../../utils/dateUtils';
import type { Todo, UserGrowth } from '../../utils/storage';

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
    todayDay: new Date().getDate(),
    todayMonth: new Date().getMonth() + 1,
    todayWeekday: getWeekdayName(new Date().getDay()),
    tasks: [] as Todo[],
    growthData: null as UserGrowth | null,
    stats: {
      total: 0,
      completed: 0,
      pending: 0
    },
    // 任务弹窗
    showModal: false,
    editingTask: null as Todo | null,
    form: {
      title: '',
      description: '',
      priority: TodoPriority.Low
    } as FormData
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadData();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  },

  /**
   * 加载数据
   */
  loadData() {
    const today = getToday();
    const tasks = getTodosByDate(today);
    const growthData = getUserGrowth();

    // 统计今日任务
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === TodoStatus.Completed).length,
      pending: tasks.filter(t => t.status === TodoStatus.Pending).length
    };

    this.setData({
      tasks,
      growthData,
      stats,
      todayDay: new Date().getDate(),
      todayMonth: new Date().getMonth() + 1,
      todayWeekday: getWeekdayName(new Date().getDay())
    });
  },

  // ==================== 任务相关 ====================

  /**
   * 显示添加弹窗
   */
  showAddModal() {
    this.setData({
      showModal: true,
      editingTask: null,
      form: {
        title: '',
        description: '',
        priority: TodoPriority.Low,
        date: getToday()
      }
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
    const { editingTask, form } = this.data;

    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      });
      return;
    }

    if (editingTask) {
      // 编辑任务
      updateTodo(editingTask.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority
      });
      wx.showToast({
        title: '已更新',
        icon: 'success'
      });
    } else {
      // 添加新任务
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
    }

    this.hideModal();
    this.loadData();
  },

  /**
   * 编辑任务
   */
  editTask(e: any) {
    const task = e.currentTarget.dataset.task;
    this.setData({
      showModal: true,
      editingTask: task,
      form: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        date: task.date
      }
    });
  },

  /**
   * 切换任务状态
   */
  toggleTask(e: any) {
    const id = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === id);

    if (!task) return;

    if (task.status === TodoStatus.Completed) {
      uncompleteTodo(id);
    } else {
      completeTodo(id);
      // 播放完成动画效果
      this.playCompleteAnimation();
    }

    this.loadData();
  },

  /**
   * 删除任务
   */
  deleteTask(e: any) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          deleteTodo(id);
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          this.loadData();
        }
      }
    });
  },

  /**
   * 播放完成动画
   */
  playCompleteAnimation() {
    // 可以添加动画效果
  },

  /**
   * 跳转到日历页面
   */
  goToCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    });
  }
});

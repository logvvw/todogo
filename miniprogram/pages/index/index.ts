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
  getUserGrowth,
  getMemos,
  addMemo,
  deleteMemo
} from '../../utils/storage';
import { getToday, getWeekdayName } from '../../utils/dateUtils';
import type { Todo, UserGrowth, Memo } from '../../utils/storage';

interface FormData {
  title: string;
  description: string;
  priority: TodoPriority;
  date: string;
}

interface MemoFormData {
  content: string;
  images: string[];
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
    memos: [] as Memo[],
    growthData: null as UserGrowth | null,
    stats: {
      total: 0,
      completed: 0,
      pending: 0
    },
    // Tab相关
    activeTab: 'tasks', // 'tasks' | 'memos'
    // 任务弹窗
    showModal: false,
    editingTask: null as Todo | null,
    form: {
      title: '',
      description: '',
      priority: TodoPriority.Low
    } as FormData,
    // 备忘弹窗
    showMemoModal: false,
    memoForm: {
      content: '',
      images: [] as string[]
    } as MemoFormData
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
    const memos = getMemos();

    // 统计今日任务
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === TodoStatus.Completed).length,
      pending: tasks.filter(t => t.status === TodoStatus.Pending).length
    };

    this.setData({
      tasks,
      memos: this.formatMemoTimes(memos),
      growthData,
      stats,
      todayDay: new Date().getDate(),
      todayMonth: new Date().getMonth() + 1,
      todayWeekday: getWeekdayName(new Date().getDay())
    });
  },

  /**
   * 格式化备忘时间显示
   */
  formatMemoTimes(memos: Memo[]) {
    return memos.map(memo => {
      return {
        ...memo,
        createdAtFormatted: this.formatTime(memo.createdAt)
      };
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  // ==================== Tab切换 ====================

  /**
   * 切换Tab
   */
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
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
  },

  // ==================== 备忘相关 ====================

  /**
   * 显示添加备忘弹窗
   */
  showAddMemoModal() {
    this.setData({
      showMemoModal: true,
      memoForm: {
        content: '',
        images: []
      }
    });
  },

  /**
   * 隐藏备忘弹窗
   */
  hideMemoModal() {
    this.setData({
      showMemoModal: false
    });
  },

  /**
   * 输入备忘内容
   */
  onMemoContentInput(e: any) {
    this.setData({
      'memoForm.content': e.detail.value
    });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const that = this;
    const currentCount = this.data.memoForm.images ? this.data.memoForm.images.length : 0;
    wx.chooseImage({
      count: 9 - currentCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        const currentImages = that.data.memoForm.images || [];
        that.setData({
          'memoForm.images': [...currentImages, ...tempFilePaths]
        });
      }
    });
  },

  /**
   * 删除图片
   */
  deleteImage(e: any) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.memoForm.images];
    images.splice(index, 1);
    this.setData({
      'memoForm.images': images
    });
  },

  /**
   * 预览图片
   */
  previewImage(e: any) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  /**
   * 保存备忘
   */
  saveMemo() {
    const { memoForm } = this.data;

    // 检查是否有内容
    const content = memoForm.content || '';
    const hasContent = content.trim().length > 0;
    const images = memoForm.images || [];
    const hasImages = images.length > 0;

    if (!hasContent && !hasImages) {
      wx.showToast({
        title: '请添加内容或图片',
        icon: 'none'
      });
      return;
    }

    addMemo({
      content: content.trim(),
      images: images
    });

    wx.showToast({
      title: '已添加',
      icon: 'success'
    });

    this.hideMemoModal();
    this.loadData();
  },

  /**
   * 删除备忘
   */
  deleteMemoItem(e: any) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条备忘吗？',
      success: (res) => {
        if (res.confirm) {
          deleteMemo(id);
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          this.loadData();
        }
      }
    });
  }
});

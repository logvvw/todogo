/**
 * 本地存储管理工具
 * 所有数据使用 wx.setStorageSync/wx.getStorageSync 存储
 */

// ==================== 类型定义 ====================

/**
 * 任务状态
 */
export enum TodoStatus {
  Pending = 0,
  Completed = 1
}

/**
 * 任务优先级
 */
export enum TodoPriority {
  Low = 0,
  Medium = 1,
  High = 2
}

/**
 * 任务数据结构
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  date: string; // YYYY-MM-DD 格式
  createdAt: number;
  completedAt?: number;
}

/**
 * 成长等级
 */
export enum GrowthLevel {
  Seed = 0,        // 种子
  Sprout = 1,       // 发芽
  Seedling = 2,     // 幼苗
  SmallTree = 3,    // 小树
  BigTree = 4,      // 大树
  FruitTree = 5     // 果树
}

/**
 * 成长等级配置
 */
export interface GrowthConfig {
  level: GrowthLevel;
  name: string;
  icon: string;
  minTasks: number;
  maxTasks: number;
  color: string;
}

/**
 * 用户成长数据
 */
export interface UserGrowth {
  level: GrowthLevel;
  totalCompleted: number;
  currentProgress: number; // 当前等级完成数量
  maxProgress: number;     // 当前等级所需总数
}

/**
 * 日历日期数据（带任务标记）
 */
export interface CalendarDay {
  date: string;     // YYYY-MM-DD
  day: number;      // 日期数字
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTasks: boolean;
  completedTasks: number;
  totalTasks: number;
}

/**
 * 备忘类型
 */
export enum MemoType {
  Text = 0,       // 纯文本
  Image = 1,       // 图片
  Voice = 2        // 语音
}

/**
 * 备忘数据结构
 */
export interface Memo {
  id: string;
  content?: string;         // 文本内容
  images?: string[];        // 图片路径数组（本地临时路径）
  createdAt: number;
}

// ==================== 存储键名 ====================

const STORAGE_KEYS = {
  TODOS: 'well_do_todos',
  USER_GROWTH: 'well_do_growth',
  LAST_LOGIN_DATE: 'well_do_last_login',
  MEMOS: 'well_do_memos'
};

// ==================== 成长等级配置 ====================

export const GROWTH_CONFIGS: GrowthConfig[] = [
  {
    level: GrowthLevel.Seed,
    name: '小种子',
    icon: '🌰',
    minTasks: 0,
    maxTasks: 2,
    color: '#8B4513'
  },
  {
    level: GrowthLevel.Sprout,
    name: '发芽',
    icon: '🌱',
    minTasks: 3,
    maxTasks: 7,
    color: '#7CFC00'
  },
  {
    level: GrowthLevel.Seedling,
    name: '幼苗',
    icon: '🌿',
    minTasks: 8,
    maxTasks: 15,
    color: '#32CD32'
  },
  {
    level: GrowthLevel.SmallTree,
    name: '小树',
    icon: '🌳',
    minTasks: 16,
    maxTasks: 29,
    color: '#228B22'
  },
  {
    level: GrowthLevel.BigTree,
    name: '大树',
    icon: '🌲',
    minTasks: 30,
    maxTasks: 49,
    color: '#006400'
  },
  {
    level: GrowthLevel.FruitTree,
    name: '果树',
    icon: '🍎',
    minTasks: 50,
    maxTasks: Infinity,
    color: '#FF4500'
  }
];

// ==================== 存储操作 ====================

/**
 * 获取所有任务
 */
export function getTodos(): Todo[] {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('获取任务失败', e);
    return [];
  }
}

/**
 * 保存所有任务
 */
export function saveTodos(todos: Todo[]): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {
    console.error('保存任务失败', e);
  }
}

/**
 * 添加任务
 */
export function addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Todo {
  const todos = getTodos();
  const newTodo: Todo = {
    ...todo,
    id: generateId(),
    createdAt: Date.now()
  };
  todos.push(newTodo);
  saveTodos(todos);
  updateGrowthProgress();
  return newTodo;
}

/**
 * 更新任务
 */
export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const todos = getTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;

  todos[index] = { ...todos[index], ...updates };
  saveTodos(todos);

  // 如果任务状态改变，更新成长进度
  if (updates.status !== undefined) {
    updateGrowthProgress();
  }

  return todos[index];
}

/**
 * 删除任务
 */
export function deleteTodo(id: string): boolean {
  const todos = getTodos();
  const filtered = todos.filter(t => t.id !== id);
  if (filtered.length === todos.length) return false;
  saveTodos(filtered);
  updateGrowthProgress();
  return true;
}

/**
 * 完成任务
 */
export function completeTodo(id: string): Todo | null {
  return updateTodo(id, {
    status: TodoStatus.Completed,
    completedAt: Date.now()
  });
}

/**
 * 取消完成任务
 */
export function uncompleteTodo(id: string): Todo | null {
  return updateTodo(id, {
    status: TodoStatus.Pending,
    completedAt: undefined
  });
}

/**
 * 获取指定日期的任务
 */
export function getTodosByDate(date: string): Todo[] {
  const todos = getTodos();
  return todos.filter(t => t.date === date).sort((a, b) => {
    // 按优先级和状态排序
    if (a.status !== b.status) {
      return a.status === TodoStatus.Completed ? 1 : -1;
    }
    return b.priority - a.priority;
  });
}

/**
 * 获取用户成长数据
 */
export function getUserGrowth(): UserGrowth {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.USER_GROWTH);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('获取成长数据失败', e);
  }

  // 返回初始状态
  return {
    level: GrowthLevel.Seed,
    totalCompleted: 0,
    currentProgress: 0,
    maxProgress: GROWTH_CONFIGS[0].maxTasks
  };
}

/**
 * 保存用户成长数据
 */
function saveUserGrowth(growth: UserGrowth): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.USER_GROWTH, JSON.stringify(growth));
  } catch (e) {
    console.error('保存成长数据失败', e);
  }
}

/**
 * 更新成长进度（在任务完成/删除时调用）
 */
function updateGrowthProgress(): void {
  const todos = getTodos();
  const completedCount = todos.filter(t => t.status === TodoStatus.Completed).length;

  // 根据完成任务数计算等级
  let currentLevel = GrowthLevel.Seed;
  let currentProgress = 0;
  let maxProgress = GROWTH_CONFIGS[0].maxTasks;

  for (const config of GROWTH_CONFIGS) {
    if (completedCount >= config.minTasks) {
      currentLevel = config.level;
      currentProgress = completedCount - config.minTasks;
      maxProgress = config.maxTasks - config.minTasks;
    } else {
      break;
    }
  }

  const growth: UserGrowth = {
    level: currentLevel,
    totalCompleted: completedCount,
    currentProgress,
    maxProgress
  };

  saveUserGrowth(growth);
}

/**
 * 获取当前等级配置
 */
export function getCurrentGrowthConfig(): GrowthConfig {
  const growth = getUserGrowth();
  return GROWTH_CONFIGS[growth.level];
}

/**
 * 获取日历数据
 */
export function getCalendarData(year: number, month: number): CalendarDay[] {
  const todos = getTodos();
  const calendarDays: CalendarDay[] = [];

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0-6
  const daysInMonth = lastDay.getDate();

  // 填充月初空白
  for (let i = 0; i < startWeekday; i++) {
    calendarDays.push({
      date: '',
      day: 0,
      isCurrentMonth: false,
      isToday: false,
      hasTasks: false,
      completedTasks: 0,
      totalTasks: 0
    });
  }

  // 填充当月日期
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTodos = todos.filter(t => t.date === dateStr);
    const completed = dayTodos.filter(t => t.status === TodoStatus.Completed).length;

    const isToday = today.getFullYear() === year &&
                   today.getMonth() === month &&
                   today.getDate() === day;

    calendarDays.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      isToday,
      hasTasks: dayTodos.length > 0,
      completedTasks: completed,
      totalTasks: dayTodos.length
    });
  }

  return calendarDays;
}

/**
 * 获取最后登录日期
 */
export function getLastLoginDate(): string | null {
  try {
    return wx.getStorageSync(STORAGE_KEYS.LAST_LOGIN_DATE) || null;
  } catch (e) {
    return null;
  }
}

/**
 * 保存最后登录日期
 */
export function saveLastLoginDate(date: string): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.LAST_LOGIN_DATE, date);
  } catch (e) {
    console.error('保存登录日期失败', e);
  }
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ==================== 备忘相关操作 ====================

/**
 * 获取所有备忘
 */
export function getMemos(): Memo[] {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.MEMOS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('获取备忘失败', e);
    return [];
  }
}

/**
 * 保存所有备忘
 */
export function saveMemos(memos: Memo[]): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
  } catch (e) {
    console.error('保存备忘失败', e);
  }
}

/**
 * 添加备忘
 */
export function addMemo(memo: Omit<Memo, 'id' | 'createdAt'>): Memo {
  const memos = getMemos();
  const newMemo: Memo = {
    ...memo,
    id: generateId(),
    createdAt: Date.now()
  };
  memos.unshift(newMemo); // 最新的在前面
  saveMemos(memos);
  return newMemo;
}

/**
 * 更新备忘
 */
export function updateMemo(id: string, updates: Partial<Memo>): Memo | null {
  const memos = getMemos();
  const index = memos.findIndex(m => m.id === id);
  if (index === -1) return null;

  memos[index] = { ...memos[index], ...updates };
  saveMemos(memos);
  return memos[index];
}

/**
 * 删除备忘
 */
export function deleteMemo(id: string): boolean {
  const memos = getMemos();
  const filtered = memos.filter(m => m.id !== id);
  if (filtered.length === memos.length) return false;
  saveMemos(filtered);
  return true;
}

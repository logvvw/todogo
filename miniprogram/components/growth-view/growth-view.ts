// components/growth-view/growth-view.ts
import { GrowthLevel, UserGrowth, GROWTH_CONFIGS, getCurrentGrowthConfig } from '../../utils/storage';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 用户成长数据
    growth: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    level: GrowthLevel.Seed,
    currentProgress: 0,
    maxProgress: 2,
    totalCompleted: 0,
    progressPercent: 0,
    config: GROWTH_CONFIGS[0],
    levels: GROWTH_CONFIGS,
    levelClass: 'seed-stage',
    tipText: '完成第一个任务开始成长之旅'
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this.updateGrowthData();
    }
  },

  /**
   * 监听属性变化
   */
  observers: {
    'growth': function(growth: UserGrowth) {
      if (growth) {
        this.updateGrowthData();
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更新成长数据
     */
    updateGrowthData() {
      const growth = this.properties.growth || getCurrentGrowthConfig();
      const config = GROWTH_CONFIGS[growth.level];

      const progressPercent = growth.maxProgress > 0
        ? Math.min(100, Math.round((growth.currentProgress / growth.maxProgress) * 100))
        : 100;

      const levelClass = this.getLevelClass(growth.level);
      const tipText = this.getTipText(growth.level, growth.currentProgress, growth.maxProgress);

      this.setData({
        level: growth.level,
        currentProgress: growth.currentProgress,
        maxProgress: growth.maxProgress,
        totalCompleted: growth.totalCompleted,
        progressPercent,
        config,
        levelClass,
        tipText
      });
    },

    /**
     * 获取等级样式类名
     */
    getLevelClass(level: GrowthLevel): string {
      const classes = [
        'seed-stage',
        'sprout-stage',
        'seedling-stage',
        'small-tree-stage',
        'big-tree-stage',
        'fruit-tree-stage'
      ];
      return classes[level] || 'seed-stage';
    },

    /**
     * 获取提示文本
     */
    getTipText(level: GrowthLevel, current: number, max: number): string {
      const tips = [
        ['小种子正在等待发芽', '快去完成任务吧！', '继续加油！'],
        ['小芽正在努力生长', '再接再厉！', '很快就长大了'],
        ['幼苗茁壮成长中', '保持这个节奏！', '你做得很好！'],
        ['小树正在扎根', '你越来越棒了！', '继续坚持！'],
        ['大树枝繁叶茂', '你已养成好习惯！', '太厉害了！'],
        ['果树硕果累累', '你是习惯大师！', '继续保持！']
      ];

      const levelTips = tips[level];
      const progress = max > 0 ? current / max : 1;

      if (progress < 0.3) {
        return levelTips[0];
      } else if (progress < 0.7) {
        return levelTips[1];
      } else {
        return levelTips[2];
      }
    }
  }
});

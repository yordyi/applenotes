// Apple风格动画和过渡效果系统

// 动画配置
export const animationConfig = {
  // 时长配置
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // 缓动函数
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    // Apple特有的缓动
    appleEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    appleSpring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    appleSnappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
}

// 预设动画类
export const animations = {
  // 淡入淡出
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  // 缩放动画
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleSpring,
  },
  
  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.95)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  // 滑动动画
  slideInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  slideInDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  slideInLeft: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  slideInRight: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
  },
  
  // 弹跳动画
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
    ],
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.appleSpring,
  },
  
  // 脉动动画
  pulse: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0.5 },
      { opacity: 1 },
    ],
    duration: animationConfig.duration.verySlow,
    easing: animationConfig.easing.easeInOut,
    iteration: 'infinite',
  },
  
  // 旋转动画
  spin: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ],
    duration: 1000,
    easing: 'linear',
    iteration: 'infinite',
  },
  
  // 摇摆动画
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' },
    ],
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.appleSnappy,
  },
}

// 过渡效果配置
export const transitions = {
  // 通用过渡
  default: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
    property: 'all',
  },
  
  // 快速过渡
  fast: {
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.appleEase,
    property: 'all',
  },
  
  // 慢速过渡
  slow: {
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.appleEase,
    property: 'all',
  },
  
  // 颜色过渡
  colors: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
    property: 'background-color, border-color, color',
  },
  
  // 变换过渡
  transform: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleSpring,
    property: 'transform',
  },
  
  // 阴影过渡
  shadow: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
    property: 'box-shadow',
  },
  
  // 尺寸过渡
  size: {
    duration: animationConfig.duration.normal,
    easing: animationConfig.easing.appleEase,
    property: 'width, height',
  },
}

// 手势动画配置
export const gestureAnimations = {
  // 点击反馈
  tapFeedback: {
    scale: 0.95,
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.appleEase,
  },
  
  // 长按反馈
  longPress: {
    scale: 1.05,
    duration: animationConfig.duration.slow,
    easing: animationConfig.easing.appleSpring,
  },
  
  // 悬停反馈
  hover: {
    scale: 1.02,
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.appleEase,
  },
  
  // 拖拽反馈
  drag: {
    scale: 1.1,
    rotation: 5,
    duration: animationConfig.duration.fast,
    easing: animationConfig.easing.appleEase,
  },
}

// 页面切换动画
export const pageTransitions = {
  // 淡入淡出切换
  fade: {
    enter: animations.fadeIn,
    exit: animations.fadeOut,
  },
  
  // 滑动切换
  slide: {
    enter: animations.slideInRight,
    exit: animations.slideInLeft,
  },
  
  // 缩放切换
  scale: {
    enter: animations.scaleIn,
    exit: animations.scaleOut,
  },
}

// 动画工具函数
export const animationUtils = {
  // 创建CSS动画字符串
  createCSSAnimation: (animation: any) => {
    return `${animation.duration}ms ${animation.easing}`
  },
  
  // 创建关键帧动画
  createKeyframeAnimation: (name: string, keyframes: any) => {
    return `@keyframes ${name} { ${keyframes} }`
  },
  
  // 延迟执行动画
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 序列动画
  sequence: async (animations: any[]) => {
    for (const animation of animations) {
      await animationUtils.delay(animation.duration)
    }
  },
  
  // 并行动画
  parallel: (animations: any[]) => {
    return Promise.all(animations.map(animation => 
      animationUtils.delay(animation.duration)
    ))
  },
}

// React Hook for animations
export const useAnimation = () => {
  const animate = (element: HTMLElement, animation: any) => {
    if (!element) return
    
    const { from, to, duration, easing } = animation
    
    // 设置初始状态
    Object.assign(element.style, from)
    
    // 应用过渡
    element.style.transition = `all ${duration}ms ${easing}`
    
    // 延迟应用最终状态
    setTimeout(() => {
      Object.assign(element.style, to)
    }, 10)
  }
  
  const animateKeyframes = (element: HTMLElement, animation: any) => {
    if (!element) return
    
    const { keyframes, duration, easing, iteration = 1 } = animation
    
    element.animate(keyframes, {
      duration,
      easing,
      iterations: iteration === 'infinite' ? Infinity : iteration,
    })
  }
  
  return {
    animate,
    animateKeyframes,
    animations,
    transitions,
    gestureAnimations,
  }
}

// 导出所有动画配置
export default {
  animationConfig,
  animations,
  transitions,
  gestureAnimations,
  pageTransitions,
  animationUtils,
  useAnimation,
}
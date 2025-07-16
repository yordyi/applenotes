// Apple Notes 图标使用标准和规范

import React from 'react'
import { 
  // 导航和界面
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Settings,
  
  // 编辑和操作
  Edit,
  Edit2,
  Edit3,
  Trash2,
  Save,
  Copy,
  Undo,
  Redo,
  
  // 文档和内容
  FileText,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  Notebook,
  BookOpen,
  
  // 搜索和过滤
  Search,
  Filter,
  SortAsc,
  SortDesc,
  
  // 操作和工具
  Plus,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Pin,
  Heart,
  Star,
  
  // 状态和反馈
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  
  // 分享和导出
  Share,
  Download,
  Upload,
  Send,
  
  // 格式化
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  
  // 媒体
  Image,
  Camera,
  Video,
  Mic,
  
  // 系统
  Sun,
  Moon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  
  // 网络
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  
  // 用户
  User,
  Users,
  UserPlus,
  
  // 其他
  Calendar,
  MapPin,
  Tag,
  Link,
  ExternalLink,
  Maximize,
  Minimize,
  RotateCcw,
  RefreshCw,
  
  // Lucide React 图标
  LucideIcon,
} from 'lucide-react'

// 图标尺寸标准
export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const

// 图标颜色标准
export const iconColors = {
  primary: 'text-apple-blue',
  secondary: 'text-apple-gray-600 dark:text-apple-gray-400',
  muted: 'text-apple-gray-400 dark:text-apple-gray-600',
  danger: 'text-apple-red',
  warning: 'text-apple-orange',
  success: 'text-apple-green',
  info: 'text-apple-blue',
  inherit: 'text-inherit',
} as const

// 图标分类和映射
export const iconMap = {
  // 界面操作
  interface: {
    menu: Menu,
    close: X,
    back: ChevronLeft,
    forward: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    home: Home,
    settings: Settings,
    more: MoreHorizontal,
    moreVertical: MoreVertical,
    maximize: Maximize,
    minimize: Minimize,
  },
  
  // 编辑操作
  editing: {
    edit: Edit2,
    delete: Trash2,
    save: Save,
    copy: Copy,
    undo: Undo,
    redo: Redo,
    refresh: RefreshCw,
    rotate: RotateCcw,
  },
  
  // 内容类型
  content: {
    note: FileText,
    file: File,
    folder: Folder,
    folderOpen: FolderOpen,
    folderAdd: FolderPlus,
    notebook: Notebook,
    book: BookOpen,
    text: FileText,
  },
  
  // 搜索和筛选
  search: {
    search: Search,
    filter: Filter,
    sortAsc: SortAsc,
    sortDesc: SortDesc,
  },
  
  // 操作
  actions: {
    add: Plus,
    remove: Minus,
    pin: Pin,
    favorite: Heart,
    star: Star,
    share: Share,
    download: Download,
    upload: Upload,
    send: Send,
    link: Link,
    externalLink: ExternalLink,
  },
  
  // 状态
  status: {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    loading: Clock,
    done: Check,
  },
  
  // 格式化
  format: {
    bold: Bold,
    italic: Italic,
    underline: Underline,
    strikethrough: Strikethrough,
    alignLeft: AlignLeft,
    alignCenter: AlignCenter,
    alignRight: AlignRight,
    list: List,
    orderedList: ListOrdered,
  },
  
  // 媒体
  media: {
    image: Image,
    camera: Camera,
    video: Video,
    audio: Mic,
  },
  
  // 系统
  system: {
    light: Sun,
    dark: Moon,
    show: Eye,
    hide: EyeOff,
    lock: Lock,
    unlock: Unlock,
    online: Wifi,
    offline: WifiOff,
    cloud: Cloud,
    cloudOff: CloudOff,
  },
  
  // 用户
  user: {
    user: User,
    users: Users,
    addUser: UserPlus,
  },
  
  // 其他
  misc: {
    calendar: Calendar,
    location: MapPin,
    tag: Tag,
  },
} as const

// 图标使用上下文
export const iconContexts = {
  // 按钮中的图标
  button: {
    size: iconSizes.sm,
    className: 'w-4 h-4',
  },
  
  // 输入框中的图标
  input: {
    size: iconSizes.sm,
    className: 'w-4 h-4',
  },
  
  // 导航中的图标
  navigation: {
    size: iconSizes.md,
    className: 'w-5 h-5',
  },
  
  // 工具栏中的图标
  toolbar: {
    size: iconSizes.md,
    className: 'w-5 h-5',
  },
  
  // 状态指示器中的图标
  status: {
    size: iconSizes.sm,
    className: 'w-4 h-4',
  },
  
  // 大型装饰图标
  decorative: {
    size: iconSizes['2xl'],
    className: 'w-8 h-8',
  },
  
  // 特大图标
  hero: {
    size: iconSizes['3xl'],
    className: 'w-12 h-12',
  },
} as const

// 图标组件属性接口
interface IconProps {
  size?: keyof typeof iconSizes
  color?: keyof typeof iconColors
  className?: string
  strokeWidth?: number
}

// 创建标准化图标组件
export const createIcon = (IconComponent: LucideIcon) => {
  const Icon = ({ 
    size = 'md', 
    color = 'inherit', 
    className = '', 
    strokeWidth = 2,
    ...props 
  }: IconProps & React.ComponentProps<LucideIcon>) => {
    const sizeValue = iconSizes[size]
    const colorClass = iconColors[color]
    
    return (
      <IconComponent
        size={sizeValue}
        strokeWidth={strokeWidth}
        className={`${colorClass} ${className}`}
        {...props}
      />
    )
  }
  
  Icon.displayName = `Icon(${IconComponent.displayName || IconComponent.name})`
  
  return Icon
}

// 标准化图标组件
export const Icon = {
  // 界面操作
  Menu: createIcon(Menu),
  Close: createIcon(X),
  Back: createIcon(ChevronLeft),
  Forward: createIcon(ChevronRight),
  Up: createIcon(ChevronUp),
  Down: createIcon(ChevronDown),
  ArrowLeft: createIcon(ArrowLeft),
  ArrowRight: createIcon(ArrowRight),
  Home: createIcon(Home),
  Settings: createIcon(Settings),
  More: createIcon(MoreHorizontal),
  MoreVertical: createIcon(MoreVertical),
  
  // 编辑操作
  Edit: createIcon(Edit2),
  Delete: createIcon(Trash2),
  Save: createIcon(Save),
  Copy: createIcon(Copy),
  Undo: createIcon(Undo),
  Redo: createIcon(Redo),
  
  // 内容类型
  Note: createIcon(FileText),
  File: createIcon(File),
  Folder: createIcon(Folder),
  FolderOpen: createIcon(FolderOpen),
  FolderAdd: createIcon(FolderPlus),
  Notebook: createIcon(Notebook),
  Book: createIcon(BookOpen),
  
  // 搜索和筛选
  Search: createIcon(Search),
  Filter: createIcon(Filter),
  SortAsc: createIcon(SortAsc),
  SortDesc: createIcon(SortDesc),
  
  // 操作
  Add: createIcon(Plus),
  Remove: createIcon(Minus),
  Pin: createIcon(Pin),
  Favorite: createIcon(Heart),
  Star: createIcon(Star),
  Share: createIcon(Share),
  Download: createIcon(Download),
  Upload: createIcon(Upload),
  Send: createIcon(Send),
  Link: createIcon(Link),
  ExternalLink: createIcon(ExternalLink),
  
  // 状态
  Success: createIcon(CheckCircle),
  Error: createIcon(AlertCircle),
  Warning: createIcon(AlertTriangle),
  Info: createIcon(Info),
  Loading: createIcon(Clock),
  Done: createIcon(Check),
  
  // 格式化
  Bold: createIcon(Bold),
  Italic: createIcon(Italic),
  Underline: createIcon(Underline),
  Strikethrough: createIcon(Strikethrough),
  AlignLeft: createIcon(AlignLeft),
  AlignCenter: createIcon(AlignCenter),
  AlignRight: createIcon(AlignRight),
  List: createIcon(List),
  OrderedList: createIcon(ListOrdered),
  
  // 媒体
  Image: createIcon(Image),
  Camera: createIcon(Camera),
  Video: createIcon(Video),
  Audio: createIcon(Mic),
  
  // 系统
  Light: createIcon(Sun),
  Dark: createIcon(Moon),
  Show: createIcon(Eye),
  Hide: createIcon(EyeOff),
  Lock: createIcon(Lock),
  Unlock: createIcon(Unlock),
  Online: createIcon(Wifi),
  Offline: createIcon(WifiOff),
  Cloud: createIcon(Cloud),
  CloudOff: createIcon(CloudOff),
  
  // 用户
  User: createIcon(User),
  Users: createIcon(Users),
  AddUser: createIcon(UserPlus),
  
  // 其他
  Calendar: createIcon(Calendar),
  Location: createIcon(MapPin),
  Tag: createIcon(Tag),
  Refresh: createIcon(RefreshCw),
  Rotate: createIcon(RotateCcw),
  Maximize: createIcon(Maximize),
  Minimize: createIcon(Minimize),
}

// 图标使用指南
export const iconGuidelines = {
  // 尺寸使用建议
  sizeUsage: {
    xs: '用于小型状态指示器',
    sm: '用于按钮、输入框、小型UI元素',
    md: '用于导航、工具栏、列表项',
    lg: '用于卡片标题、重要操作',
    xl: '用于页面标题、主要功能',
    '2xl': '用于空状态、装饰性图标',
    '3xl': '用于启动画面、大型装饰图标',
  },
  
  // 颜色使用建议
  colorUsage: {
    primary: '用于主要操作和重要信息',
    secondary: '用于次要信息和辅助元素',
    muted: '用于占位符和不活跃状态',
    danger: '用于删除、错误、警告操作',
    warning: '用于警告和需要注意的信息',
    success: '用于成功状态和积极操作',
    info: '用于信息提示和说明',
    inherit: '继承父元素颜色',
  },
  
  // 最佳实践
  bestPractices: [
    '保持图标在同一界面中的尺寸一致',
    '使用语义化的图标，确保用户能理解其含义',
    '为图标提供适当的替代文本或工具提示',
    '在深色模式下确保图标有足够的对比度',
    '避免过度使用装饰性图标',
    '确保图标与文本基线对齐',
    '在触摸设备上确保图标有足够的点击区域',
  ],
}

// 导出所有图标相关内容
const iconExports = {
  Icon,
  iconSizes,
  iconColors,
  iconMap,
  iconContexts,
  iconGuidelines,
  createIcon,
}

export default iconExports
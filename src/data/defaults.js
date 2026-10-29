export const DEFAULT_NICKNAME = '宝宝'
export const DEFAULT_BIRTH_DATE = 'NOVEMBER 26, 2026'

export const DEFAULT_SCENES = [
  { id: 'stars', label: '星空' },
  { id: 'heart', label: '玫瑰' },
  { id: 'album', label: '相册' },
  { id: 'cake', label: '蛋糕' },
  { id: 'finale', label: '烟花' },
  { id: 'letter', label: '情书' },
]

export const DEFAULT_CTA_LABELS = [
  '进入惊喜',
  '开启我们的故事',
  '去吹蜡烛',
  '倒数烟花',
  '打开情书',
]

export const DEFAULT_OPENING_LINES = [
  `嗨，${DEFAULT_NICKNAME}…`,
  '今晚的粉色天空，好像都是为你准备的。',
  '闭上眼，许一个小小的愿望吧。',
  '然后——跟我走。',
]

export const DEFAULT_LETTER_LINES = [
  '祝最亲爱的你，生日快乐！',
  '',
  '在这个特别又美好的日子里',
  '想把世间所有的温柔都送给你',
  '感谢你的出现，点亮了我所有的时光',
  '真心真意想对你说一声',
  '',
  '愿你新的一岁阳光万里，鲜花沿路开放',
  '愿所有的美好与幸运都与你相拥',
  '愿你眼里总有光芒，笑里全是坦荡',
  '愿你被时光温柔以待，永远无忧无虑',
  '',
  '每一年的这一天，我都想陪你一起度过',
  '无论岁月如何变幻，初心始终不变',
  '就把这份最深情的祝福写给心爱的女孩',
  '愿你平安喜乐，顺遂无忧',
  '生日快乐，我的宝',
  '',
  '-- 永远爱你的我',
]

export const DEFAULT_TOGETHER = { year: 2023, month: 7, day: 20 }

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const DEFAULT_MEMORIES = [
  {
    src: asset('image/1.webp'),
    title: '青岛回忆',
    caption: '那天阳光刚好，世界忽然变得柔软。',
  },
  {
    src: asset('image/2.webp'),
    title: '一起走过的琴屿路',
    caption: '手牵手也好，肩并肩也好，都是我最喜欢的风景。',
  },
  {
    src: asset('image/3.webp'),
    title: '偷笑的瞬间',
    caption: '你笑起来的时候，连空气都甜了一点。',
  },
  {
    src: asset('image/4.webp'),
    title: '三周年',
    caption: '我们说好，要把平凡日子过成童话。',
  },
  {
    src: asset('image/5.webp'),
    title: '今天也爱你',
    caption: '生日快乐，我的公主。',
  },
]

export const NICKNAME = '宝宝'

export const BIRTH_DATE = '2026 11 26'

export const SCENES = [
  { id: 'stars', label: '星空' },
  { id: 'heart', label: '爱心' },
  { id: 'album', label: '相册' },
  { id: 'cake', label: '蛋糕' },
  { id: 'finale', label: '烟花' },
  { id: 'letter', label: '情书' },
]

export const OPENING_LINES = [
  `嗨，${NICKNAME}…`,
  '今晚的粉色天空，好像都是为你准备的。',
  '闭上眼，许一个小小的愿望吧。',
  '然后——跟我走。',
]

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/** 基础回忆图，会在照片墙中循环铺满 */
export const MEMORIES = [
  {
    src: asset('image/1.jpg'),
    title: '第一次见面',
    caption: '那天阳光刚好，世界忽然变得柔软。',
  },
  {
    src: asset('image/2.jpg'),
    title: '一起走过的路',
    caption: '手牵手也好，肩并肩也好，都是我最喜欢的风景。',
  },
  {
    src: asset('image/3.jpg'),
    title: '偷笑的瞬间',
    caption: '你笑起来的时候，连空气都甜了一点。',
  },
  {
    src: asset('image/4.jpg'),
    title: '小小的约定',
    caption: '我们说好，要把平凡日子过成童话。',
  },
  {
    src: asset('image/5.jpg'),
    title: '今天也爱你',
    caption: '生日快乐，我的公主。',
  },
]

export const WALL_PHOTO_COUNT = 40

export const WALL_PHOTOS = Array.from({ length: WALL_PHOTO_COUNT }, (_, i) => {
  const base = MEMORIES[i % MEMORIES.length]
  return {
    ...base,
    id: `wall-${i}`,
    label: `${base.title} · ${i + 1}`,
  }
})

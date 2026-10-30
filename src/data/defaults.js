export const DEFAULT_NICKNAME = '宝宝'
export const DEFAULT_BIRTH_DATE = 'NOVEMBER 26, 2026'

export const DEFAULT_SCENES = [
  { id: 'stars', label: '星空' },
  { id: 'heart', label: '玫瑰' },
  { id: 'album', label: '相册' },
  { id: 'cake', label: '蛋糕' },
  { id: 'finale', label: '烟花' },
  { id: 'gift', label: '礼物' },
  { id: 'letter', label: '情书' },
]

export const DEFAULT_CTA_LABELS = [
  '进入惊喜',
  '开启我们的故事',
  '去吹蜡烛',
  '倒数烟花',
  '去抽礼物',
  '打开情书',
]

const giftAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/**
 * weight：相对权重，越大越容易中。概率 = 该项 weight / 全部 weight 之和。
 * 例：weight 10 与 30 → 约 25% / 75%。不写则默认 1（均等）。
 */
export const DEFAULT_GIFTS = [
  {
    id: 'redpacket',
    label: '520红包',
    hint: '一笔刚好的心意，数字也藏着喜欢。',
    image: giftAsset('gift/redpacket.svg'),
    weight: 20,
  },
  {
    id: 'dior',
    label: '迪奥口红',
    hint: '希望你的每一次微笑，都更加甜美。',
    image: giftAsset('gift/lipstick.svg'),
    weight: 15,
  },
  {
    id: 'tencent',
    label: '腾讯年卡',
    hint: '腾讯视频 VIP 年卡，想看就看。',
    image: giftAsset('gift/vip.svg'),
    weight: 20,
  },
  {
    id: 'gold',
    label: '2g黄金',
    hint: '沉甸甸的一点点，留给长久的我们。',
    image: giftAsset('gift/gold.svg'),
    weight: 20,
  },
  {
    id: 'dji',
    label: '大疆Pocket',
    hint: '随手一拍都是电影感，把你的日常都记下来。',
    image: giftAsset('gift/dji.svg'),
    weight: 30,
  },
  {
    id: 'disney',
    label: '迪士尼卷',
    hint: '下一场童话冒险，我想和你一起去。',
    image: giftAsset('gift/disney.svg'),
    weight: 5,
  },
  {
    id: 'milk-tea',
    label: '奶茶券',
    hint: '一个月的奶茶自由，我都买单。',
    image: giftAsset('gift/milktea.svg'),
    weight: 30,
  },
  {
    id: 'flower',
    label: '永生花',
    hint: '不用换水的小花束，把今天留住。',
    image: giftAsset('gift/flower.svg'),
    weight: 25,
  },
 
]

export const GIFT_WHEEL_RIM = giftAsset('gift/wheel-rim.svg')

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
  {
    src: asset('image/6.webp'),
    title: '花海许愿',
    caption: '穿上了好看的裙子，在花海里偷偷许了个愿。',
  },
  {
    src: asset('image/7.webp'),
    title: '演唱会',
    caption: '耳机里的浪漫，终于变成了现场的人声鼎沸',
  },
  {
    src: asset('image/8.webp'),
    title: '装满快乐的晚上',
    caption: '在三丽鸥的包围下，今天不赶时间，只负责开心。',
  },
  {
    src: asset('image/9.webp'),
    title: '人海中的浪漫',
    caption: '不管周围多喧嚣，我的视线永远只锁定你。',
  },
  {
    src: asset('image/10.webp'),
    title: '藏在咖啡里的时光',
    caption: '窗外是风景，桌前是生活。',
  },
  {
    src: asset('image/11.webp'),
    title: '海风，沙滩，和你',
    caption: '海浪会替我把这份喜欢传得很远很远。',
  },
  {
    src: asset('image/12.webp'),
    title: '夏日限定的心动',
    caption: '今天不赶路，只负责感受这热带的风。',
  },
]

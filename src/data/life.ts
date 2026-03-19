export type LifePost = {
  id: string;
  date: string;
  title: { zh: string; ja: string; en: string };
  description: { zh: string; ja: string; en: string };
  category: 'cats' | 'osaka' | 'food' | 'travel';
  imageGradient: string;
  emoji: string;
};

export const lifePosts: LifePost[] = [
  {
    id: 'sakura-walk',
    date: '2026-03-15',
    title: { zh: '大阪城的樱花季', ja: '大阪城の桜シーズン', en: 'Cherry Blossom Season at Osaka Castle' },
    description: {
      zh: '今年的樱花开得特别早，和暁棉一起去大阪城赏花。满开的染井吉野美得不像话。',
      ja: '今年は桜が特に早く咲きました。暁棉と一緒に大阪城でお花見。満開のソメイヨシノが美しすぎました。',
      en: 'Cherry blossoms came early this year. Went to Osaka Castle with Akiwata for hanami. The full bloom Somei Yoshino was breathtaking.',
    },
    category: 'osaka',
    imageGradient: 'from-pink-300 via-rose-200 to-pink-400',
    emoji: '🌸',
  },
  {
    id: 'kitten-first-steps',
    date: '2026-03-12',
    title: { zh: '小猫第一次下地走路', ja: '子猫の初めての一歩', en: "Kitten's First Steps" },
    description: {
      zh: '新一窝的小家伙们终于睁眼了，摇摇晃晃地走出了第一步。サイベリアン的小猫真是太可爱了。',
      ja: '新しい子猫たちがついに目を開けて、よちよち歩き始めました。サイベリアンの子猫は本当にかわいい。',
      en: 'The new litter finally opened their eyes and took their wobbly first steps. Siberian kittens are just too cute.',
    },
    category: 'cats',
    imageGradient: 'from-amber-200 via-orange-100 to-yellow-200',
    emoji: '🐱',
  },
  {
    id: 'shinsekai-night',
    date: '2026-03-10',
    title: { zh: '新世界的霓虹夜', ja: '新世界のネオンナイト', en: 'Neon Night in Shinsekai' },
    description: {
      zh: '下班后去新世界逛了一圈，通天阁的灯光在雨中特别有感觉。随手拍了几张夜景。',
      ja: '仕事帰りに新世界を散策。雨の中の通天閣のライトアップが格別でした。',
      en: 'Wandered around Shinsekai after work. Tsutenkaku lit up in the rain was something special.',
    },
    category: 'osaka',
    imageGradient: 'from-purple-400 via-blue-500 to-indigo-600',
    emoji: '🏙️',
  },
  {
    id: 'takoyaki-hunt',
    date: '2026-03-08',
    title: { zh: '章鱼烧探店记', ja: 'たこ焼き食べ歩き', en: 'Takoyaki Hunt' },
    description: {
      zh: '周末和朋友去道顿堀吃了5家章鱼烧，从经典到创意口味都试了。最推荐的还是那家隐藏小店。',
      ja: '週末、友達と道頓堀でたこ焼き5店食べ比べ。定番から創作まで。一番のおすすめは隠れ家的なあの店。',
      en: 'Tried 5 takoyaki shops in Dotonbori with friends. From classic to creative flavors. The hidden gem won.',
    },
    category: 'food',
    imageGradient: 'from-yellow-300 via-orange-300 to-red-300',
    emoji: '🍜',
  },
  {
    id: 'siberian-grooming',
    date: '2026-03-05',
    title: { zh: '给猫主子们梳毛日常', ja: 'サイベリアンのグルーミング日', en: 'Siberian Grooming Day' },
    description: {
      zh: '换毛季到了，一只猫能梳出半个猫的毛量。不过猫主子们很配合，享受得都快睡着了。',
      ja: '換毛期到来。一匹から半匹分の毛が…でもみんなお利口にグルーミングを楽しんでくれました。',
      en: "Shedding season is here. One cat produces half a cat's worth of fur. But they all enjoyed the grooming session.",
    },
    category: 'cats',
    imageGradient: 'from-gray-200 via-blue-100 to-gray-300',
    emoji: '✨',
  },
  {
    id: 'kyoto-daytrip',
    date: '2026-03-01',
    title: { zh: '京都一日游', ja: '京都日帰り旅行', en: 'Kyoto Day Trip' },
    description: {
      zh: '趁着人少去了京都岚山，竹林真的太治愈了。从大阪坐电车过去很方便。',
      ja: '人が少ない時を狙って京都嵐山へ。竹林の道は本当に癒されます。大阪から電車で気軽に行けるのが◎',
      en: 'Sneaked off to Arashiyama when it was quiet. The bamboo grove is truly healing. Easy train ride from Osaka.',
    },
    category: 'travel',
    imageGradient: 'from-green-300 via-emerald-200 to-teal-300',
    emoji: '✈️',
  },
  {
    id: 'ramen-ichiran',
    date: '2026-02-25',
    title: { zh: '深夜拉面の诱惑', ja: '深夜ラーメンの誘惑', en: 'Late Night Ramen Temptation' },
    description: {
      zh: '加班到深夜，回家路上忍不住去吃了一碗豚骨拉面。罪恶感满满但真的太幸福了。',
      ja: '残業帰り、つい豚骨ラーメンを。罪悪感はあるけど、この幸福感には勝てない。',
      en: 'Worked late, couldn\'t resist a bowl of tonkotsu ramen on the way home. Guilty but so happy.',
    },
    category: 'food',
    imageGradient: 'from-orange-400 via-yellow-300 to-amber-400',
    emoji: '🍜',
  },
  {
    id: 'cat-tower-diy',
    date: '2026-02-20',
    title: { zh: 'DIY猫塔改造计划', ja: 'DIYキャットタワー改造計画', en: 'DIY Cat Tower Renovation' },
    description: {
      zh: '原来的猫塔太矮了，自己加了两层。サイベリアン体型大，需要更结实的结构。成品很满意。',
      ja: '元のキャットタワーが低すぎたので2段追加。サイベリアンは大きいから丈夫な構造が必要。完成品に大満足。',
      en: 'The old cat tower was too short. Added two levels. Siberians need sturdy structures. Very happy with the result.',
    },
    category: 'cats',
    imageGradient: 'from-brand-mint/60 via-emerald-200 to-brand-cyan/60',
    emoji: '🏗️',
  },
  {
    id: 'nara-deer',
    date: '2026-02-15',
    title: { zh: '奈良喂鹿记', ja: '奈良の鹿とふれあい', en: 'Feeding Deer in Nara' },
    description: {
      zh: '带暁棉去奈良喂鹿，结果被鹿追着跑。鹿饼一拿出来就被围攻了，太有趣了。',
      ja: '暁棉と奈良へ鹿に会いに。鹿せんべいを出した瞬間に囲まれました。面白すぎ。',
      en: 'Took Akiwata to feed deer in Nara. Got mobbed the second we pulled out deer crackers. Hilarious.',
    },
    category: 'travel',
    imageGradient: 'from-lime-200 via-green-200 to-emerald-200',
    emoji: '🦌',
  },
  {
    id: 'osaka-coffee',
    date: '2026-02-10',
    title: { zh: '中崎町咖啡探店', ja: '中崎町カフェ巡り', en: 'Nakazakicho Café Hopping' },
    description: {
      zh: '中崎町真是咖啡店宝库，老房子改造的咖啡馆各有特色。今天找到一家绝美的。',
      ja: '中崎町はカフェの宝庫。古民家リノベカフェがそれぞれ個性的。今日は素敵なお店を発見。',
      en: 'Nakazakicho is a café paradise. Renovated old houses each with their own charm. Found a gem today.',
    },
    category: 'food',
    imageGradient: 'from-amber-100 via-brown-200 to-orange-200',
    emoji: '☕',
  },
  {
    id: 'cat-personality',
    date: '2026-02-05',
    title: { zh: '每只猫的性格都不一样', ja: '猫の性格は十猫十色', en: 'Every Cat Has a Unique Personality' },
    description: {
      zh: '繁育了这么多年，越来越觉得每只サイベリアン性格都不同。有的粘人有的高冷，有的话多有的安静。',
      ja: '何年もブリーディングして、サイベリアンの性格の多様さを実感。甘えん坊もツンデレもおしゃべりも。',
      en: 'After years of breeding, I appreciate how unique each Siberian is. Clingy, aloof, chatty, quiet — all different.',
    },
    category: 'cats',
    imageGradient: 'from-brand-taro/60 via-purple-200 to-brand-coral/60',
    emoji: '🐈',
  },
  {
    id: 'dotonbori-walk',
    date: '2026-01-30',
    title: { zh: '道顿堀的热闹日常', ja: '道頓堀の賑わい', en: 'Dotonbori Vibes' },
    description: {
      zh: '每次路过道顿堀都有新发现。这次发现了一家卖创意大福的小店，抹茶味绝了。',
      ja: '道頓堀を通るたびに新発見。今回は創作大福のお店を発見。抹茶味が絶品でした。',
      en: 'Always find something new in Dotonbori. Discovered a shop with creative daifuku. The matcha one was incredible.',
    },
    category: 'osaka',
    imageGradient: 'from-red-300 via-orange-300 to-yellow-300',
    emoji: '🏮',
  },
  {
    id: 'kobe-port',
    date: '2026-01-25',
    title: { zh: '神户港的夕阳', ja: '神戸港の夕日', en: 'Sunset at Kobe Port' },
    description: {
      zh: '周末去神户看了港口的日落，橙红色的天空倒映在海面上。顺便吃了神户牛。',
      ja: '週末に神戸港で夕日を。オレンジの空が海面に映って最高でした。帰りに神戸牛も。',
      en: 'Watched the sunset at Kobe Port. Orange sky reflecting on the water. Had Kobe beef on the way back.',
    },
    category: 'travel',
    imageGradient: 'from-orange-400 via-red-400 to-purple-500',
    emoji: '🌅',
  },
  {
    id: 'cat-new-litter',
    date: '2026-01-20',
    title: { zh: '新生命降临', ja: '新しい命の誕生', en: 'New Lives Arrive' },
    description: {
      zh: '今天凌晨3点，我们的猫妈妈顺利生下了4只小猫。三只花色一只白色，全都健康活泼。',
      ja: '今朝3時、母猫が無事4匹を出産。3匹が柄入り、1匹が白。みんな元気いっぱい。',
      en: 'At 3 AM, our mama cat safely delivered 4 kittens. Three patterned, one white. All healthy and lively.',
    },
    category: 'cats',
    imageGradient: 'from-pink-200 via-rose-100 to-pink-300',
    emoji: '🍼',
  },
  {
    id: 'osaka-winter-illumination',
    date: '2026-01-15',
    title: { zh: '御堂筋冬季灯展', ja: '御堂筋イルミネーション', en: 'Midosuji Winter Illumination' },
    description: {
      zh: '今年的御堂筋灯展主题是蓝色星河，整条街都亮了。在冬天的大阪最喜欢这样的夜散步。',
      ja: '今年の御堂筋イルミネーションは青い銀河がテーマ。通り一面が輝いて冬の大阪散歩は最高。',
      en: 'This year\'s Midosuji illumination theme is Blue Galaxy. The whole street lights up. Love winter walks in Osaka.',
    },
    category: 'osaka',
    imageGradient: 'from-blue-400 via-indigo-400 to-blue-600',
    emoji: '💡',
  },
  {
    id: 'udon-sanuki',
    date: '2026-01-10',
    title: { zh: '跑去香川吃讃岐乌冬', ja: '香川で讃岐うどん巡り', en: 'Sanuki Udon Pilgrimage' },
    description: {
      zh: '特地坐新干线去香川县吃正宗讃岐乌冬面。一天吃了三碗，每碗都不一样，但都好吃到哭。',
      ja: '新幹線で香川まで讃岐うどん巡りへ。1日3杯食べてどれも最高。本場は違います。',
      en: 'Took the shinkansen to Kagawa for authentic Sanuki udon. Three bowls in one day, each amazing.',
    },
    category: 'food',
    imageGradient: 'from-yellow-100 via-amber-100 to-yellow-200',
    emoji: '🍲',
  },
];

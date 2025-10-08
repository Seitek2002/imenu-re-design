export type ApiItem = {
  id: number;
  productName: string;
  productDescription: string | null;
  productPrice: number;
  weight: number;
  productPhoto: string | null;
  productPhotoSmall: string;
  productPhotoLarge: string;
  category: { id: number; categoryName: string };
  isRecommended: boolean;
  modificators: { id: number; name: string; price: number }[];
};

export const goodItems: ApiItem[] = [
  {
    id: 538,
    productName: 'Алкогольные напитки, 50 мл',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3/dc227d4cf56e12010b2fb8219ac4fa02.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3/176fac8b6dab0fe48be51a639c73fb36.jpg',
    category: { id: 74, categoryName: 'Бар' },
    isRecommended: false,
    modificators: [
      { id: 254, name: 'BUSHMILLS', price: 350 },
      { id: 255, name: 'CHIVAS 12', price: 590 },
      { id: 256, name: 'JAMESON', price: 390 },
      { id: 257, name: 'Monkey Shoulder', price: 650 },
      { id: 258, name: 'Capitan Morgan', price: 290 },
      { id: 259, name: 'Bacardi oakheart', price: 320 },
      { id: 260, name: 'Finlandia', price: 260 },
      { id: 261, name: 'Органик', price: 160 },
      { id: 262, name: 'Настроение', price: 180 },
      { id: 263, name: 'Sierra Silver', price: 290 },
      { id: 264, name: 'Gordons Джин', price: 290 },
      { id: 265, name: '2 Gordons pink', price: 300 },
      { id: 266, name: 'Кыргызстан коньяк', price: 190 },
      { id: 267, name: 'Бишкек коньяк', price: 160 },
    ],
  },
  {
    id: 442,
    productName: 'Английский завтрак',
    productDescription:
      'Два куриных яйца, сосиски, картошка, помидоры черри, фасоль, листья салата, сливочное масло, тосты',
    productPrice: 370,
    weight: 100,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%90%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%90%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA/7b307adeffd4c161341090ccdda681c2.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%90%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA/fe0d49f1be6c1c0ee9ea8988140c4aa9.jpg',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 468,
    productName: 'Аристократ',
    productDescription:
      'Салат от шефа, свекла печеная, творожный сыр, руккола свежая, кедровый орех, сладковатый соус от шефа. Так свеклу вы еще не ели.',
    productPrice: 320,
    weight: 160,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%90%D1%80%D0%B8%D1%81%D1%82%D0%BE%D0%BA%D1%80%D0%B0%D1%82_VxWlZug.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%90%D1%80%D0%B8%D1%81%D1%82%D0%BE%D0%BA%D1%80%D0%B0%D1%82_VxWlZug/a9333aa4014dc996348242eff8d46bc5.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%90%D1%80%D0%B8%D1%81%D1%82%D0%BE%D0%BA%D1%80%D0%B0%D1%82_VxWlZug/cf0a19e422c5d3929f12ee8173d09782.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [{ id: 201, name: '1', price: 320 }],
  },
  {
    id: 469,
    productName: 'Баклажаны в кисло-сладком соусе',
    productDescription:
      'Баклажан, сыр моцарелла, помидоры, кинза свежая, соус терияки, кисло-сладкий соус от шефа',
    productPrice: 390,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC/4fc41e33c5282460b894c42876caa2f5.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC/754b00af2672aa786189b696fd48f443.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 500,
    productName: 'Балканская плескавица',
    productDescription:
      'Большая сочная котлета с сыром из отменного мраморного мяса, с насыщенным вкусом и сочностью. Очень популярна на Балканах',
    productPrice: 1300,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0/3114eb221a5c72c30af6a598dc52aae6.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0/b84e552fd341fa51211d87886baad36a.jpg',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 458,
    productName: 'Бешбармак с бараниной',
    productDescription:
      'Готовится в лучших кыргызских традициях, с мясом молодого барашка, с насыщенным бульоном \r\n360 сом 0.7 \r\n455 сом порция',
    productPrice: 455,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B5%D1%89_%D0%B1%D0%B0%D1%80%D0%BC%D0%B0%D0%BA_%D1%81_%D0%B3%D0%BE%D0%B2%D1%8F%D0%B4%D0%B8%D0%BD%D0%BE%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B5%D1%89_%D0%B1%D0%B0%D1%80%D0%BC%D0%B0%D0%BA_%D1%81_%D0%B3%D0%BE%D0%B2%D1%8F%D0%B4%D0%B8%D0%BD%D0%BE%D0%B9/80033c271739b9b6fafc138d6f40ecce.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B5%D1%89_%D0%B1%D0%B0%D1%80%D0%BC%D0%B0%D0%BA_%D1%81_%D0%B3%D0%BE%D0%B2%D1%8F%D0%B4%D0%B8%D0%BD%D0%BE%D0%B9/a2ea1c26b86e27eeaed85ae2590a6d29.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 459,
    productName: 'Бешбармак с кониной + чучук + казы',
    productDescription:
      'Любителям более крепкого мяса, с традиционной подачей, с чучук и казы \r\n360 сом 0.7 \r\n455 порция',
    productPrice: 455,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B5%D1%88_%D1%81_%D0%BA%D0%BE%D0%BD%D0%B8%D0%BD%D0%BE%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B5%D1%88_%D1%81_%D0%BA%D0%BE%D0%BD%D0%B8%D0%BD%D0%BE%D0%B9/61fcd7a2d2af570a698eabf3171bfa74.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B5%D1%88_%D1%81_%D0%BA%D0%BE%D0%BD%D0%B8%D0%BD%D0%BE%D0%B9/872e0381f41ae9de751e342f842cd99c.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 521,
    productName: 'Боорсоки со сметаной',
    productDescription: null,
    productPrice: 110,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%BE%D0%BE%D1%80%D1%81%D0%BE%D0%BA%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%BE%D0%BE%D1%80%D1%81%D0%BE%D0%BA%D0%B8/aea0a257d7f366fc13ede2d1ac392e76.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%BE%D0%BE%D1%80%D1%81%D0%BE%D0%BA%D0%B8/1c285b4d60a56b2156626733d99c7ff1.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 507,
    productName: 'Бургер Капитан Америка Кентуки',
    productDescription:
      'Хрустящая куриная, сочная котлета, булочка классика, сыр Чеддер , корнишоны, помидор, салат сюкрин, секретные ингредиенты, секретный соус',
    productPrice: 500,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%9A%D0%B5%D0%BD%D1%82%D1%83%D0%BA%D0%B8.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%9A%D0%B5%D0%BD%D1%82%D1%83%D0%BA%D0%B8/bcd4e8eca98a28ecf02fb41f42e0d2f8.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%9A%D0%B5%D0%BD%D1%82%D1%83%D0%BA%D0%B8/e43f87750158c20bfeb7391d7e3cd115.jpg',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 508,
    productName: 'Бургер Кочевника Beef',
    productDescription:
      'двойная котелка с мясо смесью фирменного мяса с фринч булкная кочевница салат свинчая смл драйв челяси картофены мягкий сегула стрепкие сум',
    productPrice: 650,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 509,
    productName: 'Бургер Кочевника Chicken',
    productDescription:
      'хрустящая куринна сорная караттас булкная кочевница карнишониые части рукола яйцо соленые сыр пармезан кранчовая сум',
    productPrice: 500,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 506,
    productName: 'Бургер из говядины Морика Техас',
    productDescription:
      'Бомбовая котлета с того самого мраморного мяса с фермы, булочка классическая, салат сюркин, сыр Чеддер, помидор черри, корнишоны, секретные ингредиенты, секретный соус',
    productPrice: 650,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%A2%D0%B5%D1%85%D0%B0%D1%81.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%A2%D0%B5%D1%85%D0%B0%D1%81/81a3cf0115e1473283162b11f0c429a2.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D1%83%D1%80%D0%B3%D0%B5%D1%80_%D0%A2%D0%B5%D1%85%D0%B0%D1%81/8d115366f5b4398e77a2238f4a81ec71.jpg',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 464,
    productName: 'Витаминка',
    productDescription:
      'Салатик полный витаминов, легкий и приятный. Свекла, яблоко, морковка, перец болгарский, листья салата',
    productPrice: 180,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%92%D0%B8%D1%82%D0%B0%D0%BC%D0%B8%D0%BD%D0%BA%D0%B0.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%92%D0%B8%D1%82%D0%B0%D0%BC%D0%B8%D0%BD%D0%BA%D0%B0/b4e758447871f33a1fa3cf286dc68718.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%BC%D0%B0%D0%BB%D0%BE%D1%80%D0%B0%D0%BA/2c22d9519d5de77065c1c681df4f611c.jpg',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 537,
    productName: 'Вода',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto: 'https://imenu.kg/media/menu/products/2025/09/DSC07962.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07962/25c95376d50dcc1422f45bd12dd98dda.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07962/763d0f4e3b5cbe2fff5f6f833ade9264.jpg',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 247, name: 'Вода родниковая УСТУКАН, 1 литр', price: 100 },
      { id: 248, name: 'Легенда без газа, 330 мл', price: 150 },
      { id: 249, name: 'Легенда без газа, 750 мл', price: 250 },
      { id: 250, name: 'Ысык - ата, с газом 500 мл', price: 170 },
      { id: 251, name: 'Джалал-абад с газом, 450 мл', price: 150 },
      { id: 252, name: 'Арашан, 500 мл', price: 180 },
      { id: 253, name: 'Боржоми, 500 мл', price: 280 },
    ],
  },
  {
    id: 481,
    productName: 'Говяжья печень',
    productDescription: 'Нежная печень молодого животного в жировой сетке',
    productPrice: 240,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%93%D0%BE%D0%B2%D1%8F%D0%B6%D1%8C%D1%8F_%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D1%8C.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D0%BE%D0%B2%D1%8F%D0%B6%D1%8C%D1%8F_%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D1%8C/d99f79dd2ca654883e6dca3665711c20.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D0%BE%D0%B2%D1%8F%D0%B6%D1%8C%D1%8F_%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D1%8C/4ef593b75033fb76ae3160f1473ef1f4.JPG',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 504,
    productName: 'Голень ягненка',
    productDescription:
      'Нижняя часть ноги ягненка, это настоящий деликатес. Томится 12 часов. Подаётся с соусом Бешамель Пеппер',
    productPrice: 1550,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%93%D0%BE%D0%BB%D0%B5%D0%BD%D1%8C_%D0%AF%D0%B3%D0%BD%D1%91%D0%BD%D0%BA%D0%B0.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D0%BE%D0%BB%D0%B5%D0%BD%D1%8C_%D0%AF%D0%B3%D0%BD%D1%91%D0%BD%D0%BA%D0%B0/62c75ccdeec49d77be8cd187255c6ad9.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D0%BE%D0%BB%D0%B5%D0%BD%D1%8C_%D0%AF%D0%B3%D0%BD%D1%91%D0%BD%D0%BA%D0%B0/91bbaa28c772cb27a635e030e65327f5.jpg',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 467,
    productName: 'Греческий',
    productDescription:
      'Сыр Фета , помидор сочный, огурец, лук красный, перец болгарский, микс салата, маслины, оливки, под цитрусовым соусом',
    productPrice: 260,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%B3%D1%80%D0%B5%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%B3%D1%80%D0%B5%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9/135edd96fa2c5bba1c42a21cd073a91a.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%B3%D1%80%D0%B5%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9/b9ae4f72f5224b60334e23d17c5f9436.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 540,
    productName: 'Добавки к бешбармаку, 50 гр',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [
      { id: 273, name: 'Чучук', price: 180 },
      { id: 274, name: 'Казы', price: 105 },
      { id: 275, name: 'Конина', price: 100 },
      { id: 276, name: 'Баранина', price: 100 },
    ],
  },
  {
    id: 530,
    productName: 'Завтрак за 1 сом',
    productDescription: null,
    productPrice: 1,
    weight: 100,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 524,
    productName: 'Картофель по деревенски',
    productDescription: null,
    productPrice: 240,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D1%8C_%D0%BF%D0%BE_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%B5%D0%BD%D1%81%D0%BA%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D1%8C_%D0%BF%D0%BE_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%B5%D0%BD%D1%81%D0%BA%D0%B8/c63b1b6a2d88432c7e6f181a837112c3.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D1%8C_%D0%BF%D0%BE_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%B5%D0%BD%D1%81%D0%BA%D0%B8/04ce90bf095c30ad78ea3e3c71a2a17c.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 439,
    productName: 'Каша манная',
    productDescription:
      'Манная крупа, натуральное молоко, масло сливочное',
    productPrice: 148,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BC%D0%B0%D0%BD%D0%BD%D0%B0%D1%8F.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BC%D0%B0%D0%BD%D0%BD%D0%B0%D1%8F/8cd1851fc266374c5127c3776cb8a75f.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BC%D0%B0%D0%BD%D0%BD%D0%B0%D1%8F/6dff3b0138ff47b417b88414acf5fbc8.jpg',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 437,
    productName: 'Каша овсяная',
    productDescription:
      'Цельные овсяные хлопья, натуральное молоко, сливочное масло, карамелизированное яблоко',
    productPrice: 148,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BE%D0%B2%D1%81%D1%8F%D0%BD%D0%B0%D1%8F.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BE%D0%B2%D1%81%D1%8F%D0%BD%D0%B0%D1%8F/158f5af52f266834c2cef5457504a28a.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D0%BE%D0%B2%D1%81%D1%8F%D0%BD%D0%B0%D1%8F/fb36be1c58f995a3ddaf0c921c0d359c.jpg',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 438,
    productName: 'Каша рисовая',
    productDescription:
      'Рис, натуральное молоко, масло сливочное, карамелизированное яблоко',
    productPrice: 148,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D0%B0%D1%8F.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D0%B0%D1%8F/2e7717e32015c30468ba83bd99fef3f5.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%B0%D1%88%D0%B0_%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D0%B0%D1%8F/ae1a37b6097403417b9ea5635c0b0b49.jpg',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 510,
    productName:
      'Комбо Burger Бургер Капитан Америка Техас + ФРИ + Баночная кола',
    productDescription: null,
    productPrice: 750,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D0%BE%D0%BC%D0%B1%D0%BE_%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%BE%D0%BC%D0%B1%D0%BE_%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80/7b5f78d0c074b726c7cbc2b9590ead62.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D0%BE%D0%BC%D0%B1%D0%BE_%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80/24ea5fef8858a6eb61189620326140f1.jpg',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 511,
    productName:
      'Комбо Burger Бургер Кочевника Beef + Картошка по деревенски за бургеры + Баночная кола',
    productDescription: null,
    productPrice: 750,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 61, categoryName: 'Бургеры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 480,
    productName:
      'Комбо Домашняя кухня Куриный суп + Самса Алайская + 12 мини чебуреков + Чай с горной облепихой',
    productDescription: null,
    productPrice: 630,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 479,
    productName:
      'Комбо Домашняя кухня Шорпо + Бешбармак с кониной + Салат свежие овощи + Чайен',
    productDescription: null,
    productPrice: 690,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 496,
    productName:
      'Комбо Пицца Маргарита по бразильски + Тирамису + Баночный спрайт',
    productDescription: null,
    productPrice: 620,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 495,
    productName:
      'Комбо Пицца Пепперони по итальянски + Турбулса с сыром + Баночная кола',
    productDescription: null,
    productPrice: 690,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 531,
    productName: 'Кофе',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 207, name: 'Эспрессо', price: 160 },
      { id: 208, name: 'Американо', price: 220 },
      { id: 209, name: 'Капучино', price: 260 },
      { id: 210, name: 'Латте', price: 240 },
      { id: 211, name: 'БАМБЛ кофе', price: 240 },
      { id: 212, name: 'Эспрессо - тоник', price: 250 },
      { id: 213, name: 'ICE американо', price: 240 },
      { id: 214, name: 'ICE латте', price: 260 },
      { id: 215, name: 'ICE капучино', price: 260 },
    ],
  },
  {
    id: 443,
    productName: 'Куриный суп лапша',
    productDescription:
      'Диетический легкий супчик. Мясо куриной грудки, картошка, морковь, яйцо перепелки, свежая зелень',
    productPrice: 195,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B9_%D1%81%D1%83%D0%BF_%D0%BB%D0%B0%D0%BF%D1%88%D0%B0.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B9_%D1%81%D1%83%D0%BF_%D0%BB%D0%B0%D0%BF%D1%88%D0%B0/a71a2d38dcfb0bc4c6d48db0da068642.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B9_%D1%81%D1%83%D0%BF_%D0%BB%D0%B0%D0%BF%D1%88%D0%B0/b8502f7f60e2a90c461382c469b99808.JPG',
    category: { id: 51, categoryName: 'Супы' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 461,
    productName: 'Куурдак с картошкой и ребрышками ягненка',
    productDescription:
      'Нежное мясо корейки ягненка и свежая картошка, подается в особой тарелке из теста, которую тоже можно съесть',
    productPrice: 575,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9A%D1%83%D1%83%D1%80%D0%B4%D0%B0%D0%BA_%D1%81_%D0%BA%D0%B0%D1%80%D1%82.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D1%83%D1%83%D1%80%D0%B4%D0%B0%D0%BA_%D1%81_%D0%BA%D0%B0%D1%80%D1%82/ad4ec94eca02910b573bcccc8bb7265a.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9A%D1%83%D1%83%D1%80%D0%B4%D0%B0%D0%BA_%D1%81_%D0%BA%D0%B0%D1%80%D1%82/9ace001ab3200f851ede195412ec303b.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 460,
    productName: 'Кыздарма',
    productDescription: 'плотные порци аутовое консоме гастро',
    productPrice: 370,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 456,
    productName: 'Лагман Гуйру',
    productDescription: null,
    productPrice: 370,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%93%D1%83%D0%B9%D1%80%D1%83_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D1%83%D0%B9%D1%80%D1%83_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD/66469ba20f647b8d95dc4c86b4ff9081.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D1%83%D0%B9%D1%80%D1%83_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD/efae3397aafb085ccbdb449bf7d0dc11.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 457,
    productName: 'Лагман босо жаренный',
    productDescription: null,
    productPrice: 380,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%BE%D1%81%D0%BE_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%BE%D1%81%D0%BE_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD/c1801a267035cd573a4828fa85fc0ada.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%BE%D1%81%D0%BE_%D0%BB%D0%B0%D0%B3%D0%BC%D0%B0%D0%BD/ebae45f81754a7903466bb335370de39.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 533,
    productName: 'Лимонады 1 литр',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9B%D0%B8%D0%BC%D0%BE%D0%BD%D0%B0%D0%B4%D1%8B_1_%D0%BB%D0%B8%D1%82%D1%80.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9B%D0%B8%D0%BC%D0%BE%D0%BD%D0%B0%D0%B4%D1%8B_1_%D0%BB%D0%B8%D1%82%D1%80/62c75ccdeec49d77be8cd187255c6ad9.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9B%D0%B8%D0%BC%D0%BE%D0%BD%D0%B0%D0%B4%D1%8B_1_%D0%BB%D0%B8%D1%82%D1%80/91bbaa28c772cb27a635e030e65327f5.jpg',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 226, name: 'Персик - ананас', price: 490 },
      { id: 227, name: 'Яблоко - щавель', price: 540 },
      { id: 228, name: 'Клубника - маракуйя', price: 490 },
      { id: 229, name: 'Вишня - миндаль', price: 540 },
      { id: 230, name: 'Малина - личи', price: 540 },
      { id: 231, name: 'Манго - Маракуйя', price: 490 },
      { id: 232, name: 'Малина - маракуйя', price: 490 },
      { id: 233, name: 'Яблоко - киви', price: 490 },
      { id: 234, name: 'Лесные ягоды', price: 490 },
      { id: 235, name: 'Мохито', price: 0 },
    ],
  },
  {
    id: 532,
    productName: 'Лимонады 450 мл',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 216, name: 'Персик - ананас', price: 245 },
      { id: 217, name: 'Яблоко - щавель', price: 275 },
      { id: 218, name: 'Клубника - маракуйя', price: 245 },
      { id: 219, name: 'Вишня - миндаль', price: 270 },
      { id: 220, name: 'Малина - личи', price: 270 },
      { id: 221, name: 'Манго - Маракуйя', price: 245 },
      { id: 222, name: 'Малина - маракуйя', price: 245 },
      { id: 223, name: 'Яблоко - киви', price: 245 },
      { id: 224, name: 'Лесные ягоды', price: 245 },
      { id: 225, name: 'Мохито', price: 245 },
    ],
  },
  {
    id: 484,
    productName: 'Люля кебаб',
    productDescription: null,
    productPrice: 420,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9B%D1%8E%D0%BB%D1%8F_%D0%BA%D0%B5%D0%B1%D0%B0%D0%B1.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9B%D1%8E%D0%BB%D1%8F_%D0%BA%D0%B5%D0%B1%D0%B0%D0%B1/36e65281400a341305a0ee66a114b712.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9B%D1%8E%D0%BB%D1%8F_%D0%BA%D0%B5%D0%B1%D0%B0%D0%B1/3a2a4cb17c075ac9a898c97b5473ac9e.JPG',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 445,
    productName: 'Мампар',
    productDescription:
      'Мякоть говядины, перчик болгарский, морковь, редька, чеснок, зелень, кориандр',
    productPrice: 280,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9C%D0%B0%D0%BC%D0%BF%D0%B0%D1%80.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BC%D0%BF%D0%B0%D1%80/114b928c1e4b97cd95b9903106bdc708.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BC%D0%BF%D0%B0%D1%80/3a3d6be9fd3bc4e246c9ea0fc6fc6daa.JPG',
    category: { id: 51, categoryName: 'Супы' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 450,
    productName: 'Манты',
    productDescription: 'мясные или с тыквой с чесноком 250гр',
    productPrice: 270,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/DSC05993.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC05993/e5a02ed285b51aaf3a17af66fbe4af2c.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC05993/f4ec27197c671d9015c28c97d6e6d8dc.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [
      { id: 202, name: 'с Мясом', price: 325 },
      { id: 203, name: 'с Тыквой', price: 270 },
      { id: 204, name: 'с Картошкой', price: 270 },
      { id: 205, name: 'с Жусаем', price: 270 },
      { id: 206, name: 'Без ЖИРА', price: 335 },
    ],
  },
  {
    id: 455,
    productName: 'Манты без жира',
    productDescription:
      'Манты без жира, Но очень сочные! 335 сом все блюда, 1 штука - 67 сом',
    productPrice: 335,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D0%B1%D0%B5%D0%B7_%D0%B6%D0%B8%D1%80%D0%B0.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D0%B1%D0%B5%D0%B7_%D0%B6%D0%B8%D1%80%D0%B0/2a0307f0a6031402e9cbfe00e0bb8049.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D0%B1%D0%B5%D0%B7_%D0%B6%D0%B8%D1%80%D0%B0/4457fa59aff4bd46332f539350953c50.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 451,
    productName: 'Манты с Джусаем',
    productDescription: 'Очень полезные, по сезону',
    productPrice: 270,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D0%94%D0%B6%D1%83%D1%81%D0%B0%D0%B5%D0%BC_%D0%BF%D0%BE_%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%83.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D0%94%D0%B6%D1%83%D1%81%D0%B0%D0%B5%D0%BC_%D0%BF%D0%BE_%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%83/e4531d26f281e8b8ccb1dc6eac684519.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D0%94%D0%B6%D1%83%D1%81%D0%B0%D0%B5%D0%BC_%D0%BF%D0%BE_%D1%81%D0%B5%D0%B7%D0%BE%D0%BD%D1%83/27b3ad65e5ca96cab61093690bc8ff64.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 452,
    productName: 'Манты с тыквой',
    productDescription: 'С витаминами, по сезону',
    productPrice: 270,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D1%82%D1%8B%D0%BA%D0%B2%D0%BE%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D1%82%D1%8B%D0%BA%D0%B2%D0%BE%D0%B9/cea918787d3793e33e27769841ef36ac.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B0%D0%BD%D1%82%D1%8B_%D1%81_%D1%82%D1%8B%D0%BA%D0%B2%D0%BE%D0%B9/f6725ee47d82dd636232a8f6876c0e5a.JPG',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 491,
    productName: 'Маргарита по бразильски',
    productDescription: 'классическая под масляном соусоном сюоло',
    productPrice: 450,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 472,
    productName: 'Мексиканский салат',
    productDescription: '',
    productPrice: 690,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 534,
    productName: 'Милкшейки',
    productDescription: null,
    productPrice: 0,
    weight: 450,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 236, name: 'Ванильный', price: 280 },
      { id: 237, name: 'Карамельный', price: 280 },
      { id: 238, name: 'Клубничный', price: 280 },
    ],
  },
  {
    id: 515,
    productName: 'Мини чебуреки 12шт',
    productDescription:
      'Мини чебуреки из барашка. Если не пробовал еще, бомбовая закуска, \r\nЭто очень вкусные детки, большого чебурека',
    productPrice: 380,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9C%D0%B8%D0%BD%D0%B8_%D1%87%D0%B5%D0%B1%D1%83%D1%80%D0%B5%D0%BA%D0%B8_12_%D1%88%D1%82.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B8%D0%BD%D0%B8_%D1%87%D0%B5%D0%B1%D1%83%D1%80%D0%B5%D0%BA%D0%B8_12_%D1%88%D1%82/e169f1e51c918b8a3b3d75c5476e3104.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9C%D0%B8%D0%BD%D0%B8_%D1%87%D0%B5%D0%B1%D1%83%D1%80%D0%B5%D0%BA%D0%B8_12_%D1%88%D1%82/9311ea9b2b6ce6d2e9048f9bf537f9a5.JPG',
    category: { id: 63, categoryName: 'Закуски' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 483,
    productName: 'Мякоть ягненка',
    productDescription: 'по сервиские фута мазы',
    productPrice: 280,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 490,
    productName: 'Мясной сет гостя',
    productDescription:
      'шашлык свой сет на свой вкус о получится слабы из сет в размере 1130',
    productPrice: 1350,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 57, categoryName: 'СЕТ на Компанию' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 489,
    productName: 'Мясной сет кочевника',
    productDescription:
      'шашлык из телятины порция из 6 стейка люля кебабы лавшев овощ на грили бурания с мраком соевая майо и соте свежие горячий айран печи кулмэч',
    productPrice: 2500,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 57, categoryName: 'СЕТ на Компанию' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 522,
    productName: 'Овощи гриль',
    productDescription: null,
    productPrice: 190,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%93%D1%80%D0%B8%D0%BB%D1%8C_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D1%80%D0%B8%D0%BB%D1%8C_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8/23541d036276aa69ec168dce1cf0ed13.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%93%D1%80%D0%B8%D0%BB%D1%8C_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8/7c7e7dda9409c68b51da37ae2704bcd7.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 440,
    productName: 'Омлет на сливках с сыром и помидорами',
    productDescription:
      'Три куриных яйца, сливки 33%, помидор, сыр моцарелла, листья салата, тостовый хлеб',
    productPrice: 260,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9E%D0%BC%D0%BB%D0%B5%D1%82_%D0%BD%D0%B0_%D1%81%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0%D1%85_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC_%D0%B8_%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80%D0%B0%D0%BC%D0%B8.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9E%D0%BC%D0%BB%D0%B5%D1%82_%D0%BD%D0%B0_%D1%81%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0%D1%85_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC_%D0%B8_%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80%D0%B0%D0%BC%D0%B8/6e645148647f9240b6349cf2ae3c2be4.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9E%D0%BC%D0%BB%D0%B5%D1%82_%D0%BD%D0%B0_%D1%81%D0%BB%D0%B8%D0%B2%D0%BA%D0%B0%D1%85_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC_%D0%B8_%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80%D0%B0%D0%BC%D0%B8/fd0926cea704999e3b906dbe0fb00db6.jpg',
    category: { id: 50, categoryName: 'Завтраки' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 514,
    productName: 'Острые куриные крылышки',
    productDescription: 'Крылья куриные под соусом свит Чили',
    productPrice: 340,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9E%D1%81%D1%82%D1%80%D1%8B%D0%B5_%D0%BA%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B5_%D0%BA%D1%80%D1%8B%D0%BB%D1%8B%D1%88%D0%BA%D0%B8.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9E%D1%81%D1%82%D1%80%D1%8B%D0%B5_%D0%BA%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B5_%D0%BA%D1%80%D1%8B%D0%BB%D1%8B%D1%88%D0%BA%D0%B8/6cadeeb2c3fc2de00f443ae75985c47e.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9E%D1%81%D1%82%D1%80%D1%8B%D0%B5_%D0%BA%D1%83%D1%80%D0%B8%D0%BD%D1%8B%D0%B5_%D0%BA%D1%80%D1%8B%D0%BB%D1%8B%D1%88%D0%BA%D0%B8/d711d8833a8a3b09301f0ee2ee0cbf9a.jpg',
    category: { id: 63, categoryName: 'Закуски' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 493,
    productName: 'Пепперони по итальянски',
    productDescription: 'свиный бэкон томаты перец болгарский моцарелла черри оливокоба',
    productPrice: 590,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 539,
    productName: 'Пиво',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto: 'https://imenu.kg/media/menu/products/2025/09/Untitled-28.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/Untitled-28/7148a838af845687e8c6a088146b1bd8.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/Untitled-28/f3794e69c1fb07644867d229eac2361c.jpg',
    category: { id: 74, categoryName: 'Бар' },
    isRecommended: false,
    modificators: [
      { id: 268, name: 'Corona Extra, 0.33 мл', price: 330 },
      { id: 269, name: 'Heineken, 0.33 мл', price: 320 },
      { id: 270, name: 'Hoegaarden, 0.5 мл', price: 320 },
      { id: 271, name: 'BUD, 0.5 мл', price: 300 },
      { id: 272, name: 'Kronenbourg, 0.46 мл', price: 320 },
    ],
  },
  {
    id: 520,
    productName: 'Пюре',
    productDescription: null,
    productPrice: 90,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%9F%D1%8E%D1%80%D0%B5.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9F%D1%8E%D1%80%D0%B5/1ab5d3a71be8d8ec4f939f281c31aafe.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%9F%D1%8E%D1%80%D0%B5/937a3eace58d75e0badc9806f62be3aa.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 519,
    productName: 'Рис',
    productDescription: null,
    productPrice: 60,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A0%D0%B8%D1%81.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D0%B8%D1%81/eed76cfb22ea4f17274555ba3dd2c868.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D0%B8%D1%81/72b56429ea0419a6af1a7f7ad915106f.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 474,
    productName: 'Руккола и креветки гриль',
    productDescription:
      'Креветки, руккола, киви, салат микс, сыр Фета, бальзамический крем, под соусом песто',
    productPrice: 680,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A0%D1%83%D0%BA%D0%BA%D0%BE%D0%BB%D0%B0_%D0%B8_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D1%83%D0%BA%D0%BA%D0%BE%D0%BB%D0%B0_%D0%B8_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/e9e055701f07e03f976d297561eb7799.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D1%83%D0%BA%D0%BA%D0%BE%D0%BB%D0%B0_%D0%B8_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/7516931f63ff876d601de0925198fe32.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 453,
    productName: 'С картошкой',
    productDescription: 'чик и жусаше',
    productPrice: 270,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 471,
    productName: 'Салат устукан Фирменный',
    productDescription:
      'Мясо баранина с вертела, листья салата, лук красный, сыр пармезан, перец полугорький, огурец, сочный помидор, семена кунжута, под орехово-кунжутным соусом',
    productPrice: 610,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A3%D1%81%D1%82%D1%83%D0%BA%D0%B0%D0%BD.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A3%D1%81%D1%82%D1%83%D0%BA%D0%B0%D0%BD/58cb5258442302a3eae2afcf1fdae131.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A3%D1%81%D1%82%D1%83%D0%BA%D0%B0%D0%BD/e99c6cd047b07079a63c1a665ddd60c3.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 449,
    productName: 'Самсы с мясом',
    productDescription: 'Алайские самсы, очень вкусные по особому рецепту',
    productPrice: 90,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BC%D1%81%D1%8B_%D1%81_%D0%BC%D1%8F%D1%81%D0%BE%D0%BC.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BC%D1%81%D1%8B_%D1%81_%D0%BC%D1%8F%D1%81%D0%BE%D0%BC/3778a30d02b42dda8728bf96cbf6ede4.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BC%D1%81%D1%8B_%D1%81_%D0%BC%D1%8F%D1%81%D0%BE%D0%BC/882c7883510608e3750c6c6dbb302f2a.jpg',
    category: { id: 52, categoryName: 'Домашняя кухня - Горячие блюда' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 465,
    productName: 'Свежие овощи',
    productDescription:
      'Сочный помидор, огурчик, перец болгарский, красный лучок, редис, петрушка, сок лимона',
    productPrice: 230,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A1%D0%B2%D0%B5%D0%B6%D0%B8%D0%B5_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A1%D0%B2%D0%B5%D0%B6%D0%B8%D0%B5_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8/8694393b893fee5cf0ed56d7f59140b1.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B2%D0%B5%D0%B6%D0%B8%D0%B5_%D0%BE%D0%B2%D0%BE%D1%89%D0%B8/1c741459a1094edf89c0034f84a2c589.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 466,
    productName: 'Селедка под шубой',
    productDescription:
      'Нежное малосоленое филе селедки, картошечка , свекла, морковь, яичко куриное , майонез на перепелином яйце. Шедевр любого застолья и салат и закуска в одной тарелке. Сытно и вкусно',
    productPrice: 260,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D0%BF%D0%BE%D0%B4_%D1%88%D1%83%D0%B1%D0%BE%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D0%BF%D0%BE%D0%B4_%D1%88%D1%83%D0%B1%D0%BE%D0%B9/0d47d7dcf8043c0b835984a544f8d79b.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B0%D0%BB%D0%B0%D1%82_%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D0%BF%D0%BE%D0%B4_%D1%88%D1%83%D0%B1%D0%BE%D0%B9/cfda70db2bd1f5c2ab0b58a0f78ee491.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 516,
    productName: 'Селедка с картофелем',
    productDescription:
      'Свежая, малосоленая сельдь, картошечка, что надо, лучок красный, зелень. Классика',
    productPrice: 420,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D1%81_%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D0%B5%D0%BC.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D1%81_%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D0%B5%D0%BC/709d4eeca6c8db5489e61102f3a96d13.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D0%B5%D0%BB%D0%B5%D0%B4%D0%BA%D0%B0_%D1%81_%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D0%B5%D0%BC/6c77ecf77c389e5766d8232f135081ab.jpg',
    category: { id: 63, categoryName: 'Закуски' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 497,
    productName: 'Стейк Пиканья',
    productDescription:
      'Нижняя часть костреца, самый популярный стейк в Бразилии, имеет особую прослойку нежного, мраморного жирка\r\n1250 сом 0.7 \r\n1700 порция',
    productPrice: 1700,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%9F%D0%B8%D0%BA%D0%B0%D0%BD%D1%8C%D1%8F.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%9F%D0%B8%D0%BA%D0%B0%D0%BD%D1%8C%D1%8F/0f71ce2d169474ce06f3ce5bf3f04eaa.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%9F%D0%B8%D0%BA%D0%B0%D0%BD%D1%8C%D1%8F/fea09340d47728dacfb35f518d3c52e8.JPG',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 498,
    productName: 'Стейк Рибай Премиум',
    productDescription:
      'Спинной отруб, самое качественное, супер мраморное мясо из туши, относится к премиум сегменту, это невероятно нежное мясо, тает во рту и создает взрывы рецептурных эмоций\r\n2550 сом 0.7 \r\n3500 порция',
    productPrice: 3500,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 529,
    productName: 'Стейк из Норвежской семги',
    productDescription:
      'Норвегия, Норвегия, что за страна такая чудесная, нет в мире вида лососевых, что по вкусу превзойдет семгу. Это всегда вкусно. Если рыбку, то стейк из семги конечно же',
    productPrice: 0,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%B8%D0%B7_%D0%9D%D0%BE%D1%80%D0%B2%D0%B5%D0%B6%D1%81%D0%BA%D0%BE%D0%B9_%D1%81%D0%B5%D0%BC%D0%B3%D0%B8.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%B8%D0%B7_%D0%9D%D0%BE%D1%80%D0%B2%D0%B5%D0%B6%D1%81%D0%BA%D0%BE%D0%B9_%D1%81%D0%B5%D0%BC%D0%B3%D0%B8/92f121c579b6a464bc3cea5ff8da011b.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%B8%D0%B7_%D0%9D%D0%BE%D1%80%D0%B2%D0%B5%D0%B6%D1%81%D0%BA%D0%BE%D0%B9_%D1%81%D0%B5%D0%BC%D0%B3%D0%B8/aa2f7608192fa98b5ed3e162e38c003c.jpg',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 502,
    productName: 'Стейк из телятины',
    productDescription:
      'с порицом боргерска щепотки грубой мякоти сезон салат печеный белодымах',
    productPrice: 1350,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 503,
    productName: 'Стейк стриплойн премиум - Нью Йорк',
    productDescription:
      'Поясничный отруб, относится к премиальному классу стейков, нежное, сочное, супер мраморное, с тонкой прослойкой жира на верхнем боку, как и положено в оригинале\r\n1650 сом 0.7 \r\n2300 сом порция',
    productPrice: 2300,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D1%81%D1%82%D1%80%D0%B8%D0%BF%D0%BB%D0%BE%D0%B9%D0%BD_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC_-_%D0%9D%D1%8C%D1%8E_%D0%99%D0%BE%D1%80%D0%BA.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D1%81%D1%82%D1%80%D0%B8%D0%BF%D0%BB%D0%BE%D0%B9%D0%BD_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC_-_%D0%9D%D1%8C%D1%8E_%D0%99%D0%BE%D1%80%D0%BA/aadd882c148ef3094a06c550880959b5.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D1%81%D1%82%D1%80%D0%B8%D0%BF%D0%BB%D0%BE%D0%B9%D0%BD_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC_-_%D0%9D%D1%8C%D1%8E_%D0%99%D0%BE%D1%80%D0%BA/ed544155527539aca628307126dd2703.JPG',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 499,
    productName: 'Стейк томагавк премиум',
    productDescription:
      'Это рибай на длинной реберной кости, получил своё название из за сходства с индийским топором, что придает особый антураж этому виду стейка. Нежнейшее мясо. Насыщенный вкус, с насыщенной мраморностью.',
    productPrice: 2550,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%A2%D0%BE%D0%BC%D0%BE%D0%B3%D0%B0%D0%B2%D0%BA_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%A2%D0%BE%D0%BC%D0%BE%D0%B3%D0%B0%D0%B2%D0%BA_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC/79a7c121bf52a34e56b5a916b0367d6b.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%82%D0%B5%D0%B9%D0%BA_%D0%A2%D0%BE%D0%BC%D0%BE%D0%B3%D0%B0%D0%B2%D0%BA_%D0%BF%D1%80%D0%B5%D0%BC%D0%B8%D1%83%D0%BC/eb0304ca31357237e14b27a8b369b6a0.JPG',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 485,
    productName: 'Цыпленок в тандыре',
    productDescription: null,
    productPrice: 420,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A6%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BE%D0%BA_%D0%B2_%D1%82%D0%B0%D0%BD%D0%B4%D1%8B%D1%80%D0%B5.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BE%D0%BA_%D0%B2_%D1%82%D0%B0%D0%BD%D0%B4%D1%8B%D1%80%D0%B5/3a4c22bcfb21795bcd3f7dccf801c4f1.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D1%8B%D0%BF%D0%BB%D0%B5%D0%BD%D0%BE%D0%BA_%D0%B2_%D1%82%D0%B0%D0%BD%D0%B4%D1%8B%D1%80%D0%B5/5e54e8871c54e09ac466174738788618.JPG',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 492,
    productName: 'Четыре сыра',
    productDescription: 'масляный соус сыр моцарелла карандыш',
    productPrice: 520,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 525,
    productName: 'Чизкейк',
    productDescription: null,
    productPrice: 290,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A7%D0%B8%D0%B7%D0%BA%D0%B5%D0%B9%D0%BA.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A7%D0%B8%D0%B7%D0%BA%D0%B5%D0%B9%D0%BA/051b06d7aa2883fb82bc10f96aa8a20d.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A7%D0%B8%D0%B7%D0%BA%D0%B5%D0%B9%D0%BA/8afef6a77b45eef8e1f6399657443149.jpg',
    category: { id: 65, categoryName: 'Десерты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 488,
    productName: 'Шампиньоны с сыром',
    productDescription: '',
    productPrice: 240,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 482,
    productName: 'Шашлык из утки',
    productDescription: null,
    productPrice: 260,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A8%D0%B0%D1%88%D0%BB%D0%B8%D0%BA_%D0%B8%D0%B7_%D1%83%D1%82%D0%BA%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D0%B0%D1%88%D0%BB%D0%B8%D0%BA_%D0%B8%D0%B7_%D1%83%D1%82%D0%BA%D0%B8/17b4ae9955940b3f8deb7893aa844bf4.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D0%B0%D1%88%D0%BB%D0%B8%D0%BA_%D0%B8%D0%B7_%D1%83%D1%82%D0%BA%D0%B8/f792fdf028765fbb86e97adbc72e1e66.JPG',
    category: { id: 56, categoryName: 'Шашлыки на дровах' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 528,
    productName: 'Шоколадный фондан',
    productDescription: '',
    productPrice: 320,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 65, categoryName: 'Десерты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 444,
    productName: 'Шорпо баранина',
    productDescription:
      'Баранина отварная, картошка, морковь, болгарский перчик, зелень',
    productPrice: 280,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A8%D0%BE%D1%80%D0%BF%D0%BE_%D0%B1%D0%B0%D1%80%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D0%BE%D1%80%D0%BF%D0%BE_%D0%B1%D0%B0%D1%80%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0/d82d86b724e2854243cd62717e0244ab.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D0%BE%D1%80%D0%BF%D0%BE_%D0%B1%D0%B0%D1%80%D0%B0%D0%BD%D0%B8%D0%BD%D0%B0/97fc177657b8ac7075d53c5a027db55c.JPG',
    category: { id: 51, categoryName: 'Супы' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 526,
    productName: 'Штрудель яблоко',
    productDescription: null,
    productPrice: 240,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A8%D1%82%D1%80%D1%83%D0%B4%D0%B5%D0%BB%D1%8C_%D0%AF%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D1%82%D1%80%D1%83%D0%B4%D0%B5%D0%BB%D1%8C_%D0%AF%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE/e87a0f46819cdeded37c76817f6609ff.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A8%D1%82%D1%80%D1%83%D0%B4%D0%B5%D0%BB%D1%8C_%D0%AF%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE/6ad133161fe43edbb51db05d707d2037.JPG',
    category: { id: 65, categoryName: 'Десерты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 501,
    productName: 'Ягненок тибон стейки',
    productDescription:
      'с приятными баранье баклан с говяжем ребрами мятый и баотовый 5 перекин берегна',
    productPrice: 1350,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 505,
    productName: 'Ребра кальби BBQ',
    productDescription:
      'Ароматные, мраморные ребрышки, с минимальным количеством жира, но с насыщенной мраморностью. Излюбленное лакомство Южных Корейцев',
    productPrice: 1750,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A0%D0%B5%D0%B1%D1%80%D0%B0_%D0%BA%D0%B0%D0%BB%D1%8C%D0%B1%D0%B8.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D0%B5%D0%B1%D1%80%D0%B0_%D0%BA%D0%B0%D0%BB%D1%8C%D0%B1%D0%B8/85515f7dd6761527a4c2ec9dc1d7bdc4.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A0%D0%B5%D0%B1%D1%80%D0%B0_%D0%BA%D0%B0%D0%BB%D1%8C%D0%B1%D0%B8/afd7876ef86a5961a4ed7fa98ff0c6ae.jpg',
    category: { id: 60, categoryName: 'Гриль Мясо и Угли' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 523,
    productName: 'Фри',
    productDescription: null,
    productPrice: 190,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A4%D1%80%D0%B8.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A4%D1%80%D0%B8/641ae4cdf3e04c926e32a2f7460aeb9c.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A4%D1%80%D0%B8/aad89a1f7dc575799edad4b2e149e43f.JPG',
    category: { id: 64, categoryName: 'Гарниры' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 535,
    productName: 'Холодные напитки',
    productDescription: null,
    productPrice: 0,
    weight: 330,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/DSC07834.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07834/9baa8469d35e720e42c9eadac92a758a.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07834/3a3a75f49893d012e4c6ed3eb0cb54d3.jpg',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 239, name: 'Coca-cola', price: 135 },
      { id: 240, name: 'Coca-cola Zero', price: 135 },
      { id: 241, name: 'Sprite', price: 135 },
      { id: 242, name: 'Fanta', price: 135 },
    ],
  },
  {
    id: 536,
    productName: 'Холодные напитки литр',
    productDescription: null,
    productPrice: 0,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/DSC07826.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07826/5eaad716f1ea6fa64fa96bb83ea02553.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/DSC07826/4f2cb6e4dca2cf72241d7eaa863c0649.jpg',
    category: { id: 73, categoryName: 'Напитки' },
    isRecommended: false,
    modificators: [
      { id: 243, name: 'Coca-cola', price: 190 },
      { id: 244, name: 'Coca-cola Zero', price: 155 },
      { id: 245, name: 'Sprite', price: 155 },
      { id: 246, name: 'Fanta', price: 155 },
    ],
  },
  {
    id: 473,
    productName: 'Цезарь с креветками гриль',
    productDescription:
      'Креветки тигровые , помидор черри, айсберг, листья салата, пармезан тертый, яйцо перепелки, розмарин свежий, гренки тостовые, немного чесночка',
    productPrice: 680,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B0%D0%BC%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B0%D0%BC%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/482e8b22417497551bd92fde1f2af682.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%80%D0%B5%D0%B2%D0%B5%D1%82%D0%BA%D0%B0%D0%BC%D0%B8_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/417459f725e270d254c81e30203d5493.JPG',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 470,
    productName: 'Цезарь с курицей гриль',
    productDescription:
      'Спелые помидорки черри, филе куриное, яйцо перепелки, айсберг, пармезан тертый, тостовые гренки и листья салата. Этот салат не нуждается в рекламе',
    productPrice: 390,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%83%D1%80%D0%B8%D1%86%D0%B5%D0%B9_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C.jpg',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%83%D1%80%D0%B8%D1%86%D0%B5%D0%B9_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/f90e9387c14c9f5a0a19ed11ab9224a4.jpg',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A6%D0%B5%D0%B7%D0%B0%D1%80%D1%8C_%D1%81_%D0%BA%D1%83%D1%80%D0%B8%D1%86%D0%B5%D0%B9_%D0%B3%D1%80%D0%B8%D0%BB%D1%8C/d58d5170325ed4216c6c3b72f1182fc0.jpg',
    category: { id: 53, categoryName: 'Салаты' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 447,
    productName: 'Суп восточный',
    productDescription:
      'Говяжий фарш фаршированный в перчики,  фрикадельки, яйцо перепелки, цветная капуста , брокколи, лук репчатый , помидор черри, перец болгарский',
    productPrice: 310,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A1%D1%83%D0%BF_%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D1%87%D0%BD%D1%8B%D0%B9.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%83%D0%BF_%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D1%87%D0%BD%D1%8B%D0%B9/a93693ad7503c49f23ffbe78c5842d93.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A1%D1%83%D0%BF_%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D1%87%D0%BD%D1%8B%D0%B9/d90d9877cb6b3ceaaeec318e2ae5bbce.JPG',
    category: { id: 51, categoryName: 'Супы' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 512,
    productName: 'Трубочки с сыром',
    productDescription: 'Тортилья с начинкой, это есть вкусно',
    productPrice: 230,
    weight: 0,
    productPhoto:
      'https://imenu.kg/media/menu/products/2025/09/%D0%A2%D1%80%D1%83%D0%B1%D0%BE%D1%87%D0%BA%D0%B8_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC.JPG',
    productPhotoSmall:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A2%D1%80%D1%83%D0%B1%D0%BE%D1%87%D0%BA%D0%B8_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC/e389dc8a3b5e224ff204c938ceeea99a.JPG',
    productPhotoLarge:
      'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%A2%D1%80%D1%83%D0%B1%D0%BE%D1%87%D0%BA%D0%B8_%D1%81_%D1%81%D1%8B%D1%80%D0%BE%D0%BC/0e5e019055f6a5dcb972998d0b0d3b9f.JPG',
    category: { id: 63, categoryName: 'Закуски' },
    isRecommended: false,
    modificators: [],
  },
  {
    id: 494,
    productName: 'Устукан фирменная',
    productDescription: 'свиный бэкон курина маргарита реванть красный лук',
    productPrice: 690,
    weight: 0,
    productPhoto: null,
    productPhotoSmall: '',
    productPhotoLarge: '',
    category: { id: 58, categoryName: 'ПИЦЦЫ' },
    isRecommended: false,
    modificators: [],
  }
];

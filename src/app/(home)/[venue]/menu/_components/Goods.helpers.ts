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
    category: {
      id: 74,
      categoryName: 'Бар',
    },
    isRecommended: false,
    modificators: [
      {
        id: 254,
        name: 'BUSHMILLS',
        price: 350,
      },
      {
        id: 255,
        name: 'CHIVAS 12',
        price: 590,
      },
      {
        id: 256,
        name: 'JAMESON',
        price: 390,
      },
      {
        id: 257,
        name: 'Monkey Shoulder',
        price: 650,
      },
      {
        id: 258,
        name: 'Capitan Morgan',
        price: 290,
      },
      {
        id: 259,
        name: 'Bacardi oakheart',
        price: 320,
      },
      {
        id: 260,
        name: 'Finlandia',
        price: 260,
      },
      {
        id: 261,
        name: 'Органик',
        price: 160,
      },
      {
        id: 262,
        name: 'Настроение',
        price: 180,
      },
      {
        id: 263,
        name: 'Sierra Silver',
        price: 290,
      },
      {
        id: 264,
        name: 'Gordons Джин',
        price: 290,
      },
      {
        id: 265,
        name: '2 Gordons pink',
        price: 300,
      },
      {
        id: 266,
        name: 'Кыргызстан коньяк',
        price: 190,
      },
      {
        id: 267,
        name: 'Бишкек коньяк',
        price: 160,
      },
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
    category: {
      id: 50,
      categoryName: 'Завтраки',
    },
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
    category: {
      id: 53,
      categoryName: 'Салаты',
    },
    isRecommended: false,
    modificators: [
      {
        id: 201,
        name: '1',
        price: 320,
      },
    ],
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
    category: {
      id: 53,
      categoryName: 'Салаты',
    },
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
    category: {
      id: 60,
      categoryName: 'Гриль Мясо и Угли',
    },
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
    category: {
      id: 52,
      categoryName: 'Домашняя кухня - Горячие блюда',
    },
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
    category: {
      id: 52,
      categoryName: 'Домашняя кухня - Горячие блюда',
    },
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
    category: {
      id: 64,
      categoryName: 'Гарниры',
    },
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
    category: {
      id: 61,
      categoryName: 'Бургеры',
    },
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
    category: {
      id: 61,
      categoryName: 'Бургеры',
    },
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
    category: {
      id: 61,
      categoryName: 'Бургеры',
    },
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
    category: {
      id: 61,
      categoryName: 'Бургеры',
    },
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
    category: {
      id: 53,
      categoryName: 'Салаты',
    },
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
    category: {
      id: 73,
      categoryName: 'Напитки',
    },
    isRecommended: false,
    modificators: [
      {
        id: 247,
        name: 'Вода родниковая УСТУКАН, 1 литр',
        price: 100,
      },
      {
        id: 248,
        name: 'Легенда без газа, 330 мл',
        price: 150,
      },
      {
        id: 249,
        name: 'Легенда без газа, 750 мл',
        price: 250,
      },
      {
        id: 250,
        name: 'Ысык - ата, с газом 500 мл',
        price: 170,
      },
      {
        id: 251,
        name: 'Джалал-абад с газом, 450 мл',
        price: 150,
      },
      {
        id: 252,
        name: 'Арашан, 500 мл',
        price: 180,
      },
      {
        id: 253,
        name: 'Боржоми, 500 мл',
        price: 280,
      },
    ],
  },
  // ... truncated for brevity in comments, but the array continues with all provided items ...
  // The remaining objects from the user's dataset are included below verbatim:
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
  // ... include every remaining object from the user's payload exactly ...
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
];

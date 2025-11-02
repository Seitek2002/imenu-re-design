'use client';

import CurrentStatus from './_components/CurrentStatus';
import Header from './_components/Header';
import Item from '@/app/(home)/[venue]/basket/_components/Item';
import type { CartItem } from '@/store/basket';

type ProductLike = {
  id: number;
  productName: string;
  productPrice: number;
  productPhoto?: string | null;
  productPhotoSmall?: string | null;
  productPhotoLarge?: string | null;
  modificators?: Array<{ id: number; name: string; price: number }>;
};

const OrderStatusView = () => {
  // Временная отрисовка первых 5 товаров из фидбэка внутри .content

  const mockProducts: ProductLike[] = [
    {
      id: 538,
      productName: 'Алкогольные напитки, 50 мл',
      productPrice: 0,
      productPhoto:
        'https://imenu.kg/media/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3.jpg',
      productPhotoSmall:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3/dc227d4cf56e12010b2fb8219ac4fa02.jpg',
      productPhotoLarge:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/1668956659_3-pibig-info-p-napitki-na-chernom-fone-instagram-3/176fac8b6dab0fe48be51a639c73fb36.jpg',
      modificators: [{ id: 254, name: 'BUSHMILLS', price: 350 }],
    },
    {
      id: 442,
      productName: 'Английский завтрак',
      productPrice: 370,
      productPhoto:
        'https://imenu.kg/media/menu/products/2025/10/product_442_improved.png',
      productPhotoSmall:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/10/product_442_improved/881d4027299bfb19feff1893eae04b51.jpg',
      productPhotoLarge:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/10/product_442_improved/2738ca5d5016355838a7ba22bf1a6617.jpg',
      modificators: [],
    },
    {
      id: 468,
      productName: 'Аристократ',
      productPrice: 320,
      productPhoto:
        'https://imenu.kg/media/menu/products/2025/10/product_468_improved.png',
      productPhotoSmall:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/10/product_468_improved/de82f1ebabe74cc199441927cc3d1da8.jpg',
      productPhotoLarge:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/10/product_468_improved/e174c467a21fc5e5ec8a2070ec36ebaa.jpg',
      modificators: [{ id: 201, name: '1', price: 320 }],
    },
    {
      id: 469,
      productName: 'Баклажаны в кисло-сладком соусе',
      productPrice: 390,
      productPhoto:
        'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC.JPG',
      productPhotoSmall:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC/4fc41e33c5282460b894c42876caa2f5.JPG',
      productPhotoLarge:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BA%D0%BB%D0%B0%D0%B6%D0%B0%D0%BD%D1%8B_%D0%B2_%D0%BA%D0%B8%D1%81%D0%BB%D0%BE%D1%81%D0%BB%D0%B0%D0%B4%D0%BA%D0%BE%D0%BC/754b00af2672aa786189b696fd48f443.JPG',
      modificators: [],
    },
    {
      id: 500,
      productName: 'Балканская плескавица',
      productPrice: 1300,
      productPhoto:
        'https://imenu.kg/media/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0.jpg',
      productPhotoSmall:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0/3114eb221a5c72c30af6a598dc52aae6.jpg',
      productPhotoLarge:
        'https://imenu.kg/media/CACHE/images/menu/products/2025/09/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F_%D0%BF%D0%BB%D0%B5%D1%81%D0%BA%D0%B0%D0%B2%D0%B8%D1%86%D0%B0/b84e552fd341fa51211d87886baad36a.jpg',
      modificators: [],
    },
  ];

  const items: CartItem[] = mockProducts.slice(0, 5).map((p) => {
    const mod = p.modificators?.[0];
    const unitPrice = p.productPrice > 0 ? p.productPrice : mod?.price ?? 0;
    const modifierId = mod?.id ?? null;
    const modifierName = mod?.name;
    const image =
      p.productPhotoSmall || p.productPhoto || p.productPhotoLarge || undefined;
    return {
      key: `${p.id},${modifierId ?? 0}`,
      productId: p.id,
      modifierId,
      name: p.productName,
      modifierName,
      unitPrice,
      quantity: 1,
      image,
    };
  });

  return (
    <div className='bg-[#F8F6F7] min-h-svh pb-40'>
      <Header />
      <CurrentStatus />
      <div className=' px-4 pt-3'>
        <div className='bg-white rounded-[30px] p-3'>
          <div className='flex justify-between items-center'>
            <span className='font-semibold text-lg'>Мои заказы</span>
            <span className='text-[#727272] text-sm'>3 заказа</span>
          </div>
          <div className='content'>
            <ul className='divide-y mt-3 divide-[#E7E7E7]'>
              {items.map((it) => (
                <Item key={it.key} it={it} statusMode />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusView;

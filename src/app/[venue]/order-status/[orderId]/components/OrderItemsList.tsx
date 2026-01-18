'use client';

import { OrderProduct } from '@/lib/order';
import Image from 'next/image';

export default function OrderItemsList({ items }: { items: OrderProduct[] }) {
  return (
    <div className='bg-white rounded-[30px] p-5 shadow-sm'>
      <h3 className='font-bold text-lg mb-4 flex justify-between items-center'>
        Ваш заказ
        <span className='text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-lg'>
          {items.length} поз.
        </span>
      </h3>

      <ul className='divide-y divide-gray-100'>
        {items.map((item) => {
          const product = item.product;
          const image = product.productPhotoSmall || product.productPhoto;

          return (
            <li
              key={`${item.id}-${item.modificator}`}
              className='py-3 flex gap-3'
            >
              {/* Фото */}
              <div className='relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100'>
                {image ? (
                  <Image
                    src={image}
                    alt={product.productName}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-xl'>
                    🍔
                  </div>
                )}
              </div>

              {/* Инфо */}
              <div className='flex-1 flex flex-col justify-center'>
                <p className='text-sm font-bold line-clamp-2 leading-tight'>
                  {product.productName}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  {Number(item.price)} с. x {item.count} шт.
                </p>
              </div>

              {/* Цена */}
              <div className='flex flex-col justify-center items-end'>
                <span className='font-bold text-brand'>
                  {Number(item.price) * item.count} с.
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

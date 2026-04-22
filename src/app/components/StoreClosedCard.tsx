import { getTranslations } from 'next-intl/server';
import ClosedStoreIllustration from './illustrations/ClosedStoreIllustration';

interface Props {
  scheduleMessage?: string;
  brandColor?: string;
}

const StoreClosedCard = async ({
  scheduleMessage,
  brandColor = '#FF9900'
}: Props) => {
  const t = await getTranslations('StoreClosed');
  const message = scheduleMessage ?? t('defaultMessage');
  return (
    <div className='bg-white rounded-3xl p-6 text-center shadow-sm mt-2 mb-3'>
      <div className='relative w-50 h-50 mx-auto mb-4'>
        <ClosedStoreIllustration color={brandColor} className="w-full h-full" />
      </div>

      <h2 className='text-xl font-bold text-[#21201f] mb-2'>
        {t('title')}
      </h2>

      <p className='text-gray-500 text-sm mb-6'>{message}</p>
    </div>
  );
};

export default StoreClosedCard;

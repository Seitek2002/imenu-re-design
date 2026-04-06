export default function VenueLoading() {
  return (
    <main className='home px-2.5 bg-[#F8F6F7] min-h-svh pb-32'>
      {/* 1. Скелетон MainHeader */}
      <header className='header-main sticky top-0 z-30 flex justify-between items-center px-4 py-4 rounded-b-4xl bg-white shadow-sm'>
        <div className='header-left flex items-center shrink-0 w-[65%]'>
          {/* Логотип */}
          <div className='w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0' />

          {/* Тексты названия */}
          <div className='flex flex-col ml-2 gap-1.5 w-full'>
            <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse' />
            <div className='h-2.5 bg-gray-200 rounded w-1/2 animate-pulse' />
          </div>
        </div>

        {/* Правые кнопки (Wi-Fi и Язык) */}
        <div className='flex gap-2 shrink-0'>
          <div className='w-10 h-10 rounded-[14px] bg-[#FAFAFA] animate-pulse' />
          <div className='w-12 h-10 rounded-[14px] bg-[#FAFAFA] animate-pulse' />
        </div>
      </header>

      {/* 2. Скелетон HomeLinksSection */}
      <div className='home-links bg-white mt-2 rounded-4xl p-4'>
        {/* Первый ряд (2 приоритетные кнопки) */}
        <div className='grid grid-cols-2 gap-3 mb-3'>
          <div className='h-30 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-30 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>

        {/* Второй ряд (3 кнопки) */}
        <div className='grid grid-cols-3 gap-3 mb-3'>
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>

        {/* Третий ряд (3 кнопки) */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>
      </div>

      {/* 3. Скелетон Widgets */}
      <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-hidden'>
        {/* Статус заказа / Мои заказы */}
        <div className='bg-[#FAFAFA] rounded-3xl min-w-30 h-29 animate-pulse flex-1' />
        {/* Бонусные баллы */}
        <div className='bg-[#FAFAFA] rounded-3xl min-w-35 h-29 animate-pulse flex-1' />
        {/* График */}
        <div className='bg-[#FAFAFA] rounded-3xl min-w-30 h-29 animate-pulse flex-1' />
      </div>
    </main>
  );
}

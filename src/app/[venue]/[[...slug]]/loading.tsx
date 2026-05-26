export default function VenueLoading() {
  return (
    <main className='home px-2.5 bg-[#F8F6F7] min-h-svh pb-36'>
      <div className='px-4 pt-3 pb-1'>
        <div className='h-2.5 w-32 bg-[#FAFAFA] rounded animate-pulse' />
      </div>
      <header className='header-main relative z-30 mx-1 mt-1 flex items-center justify-between gap-3 rounded-[22px] bg-white px-3.5 py-3 shadow-[0_1px_0_rgba(40,28,16,0.04),_0_8px_24px_-16px_rgba(40,28,16,0.10)]'>
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          <div className='h-10 w-10 shrink-0 rounded-full bg-gray-200 animate-pulse' />
          <div className='flex min-w-0 flex-col gap-1.5'>
            <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
            <div className='h-2.5 w-20 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <div className='h-9 w-9 rounded-[14px] bg-[#FAFAFA] animate-pulse' />
          <div className='h-9 w-12 rounded-[14px] bg-[#FAFAFA] animate-pulse' />
        </div>
      </header>

      <div className='home-links bg-white mt-2 rounded-4xl p-4'>
        <div className='grid grid-cols-2 gap-3 mb-3'>
          <div className='h-30 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-30 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>
        <div className='grid grid-cols-3 gap-3 mb-3'>
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>
        <div className='grid grid-cols-3 gap-3'>
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
          <div className='h-25 bg-[#FAFAFA] rounded-3xl animate-pulse' />
        </div>
      </div>

      <div className='mx-3 mt-2 flex flex-col gap-2'>
        <div className='h-44 bg-white rounded-[22px] animate-pulse' />
        <div className='grid grid-cols-2 gap-2.5'>
          <div className='h-24 bg-white rounded-[18px] animate-pulse' />
          <div className='h-24 bg-white rounded-[18px] animate-pulse' />
        </div>
      </div>
    </main>
  );
}

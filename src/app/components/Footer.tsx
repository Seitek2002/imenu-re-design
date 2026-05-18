import Nav from './Nav';

export default function Footer({ venueSlug }: { venueSlug: string }) {
  return (
    <footer className='fixed bottom-0 lg:bottom-4 left-0 right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 z-50 flex flex-col items-center max-w-175 mx-auto lg:max-w-none lg:mx-0 lg:w-fit bg-white border-t border-[#E5E7EB] lg:border-t-0 lg:border lg:border-black/5 lg:rounded-full lg:shadow-2xl pb-[env(safe-area-inset-bottom)] lg:pb-0'>
      <Nav venueSlug={venueSlug} />
    </footer>
  );
}

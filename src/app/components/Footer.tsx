import Nav from './Nav';

export default function Footer({ venueSlug }: { venueSlug: string }) {
  return (
    <footer className='fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center max-w-175 mx-auto bg-white border-t border-[#E5E7EB] pb-[env(safe-area-inset-bottom)]'>
      <Nav venueSlug={venueSlug} />
    </footer>
  );
}

import Footer from './[venue]/_components/Footer/Footer';

export default function VenueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}

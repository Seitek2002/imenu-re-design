import Header from '../../_components/Header';
import Content from './_components/Content';

type PageProps = {
  searchParams?: {
    title?: string;
  };
};

const FoodsPage = ({ searchParams }: PageProps) => {
  const title = (searchParams?.title ?? 'Разделы') as string;

  return (
    <main className='px-2.5 min-h-svh'>
      <Header title={title} />
      <Content />
    </main>
  );
};

export default FoodsPage;

import Header from '../../_components/Header';
import Content from './_components/Content';

type PageProps = {
  searchParams?: Promise<{
    title?: string;
  }>;
};

const FoodsPage = async ({ searchParams }: PageProps) => {
  const sp = (await searchParams) ?? {};
  const title = (sp.title ?? 'Разделы') as string;

  return (
    <main className='px-2.5 min-h-svh'>
      <Header title={title} />
      <Content />
    </main>
  );
};

export default FoodsPage;

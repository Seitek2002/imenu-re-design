'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ActiveLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`${className} ${
        isActive ? 'text-black font-medium' : 'opacity-70'
      }`}
      prefetch={true}
    >
      {children}
    </Link>
  );
}

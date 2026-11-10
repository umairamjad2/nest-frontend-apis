import Link from 'next/link';

// Shown for any URL that doesn't match a page.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3 px-4 py-16">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-sm font-medium underline-offset-4 hover:underline">
        Go home
      </Link>
    </main>
  );
}

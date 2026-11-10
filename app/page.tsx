import { HomeActions } from '@/components/home-actions';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">NestJS Auth</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Register, verify your email, and log in. Built with Next.js on top of the nestjs-learning backend.
        </p>
      </div>
      <HomeActions />
    </main>
  );
}

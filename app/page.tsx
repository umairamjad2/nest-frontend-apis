import { AuthStatus } from '@/components/auth-status';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">NestJS Auth</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Frontend for the nestjs-learning backend. Use the links above to register or log in.
        </p>
      </div>
      <AuthStatus />
    </main>
  );
}

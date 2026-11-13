import { HomeActions } from '@/components/home-actions';
import { homeContent } from '@/content/home';

export default function Home() {
  const { badge, title, description, highlights, preview } = homeContent;
  const doneCount = preview.tasks.filter((task) => task.done).length;

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <section>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text sm:text-sm">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />
          {badge}
        </span>

        <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold sm:text-6xl lg:text-7xl">
          {title.line}
          <span className="text-brand-gradient block pb-1">{title.highlight}</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400">
          {description}
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">{item.label}</dt>
              <dd className="font-display text-2xl font-bold text-brand-text">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10">
          <HomeActions />
        </div>
      </section>

      {/* Decorative preview of the tasks page */}
      <div aria-hidden className="relative hidden lg:block">
        <div className="absolute -inset-10 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold">{preview.title}</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-text">
              {doneCount} of {preview.tasks.length} done
            </span>
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {preview.tasks.map((task) => (
              <li
                key={task.title}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                    task.done ? 'border-brand bg-brand text-brand-foreground' : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {task.done && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </span>
                <span className={`flex-1 text-sm ${task.done ? 'text-zinc-400 line-through' : ''}`}>{task.title}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    task.priority === 'High'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute -top-5 -right-4 rotate-3 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {preview.floatingTag}
        </div>
      </div>
    </main>
  );
}

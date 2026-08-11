export default function AdminLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950">
      <div className="mx-auto max-w-7xl animate-pulse px-6 py-10"><div className="h-5 w-48 rounded bg-slate-800" /><div className="mt-5 h-10 w-2/3 rounded bg-slate-800" /><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-36 rounded-2xl bg-slate-900" />)}</div><div className="mt-8 h-80 rounded-2xl bg-slate-900" /></div>
    </div>
  );
}

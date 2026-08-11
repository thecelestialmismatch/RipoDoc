export default function SecurityLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-slate-950"><div className="mx-auto max-w-7xl animate-pulse px-6 py-14"><div className="h-5 w-32 rounded bg-slate-800" /><div className="mt-5 h-12 w-2/3 rounded bg-slate-800" /><div className="mt-4 h-5 w-full max-w-2xl rounded bg-slate-800" /></div></div>
      <div className="mx-auto max-w-7xl animate-pulse px-6 py-10"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-52 rounded-2xl border border-slate-200 bg-white" />)}</div><div className="mt-10 h-80 rounded-2xl border border-slate-200 bg-white" /></div>
    </div>
  );
}

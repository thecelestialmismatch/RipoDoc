export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl animate-pulse px-6 py-12">
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="mt-5 h-10 w-2/3 max-w-xl rounded bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-2xl rounded bg-slate-100" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-36 rounded-2xl border border-slate-200 bg-white" />)}
        </div>
        <div className="mt-10 h-96 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-56 rounded bg-muted" />

        <div className="rounded-lg border bg-card p-4">
          <div className="h-6 w-40 rounded bg-muted mb-4" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-6 w-72 rounded bg-muted" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="h-6 w-64 rounded bg-muted mb-4" />
          <div className="h-96 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}


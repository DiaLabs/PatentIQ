export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  loading,
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-50">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-20 animate-pulse rounded-md bg-gray-100 mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
      {trend && !loading && (
        <p className="mt-1.5 text-xs font-medium text-emerald-600">{trend}</p>
      )}
    </div>
  );
}

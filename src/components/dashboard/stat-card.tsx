import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function StatCard({
  title,
  value,
  description,
  icon,
  iconBackground = "bg-indigo-50",
  trend,
  trendPercentage,
  loading,
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  iconBackground?: string;
  trend?: string;
  trendPercentage?: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Top Row: Icon + Title (Inline) */}
      <div className="flex items-center gap-4 mb-4">
        {/* Circular Icon */}
        <div className={`h-14 w-14 flex items-center justify-center rounded-full ${iconBackground} flex-shrink-0`}>
          {icon}
        </div>
        {/* Title */}
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>

      {/* Value - Big Number */}
      {loading ? (
        <div className="h-12 w-20 animate-pulse rounded-md bg-gray-100 mb-4" />
      ) : (
        <p className="text-4xl font-bold text-gray-900 mb-4">{value}</p>
      )}

      {/* Trend Indicator */}
      {(trendPercentage || trend) && !loading && (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600">
            {trendPercentage ? `${trendPercentage} from last month` : trend}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function StatsCard({ title, stats, description = "", Icon }) {
  const overdueStyle = title === "Overdue Books" ? "text-red-600" : "";
  return (
    <div className="rounded-lg border border-gray-200 bg-white text-card-foreground shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="font-semibold whitespace-nowrap truncate">
          {title}
        </span>
        <span className={`text-right ${overdueStyle}`}>
          <Icon className="w-4 h-4 " />
        </span>
      </div>
      <div className="p-6 pt-0">
        <div className={`text-2xl font-bold ${overdueStyle}`}>{stats}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

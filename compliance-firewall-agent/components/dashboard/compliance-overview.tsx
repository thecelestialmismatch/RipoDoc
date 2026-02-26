"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Activity,
  RefreshCw,
  Zap,
} from "lucide-react";

interface Stats {
  total_events: number;
  blocked: number;
  quarantined: number;
  allowed: number;
  critical: number;
}

const STAT_CARDS = [
  {
    key: "total_events" as const,
    label: "Total Events",
    icon: ShieldCheck,
    iconBg: "bg-brand-500/10",
    iconColor: "text-brand-400",
    valueColor: "text-white",
    gradient: "from-brand-500/10 to-transparent",
  },
  {
    key: "blocked" as const,
    label: "Blocked",
    icon: ShieldAlert,
    iconBg: "bg-danger-muted",
    iconColor: "text-danger",
    valueColor: "text-danger",
    gradient: "from-danger/10 to-transparent",
  },
  {
    key: "quarantined" as const,
    label: "Quarantined",
    icon: Clock,
    iconBg: "bg-warning-muted",
    iconColor: "text-warning",
    valueColor: "text-warning",
    gradient: "from-warning/10 to-transparent",
  },
  {
    key: "allowed" as const,
    label: "Allowed",
    icon: CheckCircle,
    iconBg: "bg-success-muted",
    iconColor: "text-success",
    valueColor: "text-success",
    gradient: "from-success/10 to-transparent",
  },
  {
    key: "critical" as const,
    label: "Critical",
    icon: AlertTriangle,
    iconBg: "bg-danger-muted",
    iconColor: "text-danger",
    valueColor: "text-danger",
    gradient: "from-danger/10 to-transparent",
  },
];

function AnimatedValue({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    const diff = target - from;
    if (diff === 0) return;
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    prevTarget.current = target;
  }, [target]);

  return <>{display}</>;
}

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-white/10">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function ThreatChart({ events }: { events: any[] }) {
  const now = Date.now();
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const hourStart = now - (11 - i) * 3600000;
    const hourEnd = hourStart + 3600000;
    const hourEvents = events.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= hourStart && t < hourEnd;
    });
    return {
      hour: new Date(hourStart).toLocaleTimeString([], { hour: "2-digit" }),
      total: hourEvents.length,
      blocked: hourEvents.filter((e: any) => e.action_taken === "BLOCKED").length,
      allowed: hourEvents.filter((e: any) => e.action_taken === "ALLOWED").length,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white font-heading">Threat Activity</h3>
          <p className="text-[11px] text-white/30">Last 12 hours</p>
        </div>
        <Activity className="w-4 h-4 text-brand-400" />
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              width={30}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              dataKey="blocked"
              name="Blocked"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorBlocked)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-white/30">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" />Total</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" />Blocked</div>
      </div>
    </motion.div>
  );
}

function RecentThreats({ events }: { events: any[] }) {
  const threats = events
    .filter((e: any) => e.risk_level === "CRITICAL" || e.risk_level === "HIGH")
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white font-heading">Recent Threats</h3>
          <p className="text-[11px] text-white/30">Critical & high risk events</p>
        </div>
        <ShieldAlert className="w-4 h-4 text-danger" />
      </div>
      <div className="space-y-3">
        {threats.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-4">No recent threats</p>
        ) : (
          threats.map((event: any) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                event.risk_level === "CRITICAL" ? "bg-danger" : "bg-warning"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 truncate">{event.user_id}</p>
                <p className="text-[10px] text-white/30">
                  {event.classifications.join(", ")} - {event.destination_provider}
                </p>
              </div>
              <span className={`badge text-[10px] ${
                event.action_taken === "BLOCKED"
                  ? "bg-danger-muted text-danger"
                  : "bg-warning-muted text-warning"
              }`}>
                {event.action_taken}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

function ProviderBreakdown({ events }: { events: any[] }) {
  const providers = events.reduce((acc: Record<string, number>, e: any) => {
    const p = e.destination_provider || "Unknown";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(providers)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white font-heading">Provider Breakdown</h3>
          <p className="text-[11px] text-white/30">Requests by AI provider</p>
        </div>
        <Zap className="w-4 h-4 text-brand-400" />
      </div>
      {pieData.length > 0 ? (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[180px] flex items-center justify-center text-white/30 text-sm">
          No data to display
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {pieData.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[10px] text-white/40">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-12 h-4 rounded bg-white/5" />
      </div>
      <div className="w-16 h-8 rounded bg-white/5 mb-1" />
      <div className="w-20 h-3 rounded bg-white/5" />
    </div>
  );
}

export function ComplianceOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/compliance/events?limit=200");
      const data = await res.json();
      const evts = data.events ?? [];
      setEvents(evts);
      setStats({
        total_events: data.total ?? evts.length,
        blocked: evts.filter((e: any) => e.action_taken === "BLOCKED").length,
        quarantined: evts.filter((e: any) => e.action_taken === "QUARANTINED").length,
        allowed: evts.filter((e: any) => e.action_taken === "ALLOWED").length,
        critical: evts.filter((e: any) => e.risk_level === "CRITICAL").length,
      });
      setLastUpdated(new Date());
    } catch {
      setStats({ total_events: 0, blocked: 0, quarantined: 0, allowed: 0, critical: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Compliance Overview</h2>
          {lastUpdated && (
            <p className="text-[11px] text-white/25 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdated.toLocaleTimeString()}
              <span className="text-white/15"> | Auto-refreshes every 30s</span>
            </p>
          )}
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card, index) => {
          const Icon = card.icon;
          const value = stats?.[card.key] ?? 0;
          const total = stats?.total_events ?? 1;
          const percentage = card.key === "total_events" ? 100 : Math.round((value / total) * 100);
          const isGood = card.key === "allowed" || (card.key === "critical" && value === 0);
          const TrendIcon = isGood ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-5 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  {card.key !== "total_events" && (
                    <div className={`flex items-center gap-1 text-xs ${isGood ? "text-success" : "text-white/30"}`}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{percentage}%</span>
                    </div>
                  )}
                </div>
                <p className={`text-2xl font-bold font-heading ${card.valueColor} counter-value`}>
                  <AnimatedValue target={value} />
                </p>
                <p className="text-xs text-white/40 mt-1">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ThreatChart events={events} />
        <RecentThreats events={events} />
        <ProviderBreakdown events={events} />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <a
            href={`/api/reports/generate?from=${new Date(Date.now() - 7 * 86400000).toISOString()}&to=${new Date().toISOString()}`}
            target="_blank"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Weekly Report
          </a>
          <a
            href={`/api/reports/generate?from=${new Date(Date.now() - 30 * 86400000).toISOString()}&to=${new Date().toISOString()}`}
            target="_blank"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Monthly Report
          </a>
          <a href="/api/health" target="_blank" className="btn-ghost inline-flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health Check
          </a>
        </div>
      </div>
    </div>
  );
}

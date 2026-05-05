import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardMockup() {
  return (
    <div className="relative">
      {/* Dashboard Container — overflows right edge */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-200/60 lg:w-[700px]">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-36 shrink-0 border-r border-gray-100 p-3 pt-4">
            {/* Logo */}
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-900">PatentIQ</span>
            </div>

            {/* Nav Items */}
            <nav className="space-y-0.5">
              <SidebarItem
                icon={<LayoutDashboard className="h-3.5 w-3.5" />}
                label="Overview"
                active
              />
              <SidebarItem
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Submissions"
              />
              <SidebarItem
                icon={<Users className="h-3.5 w-3.5" />}
                label="Groups"
              />
              <div className="!my-2" />
              <SidebarItem
                icon={<Scale className="h-3.5 w-3.5" />}
                label="Evaluation Rules"
              />
              <SidebarItem
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                label="Reports"
              />
              <SidebarItem
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Analytics"
              />
              <div className="!my-2" />
              <SidebarItem
                icon={<Settings className="h-3.5 w-3.5" />}
                label="Settings"
              />
            </nav>

            {/* User */}
            <div className="mt-6 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-violet-100 text-[8px] font-medium text-violet-700">
                  SW
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[10px] font-medium text-gray-900">
                  Dr. Sarah Wilson
                </p>
                <p className="text-[8px] text-gray-400">Mentor</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1 p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Dashboard</h2>
                <p className="text-[10px] text-gray-400">
                  Here&apos;s what&apos;s happening with your groups today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600">
                  All Groups
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
                <button className="relative">
                  <Bell className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-4 grid grid-cols-4 gap-2">
              <StatCard
                icon={
                  <FileText className="h-3 w-3 text-violet-600" />
                }
                iconBg="bg-violet-50"
                label="Total Submissions"
                value="128"
                change="↑ 12% from last month"
                changeColor="text-emerald-600"
              />
              <StatCard
                icon={
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                }
                iconBg="bg-emerald-50"
                label="Completed"
                value="96"
                change="↑ 8% from last month"
                changeColor="text-emerald-600"
              />
              <StatCard
                icon={
                  <Clock className="h-3 w-3 text-amber-600" />
                }
                iconBg="bg-amber-50"
                label="In Progress"
                value="24"
                change="↑ 8% from last month"
                changeColor="text-emerald-600"
              />
              <StatCard
                icon={
                  <AlertCircle className="h-3 w-3 text-red-500" />
                }
                iconBg="bg-red-50"
                label="Needs Review"
                value="8"
                change="↑ 2% from last month"
                changeColor="text-emerald-600"
              />
            </div>

            {/* Content Area */}
            <div className="flex gap-3">
              {/* Recent Submissions Table */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">
                    Recent Submissions
                  </h3>
                  <button className="text-[10px] font-medium text-violet-600 hover:text-violet-700">
                    View all
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-2 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Document
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Student
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Group
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Status
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Score
                        </th>
                        <th className="px-1.5 py-1.5 text-left text-[9px] font-medium text-gray-400">
                          Submitted
                        </th>
                        <th className="w-6 px-1 py-1.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableRow
                        doc="EcoDrive – Patent.docx"
                        student="Alice Johnson"
                        group="AI Innovators"
                        status="Completed"
                        statusColor="text-emerald-600 bg-emerald-50"
                        score="7.8/10"
                        time="2h ago"
                      />
                      <TableRow
                        doc="SmartAgri System.docx"
                        student="Bob Smith"
                        group="AgriTech Crew"
                        status="In Progress"
                        statusColor="text-amber-600 bg-amber-50"
                        score="–"
                        time="5h ago"
                      />
                      <TableRow
                        doc="NeuroCare Device.docx"
                        student="Charlie Brown"
                        group="MedTech Pioneers"
                        status="Completed"
                        statusColor="text-emerald-600 bg-emerald-50"
                        score="6.2/10"
                        time="1d ago"
                      />
                      <TableRow
                        doc="HydroGen Cell.docx"
                        student="Diana Prince"
                        group="Green Future"
                        status="Needs Review"
                        statusColor="text-red-500 bg-red-50"
                        score="4.5/10"
                        time="2d ago"
                      />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evaluation Pipeline */}
              <div className="w-40 shrink-0">
                <h3 className="mb-2 text-xs font-semibold text-gray-900">
                  Evaluation Pipeline
                </h3>
                <div className="space-y-2">
                  <PipelineItem
                    step={1}
                    label="Plagiarism Check"
                    status="Completed"
                    statusColor="text-emerald-600"
                    icon={
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    }
                  />
                  <PipelineItem
                    step={2}
                    label="Prior Art Search"
                    status="Completed"
                    statusColor="text-emerald-600"
                    icon={
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    }
                  />
                  <PipelineItem
                    step={3}
                    label="AI Analysis"
                    status="In Progress"
                    statusColor="text-amber-600"
                    icon={
                      <CircleDot className="h-3.5 w-3.5 text-amber-500" />
                    }
                  />
                  <PipelineItem
                    step={4}
                    label="Rule Evaluation"
                    status="Pending"
                    statusColor="text-gray-400"
                    icon={
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-200" />
                    }
                  />
                  <PipelineItem
                    step={5}
                    label="Report Generation"
                    status="Pending"
                    statusColor="text-gray-400"
                    icon={
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-200" />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  change,
  changeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change: string;
  changeColor: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-md ${iconBg}`}
        >
          {icon}
        </div>
        <span className="text-[8px] font-medium text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className={`mt-0.5 text-[8px] ${changeColor}`}>{change}</p>
    </div>
  );
}

function TableRow({
  doc,
  student,
  group,
  status,
  statusColor,
  score,
  time,
}: {
  doc: string;
  student: string;
  group: string;
  status: string;
  statusColor: string;
  score: string;
  time: string;
}) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-2 py-1.5">
        <div className="flex items-center gap-1">
          <FileText className="h-2.5 w-2.5 shrink-0 text-gray-300" />
          <span className="truncate text-[9px] font-medium text-gray-700">{doc}</span>
        </div>
      </td>
      <td className="px-1.5 py-1.5 text-[9px] text-gray-500">{student}</td>
      <td className="px-1.5 py-1.5 text-[9px] text-gray-500">{group}</td>
      <td className="px-1.5 py-1.5">
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-medium ${statusColor}`}
        >
          {status}
        </span>
      </td>
      <td className="px-1.5 py-1.5 text-[9px] font-medium text-gray-700">
        {score}
      </td>
      <td className="px-1.5 py-1.5 text-[9px] text-gray-400">{time}</td>
      <td className="px-1 py-1.5">
        <MoreHorizontal className="h-2.5 w-2.5 text-gray-300" />
      </td>
    </tr>
  );
}

function PipelineItem({
  step,
  label,
  status,
  statusColor,
  icon,
}: {
  step: number;
  label: string;
  status: string;
  statusColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-medium text-gray-700">
          {step}. {label}
        </p>
      </div>
      <span className={`shrink-0 text-[8px] font-medium ${statusColor}`}>{status}</span>
    </div>
  );
}

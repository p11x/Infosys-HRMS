import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ref, onValue, push } from "firebase/database";
import { db } from "../../firebase/config";
import { useSession } from "../../hooks/useSession";
import {
  LayoutDashboard,
  User,
  BookOpen,
  FileText,
  CreditCard,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  CheckSquare,
  LogOut,
  Bell,
  ChevronRight,
  Settings,
  HelpCircle,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Megaphone,
  Users,
  Search,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "high" | "medium" | "low";
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  date: string;
  userId: string;
}

interface LeaveBalance {
  total: number;
  used: number;
  pending: number;
}

interface Employee {
  uid: string
  name: string
  email: string
  phone?: string
  birthday?: string
  profilePhoto?: string
}

interface LeaveRequest {
  leaveId: string;
  uid: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
}

interface AttendanceRecord {
  status?: "not_started" | "checked_in" | "checked_out"
  checkInTime?: string
  checkOutTime?: string
}

const SECTIONS = [
  {
    id: "personal",
    label: "Personal Details",
    subtitle: "Name, phone, address & more",
    icon: User,
    route: "/employee/personal-details",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    tag: "Identity",
    key: "personal",
  },
  {
    id: "education",
    label: "Education",
    subtitle: "Degrees & qualifications",
    icon: BookOpen,
    route: "/employee/education",
    color: "#15803D",
    bg: "#DCFCE7",
    tag: "Academic",
    key: "education",
  },
  {
    id: "documents",
    label: "Documents",
    subtitle: "Aadhaar, PAN, Resume & photo",
    icon: FileText,
    route: "/employee/documents",
    color: "#B45309",
    bg: "#FEF3C7",
    tag: "Upload",
    key: "documents",
  },
  {
    id: "bank",
    label: "Bank Details",
    subtitle: "Account & IFSC information",
    icon: CreditCard,
    route: "/employee/bank-details",
    color: "#7C3AED",
    bg: "#EDE9FE",
    tag: "Finance",
    key: "bank",
  },
  {
    id: "offer",
    label: "Offer Letter",
    subtitle: "View your employment offer",
    icon: Mail,
    route: "/employee/offer-letter",
    color: "#007CC2",
    bg: "#EFF6FF",
    tag: "Contract",
    key: null,
  },
  {
    id: "payslip",
    label: "Payslip",
    subtitle: "Monthly salary statements",
    icon: DollarSign,
    route: "/employee/payslip",
    color: "#059669",
    bg: "#ECFDF5",
    tag: "Finance",
    key: null,
  },
  {
    id: "apply-leave",
    label: "Apply Leave",
    subtitle: "Submit a leave request",
    icon: Calendar,
    route: "/employee/apply-leave",
    color: "#D97706",
    bg: "#FFFBEB",
    tag: "HR",
    key: null,
  },
  {
    id: "leave-status",
    label: "Leave Status",
    subtitle: "Track your requests",
    icon: Clock,
    route: "/employee/leave-status",
    color: "#CA8A04",
    bg: "#FEF9C3",
    tag: "HR",
    key: null,
  },
  {
    id: "attendance",
    label: "Attendance",
    subtitle: "Mark today's attendance",
    icon: CheckSquare,
    route: "/employee/attendance",
    color: "#047857",
    bg: "#ECFDF5",
    tag: "Daily",
    key: null,
  },
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "holidays", label: "Holidays", icon: Calendar },
  { id: "directory", label: "Directory", icon: Users },
  { id: "support", label: "Support", icon: Megaphone },
  { id: "personal", label: "Personal Details", icon: User },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "bank", label: "Bank Details", icon: CreditCard },
  { id: "leave", label: "Leave", icon: Calendar },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { uid, name, email, clearSession } = useSession();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [empData, setEmpData] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendanceToday, setAttendanceToday] =
    useState<AttendanceRecord | null>(null);
  const [completion, setCompletion] = useState(0);
  const [steps, setSteps] = useState({
    personal: false,
    education: false,
    bank: false,
    documents: false,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    total: 24,
    used: 0,
    pending: 0,
  });
  const [notifSearch, setNotifSearch] = useState("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

  const today = new Date().toISOString().split("T")[0];
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firstName = (name || "Employee").split(" ")[0];
  const initials = (name || "E")
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!uid) return;

    // Employee profile
    const u1 = onValue(ref(db, `Employees/${uid}`), (snap) => {
      const d = snap.exists() ? snap.val() : {};
      setEmpData(d);
      const s = {
        personal: !!(d.name && d.phone && d.email),
        education: !!d.Education,
        bank: !!d.BankDetails,
        documents: !!d.Documents,
      };
      setSteps(s);
      setCompletion(Object.values(s).filter(Boolean).length * 25);
    }, (err) => console.error('[DashboardPage] Employees read error:', err));

    // Leave requests
    const u2 = onValue(ref(db, "LeaveRequests"), (snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      const list = Object.keys(d)
        .map((id) => ({ ...d[id], leaveId: id }))
        .filter((l) => l.uid === uid) as LeaveRequest[];
      setLeaves(list);
      setLeaveBalance((prev) => ({
        ...prev,
        pending: list.filter((l) => l.status === "Pending").length,
      }));
    }, (err) => console.error('[DashboardPage] LeaveRequests read error:', err));

    // Today's attendance
    const u3 = onValue(ref(db, `Attendance/${uid}/${today}`), (snap) => {
      setAttendanceToday(
        snap.exists() ? (snap.val() as AttendanceRecord) : null,
      );
    }, (err) => {
      console.error('[DashboardPage] Attendance read error:', err)
      setAttendanceToday(null)
    });

    // Announcements
    const u4 = onValue(ref(db, "Announcements"), (snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      setAnnouncements(
        Object.keys(d).map((id) => ({ ...d[id], id })) as Announcement[],
      );
    }, (err) => console.error('[DashboardPage] Announcements read error:', err));

    // Holidays
    const u5 = onValue(ref(db, "Holidays"), (snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      setHolidays(Object.keys(d).map((id) => ({ ...d[id], id })) as Holiday[]);
    }, (err) => console.error('[DashboardPage] Holidays read error:', err));

    // Support Tickets
    const u6 = onValue(ref(db, "SupportTickets"), (snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      const list = Object.keys(d)
        .map((id) => ({ ...d[id], id }))
        .filter((t) => t.uid === uid) as SupportTicket[];
      setTickets(list);
    }, (err) => console.error('[DashboardPage] SupportTickets read error:', err));

    // All Employees for directory
    const u7 = onValue(ref(db, "Employees"), (snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      setAllEmployees(
        Object.keys(d).map((id) => ({ ...d[id], uid: id })) as Employee[],
      );
    }, (err) => {
      console.error('[DashboardPage] Employees list read error:', err)
      setAllEmployees([])
    });

    // Leave Balance
    const u8 = onValue(ref(db, `LeaveBalance/${uid}`), (snap) => {
      if (snap.exists()) {
        setLeaveBalance(snap.val() as LeaveBalance);
      }
    }, (err) => console.error('[DashboardPage] LeaveBalance read error:', err));

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
      u7();
      u8();
    };
  }, [uid]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleTicketSubmit = async () => {
    if (!uid || !ticketForm.subject || !ticketForm.message) {
      toast.error("Fill subject and message");
      return;
    }
    try {
      await push(ref(db, "SupportTickets"), {
        uid,
        name,
        subject: ticketForm.subject,
        message: ticketForm.message,
        status: "Open",
        createdAt: Date.now(),
      });
      setTicketForm({ subject: "", message: "" });
      toast.success("Ticket submitted");
    } catch {
      toast.error("Failed to submit ticket");
    }
  };

  const card = {
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1px solid #E8EDF2",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  };

  const navRoute: Record<string, string> = {
    personal: "/employee/personal-details",
    education: "/employee/education",
    documents: "/employee/documents",
    bank: "/employee/bank-details",
    leave: "/employee/apply-leave",
    attendance: "/employee/attendance",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F0F4F8",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ══ SIDEBAR ══ */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          backgroundColor: "#0F1C2E",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 30,
          boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#007CC2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Georgia,serif",
                  color: "white",
                  fontSize: "14px",
                }}
              >
                In
              </span>
            </div>
            <div>
              <p
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Infosys
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "10px",
                  margin: 0,
                  letterSpacing: "1px",
                }}
              >
                HRMS PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* Employee badge */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,124,194,0.15)",
              borderRadius: "10px",
              padding: "10px 12px",
              border: "1px solid rgba(0,124,194,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#007CC2",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }}
              >
                {empData?.profilePhoto ? (
                  <img
                    src={empData.profilePhoto}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "11px",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "700",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name || "Employee"}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "10px",
                    margin: 0,
                  }}
                >
                  Employee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              padding: "8px 10px 4px",
              margin: 0,
            }}
          >
            MY PORTAL
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (navRoute[item.id]) {
                    navigate(navRoute[item.id]);
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "2px",
                  backgroundColor: active
                    ? "rgba(0,124,194,0.25)"
                    : "transparent",
                  borderLeft: active
                    ? "3px solid #007CC2"
                    : "3px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon
                  size={17}
                  color={active ? "#38BDF8" : "rgba(255,255,255,0.55)"}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: active ? "700" : "400",
                    color: active ? "white" : "rgba(255,255,255,0.55)",
                    textAlign: "left",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "10px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {[
            { label: "Settings", icon: Settings },
            { label: "Help", icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Icon size={16} color="rgba(255,255,255,0.4)" />
                <span
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "rgba(239,68,68,0.1)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)")
            }
          >
            <LogOut size={16} color="#F87171" />
            <span
              style={{ fontSize: "12px", color: "#F87171", fontWeight: "600" }}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── TOPBAR ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            backgroundColor: "white",
            borderBottom: "1px solid #E8EDF2",
            padding: "0 28px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#0F1C2E",
                margin: 0,
              }}
            >
              Hello, {firstName} 👋
            </h1>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>
              {todayLabel}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Completion pill */}
            <div
              style={{
                backgroundColor: completion === 100 ? "#DCFCE7" : "#FEF3C7",
                color: completion === 100 ? "#15803D" : "#B45309",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                border: `1px solid ${completion === 100 ? "#86EFAC" : "#FCD34D"}`,
              }}
            >
              Profile {completion}% Complete
            </div>
            {/* Bell */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1.5px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={18} color="#64748B" />
              {leaves.filter((l) => l.status === "Pending").length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "#EF4444",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "700",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {leaves.filter((l) => l.status === "Pending").length}
                </span>
              )}
            </div>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#007CC2",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #BFDBFE",
                }}
              >
                {empData?.profilePhoto ? (
                  <img
                    src={empData.profilePhoto}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0F1C2E",
                    margin: 0,
                  }}
                >
                  {name || "Employee"}
                </p>
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ BODY ══ */}
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {/* ── KPI CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Profile Completion",
                value: `${completion}%`,
                icon: TrendingUp,
                color: "#007CC2",
                bg: "#EFF6FF",
                sub: `${Object.values(steps).filter(Boolean).length} of 4 sections`,
              },
              {
                label: "Leave Balance",
                value: `${leaveBalance.total - leaveBalance.used - leaveBalance.pending} / ${leaveBalance.total}`,
                icon: Calendar,
                color: "#059669",
                bg: "#ECFDF5",
                sub: `${leaveBalance.used} used, ${leaveBalance.pending} pending`,
                showProgress: true,
                progress:
                  ((leaveBalance.total -
                    leaveBalance.used -
                    leaveBalance.pending) /
                    leaveBalance.total) *
                  100,
              },
              {
                label: "Attendance Today",
                value:
                  attendanceToday?.status === "checked_out"
                    ? "Complete"
                    : attendanceToday?.status === "checked_in"
                      ? "In"
                      : "Not Marked",
                icon: CheckSquare,
                color:
                  attendanceToday?.status === "checked_out" || attendanceToday?.status === "checked_in"
                    ? "#059669"
                    : "#DC2626",
                bg:
                  attendanceToday?.status === "checked_out" || attendanceToday?.status === "checked_in"
                    ? "#ECFDF5"
                    : "#FEF2F2",
                sub:
                  attendanceToday?.status === "checked_out"
                    ? `${attendanceToday.checkInTime} → ${attendanceToday.checkOutTime}`
                    : attendanceToday?.status === "checked_in"
                      ? `In: ${attendanceToday.checkInTime}`
                      : "Tap to mark",
              },
              {
                label: "Account Status",
                value: "Active",
                icon: Shield,
                color: "#7C3AED",
                bg: "#F5F3FF",
                sub: "Onboarding in progress",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  style={{
                    ...card,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} color={s.color} />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#0F1C2E",
                        margin: "0 0 2px",
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748B",
                        margin: "0 0 4px",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}
                    >
                      {s.sub}
                    </p>
                    {s.showProgress && (
                      <div
                        style={{
                          height: "6px",
                          backgroundColor: "#F1F5F9",
                          borderRadius: "99px",
                          overflow: "hidden",
                          marginTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "99px",
                            width: `${s.progress}%`,
                            backgroundColor: "#059669",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ROW 2: Profile Completion Stepper + Leave Status ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {/* Profile Steps */}
            <div style={{ ...card, padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0F1C2E",
                    margin: 0,
                  }}
                >
                  Onboarding Progress
                </h3>
                <span
                  style={{
                    backgroundColor: completion === 100 ? "#DCFCE7" : "#FEF3C7",
                    color: completion === 100 ? "#15803D" : "#B45309",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {completion}%
                </span>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#F1F5F9",
                  borderRadius: "99px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "99px",
                    width: `${completion}%`,
                    background:
                      completion === 100
                        ? "#059669"
                        : "linear-gradient(90deg, #007CC2, #38BDF8)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              {/* Step items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  {
                    key: "personal",
                    label: "Personal Details",
                    route: "/employee/personal-details",
                    icon: User,
                  },
                  {
                    key: "education",
                    label: "Education",
                    route: "/employee/education",
                    icon: BookOpen,
                  },
                  {
                    key: "bank",
                    label: "Bank Details",
                    route: "/employee/bank-details",
                    icon: CreditCard,
                  },
                  {
                    key: "documents",
                    label: "Documents",
                    route: "/employee/documents",
                    icon: FileText,
                  },
                ].map((step) => {
                  const done = steps[step.key as keyof typeof steps];
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        backgroundColor: done ? "#F0FDF4" : "#F8FAFC",
                        border: `1px solid ${done ? "#86EFAC" : "#E2E8F0"}`,
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(step.route)}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: done ? "#007CC2" : "#E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={18} color="white" />
                        ) : (
                          <Icon size={15} color="#94A3B8" />
                        )}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          fontWeight: done ? "700" : "400",
                          color: done ? "#15803D" : "#64748B",
                        }}
                      >
                        {step.label}
                      </span>
                      {done ? (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#15803D",
                            backgroundColor: "#DCFCE7",
                            padding: "2px 8px",
                            borderRadius: "20px",
                          }}
                        >
                          Done
                        </span>
                      ) : (
                        <ArrowRight size={14} color="#CBD5E1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave Status */}
            <div style={{ ...card, padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0F1C2E",
                    margin: 0,
                  }}
                >
                  My Leave Requests
                </h3>
                <button
                  onClick={() => navigate("/employee/apply-leave")}
                  style={{
                    fontSize: "12px",
                    color: "#007CC2",
                    fontWeight: "600",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  + Apply <ChevronRight size={13} />
                </button>
              </div>
              {leaves.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <Calendar
                    size={36}
                    color="#E2E8F0"
                    style={{ margin: "0 auto 8px", display: "block" }}
                  />
                  <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>
                    No leave requests yet
                  </p>
                  <button
                    onClick={() => navigate("/employee/apply-leave")}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: "#EFF6FF",
                      color: "#007CC2",
                      border: "1px solid #BFDBFE",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {leaves.slice(0, 4).map((l) => (
                    <div
                      key={l.leaveId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#1A2B4A",
                            margin: "0 0 2px",
                          }}
                        >
                          {l.fromDate} → {l.toDate}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#94A3B8",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.reason}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "20px",
                          whiteSpace: "nowrap",
                          backgroundColor:
                            l.status === "Approved"
                              ? "#DCFCE7"
                              : l.status === "Rejected"
                                ? "#FEE2E2"
                                : "#FEF3C7",
                          color:
                            l.status === "Approved"
                              ? "#15803D"
                              : l.status === "Rejected"
                                ? "#DC2626"
                                : "#B45309",
                        }}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 3: Quick Actions + Attendance ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "16px",
            }}
          >
            {/* All Sections Grid */}
            <div style={{ ...card, padding: "20px" }}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0F1C2E",
                  margin: "0 0 16px",
                }}
              >
                All Sections
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const done = s.key
                    ? steps[s.key as keyof typeof steps]
                    : false;
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(s.route)}
                      style={{
                        backgroundColor: s.bg,
                        borderRadius: "12px",
                        padding: "14px 12px",
                        border: `1px solid ${s.color}20`,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${s.color}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Icon size={20} color={s.color} />
                        {done && <CheckCircle2 size={14} color="#15803D" />}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1A2B4A",
                            margin: "0 0 2px",
                            lineHeight: "1.2",
                          }}
                        >
                          {s.label}
                        </p>
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#94A3B8",
                            margin: 0,
                          }}
                        >
                          {s.tag}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance + Quick Actions */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Attendance card */}
              <div style={{ ...card, padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0F1C2E",
                    margin: "0 0 14px",
                  }}
                >
                  Today's Attendance
                </h3>
{attendanceToday?.status === "checked_out" &&
                   attendanceToday?.checkInTime ? (
                     <div
                       style={{
                         textAlign: "center",
                         padding: "16px",
                         backgroundColor: "#ECFDF5",
                         borderRadius: "12px",
                         border: "1px solid #86EFAC",
                       }}
                     >
                       <CheckCircle2
                         size={32}
                         color="#059669"
                         style={{ margin: "0 auto 8px", display: "block" }}
                       />
                       <p
                         style={{
                           fontWeight: "800",
                           fontSize: "16px",
                           color: "#059669",
                           margin: "0 0 4px",
                         }}
                       >
                         Day Complete
                       </p>
                       <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>
                         {attendanceToday.checkInTime} →{" "}
                         {attendanceToday.checkOutTime}
                       </p>
                     </div>
                   ) : attendanceToday?.status === "checked_in" ? (
                     <div
                       style={{
                         textAlign: "center",
                         padding: "16px",
                         backgroundColor: "#EFF6FF",
                         borderRadius: "12px",
                         border: "1px solid #BFDBFE",
                       }}
                     >
                       <Clock
                         size={32}
                         color="#007CC2"
                         style={{ margin: "0 auto 8px", display: "block" }}
                       />
                       <p
                         style={{
                           fontWeight: "800",
                           fontSize: "16px",
                           color: "#007CC2",
                           margin: "0 0 4px",
                         }}
                       >
                         Clocked In
                       </p>
                       <p style={{ fontSize: "12px", color: "#007CC2", margin: 0 }}>
                         Check-in: {attendanceToday.checkInTime}
                       </p>
                     </div>
                   ) : (
                     <div style={{ textAlign: "center" }}>
                       <AlertCircle
                         size={28}
                         color="#D97706"
                         style={{ margin: "0 auto 8px", display: "block" }}
                       />
                       <p
                         style={{
                           fontSize: "12px",
                           color: "#92400E",
                           margin: "0 0 12px",
                         }}
                       >
                         Not marked yet
                       </p>
                       <button
                         onClick={() => navigate("/employee/attendance")}
                         style={{
                           width: "100%",
                           padding: "10px",
                           borderRadius: "10px",
                           backgroundColor: "#007CC2",
                           color: "white",
                           border: "none",
                           fontSize: "13px",
                           fontWeight: "700",
                           cursor: "pointer",
                         }}
                       >
                         Mark Attendance
                       </button>
                     </div>
                   )}
              </div>

              {/* Quick links */}
              <div style={{ ...card, padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0F1C2E",
                    margin: "0 0 12px",
                  }}
                >
                  Quick Links
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    {
                      label: "View Offer Letter",
                      icon: Mail,
                      route: "/employee/offer-letter",
                      color: "#007CC2",
                    },
                    {
                      label: "Download Payslip",
                      icon: DollarSign,
                      route: "/employee/payslip",
                      color: "#059669",
                    },
                    {
                      label: "Leave Status",
                      icon: Clock,
                      route: "/employee/leave-status",
                      color: "#D97706",
                    },
                  ].map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(a.route)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #F1F5F9",
                          backgroundColor: "#F8FAFC",
                          cursor: "pointer",
                          width: "100%",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#BFDBFE")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#F1F5F9")
                        }
                      >
                        <Icon size={15} color={a.color} />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#1A2B4A",
                            flex: 1,
                            textAlign: "left",
                          }}
                        >
                          {a.label}
                        </span>
                        <ChevronRight size={13} color="#CBD5E1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeNav !== "dashboard" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ ...card, padding: "24px" }}>
              {activeNav === "notifications" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0F1C2E",
                        margin: 0,
                      }}
                    >
                      Notifications
                    </h3>
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        fontSize: "13px",
                        width: "240px",
                        outline: "none",
                      }}
                    />
                  </div>
                  {announcements.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Megaphone
                        size={40}
                        color="#E2E8F0"
                        style={{ margin: "0 auto 12px", display: "block" }}
                      />
                      <p
                        style={{
                          color: "#94A3B8",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        No announcements yet
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {announcements
                        .filter(
                          (a) =>
                            a.title
                              .toLowerCase()
                              .includes(notifSearch.toLowerCase()) ||
                            a.content
                              .toLowerCase()
                              .includes(notifSearch.toLowerCase()),
                        )
                        .map((a) => (
                          <div
                            key={a.id}
                            style={{
                              padding: "16px",
                              borderRadius: "12px",
                              backgroundColor:
                                a.priority === "high" ? "#FEF2F2" : "#F8FAFC",
                              border: `1px solid ${a.priority === "high" ? "#FECACA" : "#E2E8F0"}`,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <Megaphone
                                size={16}
                                color={
                                  a.priority === "high" ? "#DC2626" : "#007CC2"
                                }
                              />
                              <h4
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  color: "#1A2B4A",
                                  margin: 0,
                                }}
                              >
                                {a.title}
                              </h4>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  padding: "2px 8px",
                                  borderRadius: "20px",
                                  marginLeft: "auto",
                                  backgroundColor:
                                    a.priority === "high"
                                      ? "#FEE2E2"
                                      : "#EFF6FF",
                                  color:
                                    a.priority === "high"
                                      ? "#DC2626"
                                      : "#007CC2",
                                }}
                              >
                                {a.priority.toUpperCase()}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "13px",
                                color: "#64748B",
                                margin: "0 0 8px",
                                lineHeight: "1.5",
                              }}
                            >
                              {a.content}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#94A3B8",
                                margin: 0,
                              }}
                            >
                              {a.date}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeNav === "holidays" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#0F1C2E",
                      margin: "0 0 20px",
                    }}
                  >
                    Holiday Calendar
                  </h3>
                  {holidays.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Calendar
                        size={40}
                        color="#E2E8F0"
                        style={{ margin: "0 auto 12px", display: "block" }}
                      />
                      <p
                        style={{
                          color: "#94A3B8",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        No holidays configured
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "12px",
                      }}
                    >
                      {holidays.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            padding: "16px",
                            borderRadius: "12px",
                            backgroundColor: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#94A3B8",
                              margin: "0 0 4px",
                            }}
                          >
                            {h.day}
                          </p>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#0F1C2E",
                              margin: "0 0 4px",
                            }}
                          >
                            {h.name}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#007CC2",
                              margin: 0,
                            }}
                          >
                            {h.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeNav === "directory" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0F1C2E",
                        margin: 0,
                      }}
                    >
                      Company Directory
                    </h3>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        fontSize: "13px",
                        width: "240px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {allEmployees
                      .filter(
                        (e) =>
                          e.name
                            ?.toLowerCase()
                            .includes(notifSearch.toLowerCase()) ||
                          e.email
                            ?.toLowerCase()
                            .includes(notifSearch.toLowerCase()),
                      )
                      .map((e) => (
                        <div
                          key={e.uid}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #F1F5F9",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#007CC2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                color: "white",
                                fontWeight: "700",
                                fontSize: "12px",
                              }}
                            >
                              {e.name
                                ?.split(" ")
                                .map((x) => x[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "E"}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#1A2B4A",
                                margin: "0 0 2px",
                              }}
                            >
                              {e.name}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#64748B",
                                margin: 0,
                              }}
                            >
                              {e.email}
                            </p>
                          </div>
                          <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                            {e.phone || "-"}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeNav === "support" && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#0F1C2E",
                      margin: "0 0 20px",
                    }}
                  >
                    Support Tickets
                  </h3>
                  <div style={{ display: "flex", gap: "20px" }}>
                    {/* Ticket Form */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Subject"
                          value={ticketForm.subject}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              subject: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #E2E8F0",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                        <textarea
                          placeholder="Describe your issue..."
                          value={ticketForm.message}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              message: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #E2E8F0",
                            fontSize: "13px",
                            minHeight: "100px",
                            outline: "none",
                            resize: "vertical",
                          }}
                        />
                        <button
                          onClick={handleTicketSubmit}
                          style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            backgroundColor: "#007CC2",
                            color: "white",
                            border: "none",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Submit Ticket
                        </button>
                      </div>
                    </div>
                    {/* Ticket List */}
                    <div style={{ flex: 1 }}>
                      {tickets.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <Megaphone
                            size={40}
                            color="#E2E8F0"
                            style={{ margin: "0 auto 12px", display: "block" }}
                          />
                          <p
                            style={{
                              color: "#94A3B8",
                              fontSize: "14px",
                              margin: 0,
                            }}
                          >
                            No tickets yet
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            maxHeight: "280px",
                            overflowY: "auto",
                          }}
                        >
                          {tickets.map((t) => (
                            <div
                              key={t.id}
                              style={{
                                padding: "12px 16px",
                                borderRadius: "12px",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #F1F5F9",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  color: "#1A2B4A",
                                  margin: "0 0 6px",
                                }}
                              >
                                {t.subject}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#64748B",
                                  margin: "0 0 8px",
                                  lineHeight: "1.4",
                                }}
                              >
                                {t.message}
                              </p>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  padding: "3px 8px",
                                  borderRadius: "20px",
                                  backgroundColor:
                                    t.status === "Resolved"
                                      ? "#DCFCE7"
                                      : t.status === "In Progress"
                                        ? "#FEF3C7"
                                        : "#EFF6FF",
                                  color:
                                    t.status === "Resolved"
                                      ? "#15803D"
                                      : t.status === "In Progress"
                                        ? "#B45309"
                                        : "#007CC2",
                                }}
                              >
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
</div>
        )}
      </div>
    </div>
  );
}

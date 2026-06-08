import {
  LayoutDashboard,
  CalendarDays,
  CalendarClock,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileDown,
} from "lucide-react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  formatLong,
  nextDay,
  nextWeek,
  prevDay,
  prevWeek,
} from "../utils/dateUtils";

const VIEWS = [
  { id: "board", label: "Board", Icon: LayoutDashboard },
  { id: "week", label: "Semana", Icon: CalendarDays },
  { id: "day", label: "Día", Icon: CalendarClock },
];

export default function Header({
  view,
  onViewChange,
  onNewTask,
  onExportPdf,
  currentDate,
  onDateChange,
  userEmail,
  onSignOut,
  disableNewTask = false,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-3 py-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">TaskFlow</span>
        </div>

        <div className="ml-auto sm:order-3 sm:ml-0 flex items-center gap-2">
          {userEmail && (
            <span className="hidden md:inline text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg max-w-[180px] truncate">
              {userEmail}
            </span>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              title="Exportar tareas a PDF"
            >
              <FileDown size={15} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              title="Cerrar sesion"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
          <button
            onClick={onNewTask}
            disabled={disableNewTask}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            {disableNewTask ? "Solo lectura" : "Nueva tarea"}
          </button>
        </div>

        <nav className="order-3 w-full sm:order-2 sm:w-auto overflow-x-auto">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 min-w-max">
            {VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  view === id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {(view === "week" || view === "day") && (
          <div className="order-4 w-full sm:order-none sm:w-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() =>
                onDateChange(
                  view === "day" ? prevDay(currentDate) : prevWeek(currentDate),
                )
              }
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 flex-1 sm:flex-none sm:min-w-[170px] text-center capitalize px-1">
              {view === "week"
                ? `Semana del ${format(currentDate, "d MMM", { locale: es })}`
                : formatLong(currentDate)}
            </span>
            <button
              onClick={() =>
                onDateChange(
                  view === "day" ? nextDay(currentDate) : nextWeek(currentDate),
                )
              }
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Hoy
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  view: PropTypes.oneOf(["board", "week", "day"]).isRequired,
  onViewChange: PropTypes.func.isRequired,
  onNewTask: PropTypes.func.isRequired,
  onExportPdf: PropTypes.func,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
  userEmail: PropTypes.string,
  onSignOut: PropTypes.func,
  disableNewTask: PropTypes.bool,
};

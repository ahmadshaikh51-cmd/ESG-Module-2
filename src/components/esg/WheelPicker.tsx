import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Building2, CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ESG_GROUP, scopeLabel, type ScopeSel } from "@/lib/esg-data";
import { type DateRange, useEsg } from "./primitives";

export type WheelRow = { id: string; label: string; indent?: boolean };

const ITEM_H = 36;
const VISIBLE = 5;
const WHEEL_H = ITEM_H * VISIBLE;
const PAD = (WHEEL_H - ITEM_H) / 2;

/**
 * The scrollable dial itself — native scroll + CSS scroll-snap carries the
 * momentum and rubber-banding for free (real touch/trackpad physics beat a
 * hand-rolled drag simulation here). A short settle-debounce commits the
 * centred row; scroll position also drives live opacity/scale per row so
 * the stack reads as a physical wheel, not a plain list. Shared by the month
 * and scope selectors — anything backed by a flat, mutually-exclusive list.
 */
function Wheel({
  rows,
  value,
  onChange,
  align = "center",
}: {
  rows: WheelRow[];
  value: string;
  onChange: (id: string) => void;
  align?: "center" | "left";
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduce = useReducedMotion();
  const selectedIndex = Math.max(
    0,
    rows.findIndex((o) => o.id === value),
  );

  // Land on the current value the instant the wheel mounts — no animation to watch, just there.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_H;
    setScrollTop(selectedIndex * ITEM_H);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  const commit = (top: number, smooth = true) => {
    const idx = Math.min(rows.length - 1, Math.max(0, Math.round(top / ITEM_H)));
    scrollerRef.current?.scrollTo({
      top: idx * ITEM_H,
      behavior: smooth && !reduce ? "smooth" : "auto",
    });
    const row = rows[idx];
    if (row && row.id !== value) onChange(row.id);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => commit(el.scrollTop), 120);
  };

  return (
    <div className="relative select-none" style={{ height: WHEEL_H }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1.5 top-1/2 z-0 -translate-y-1/2 rounded-lg border border-primary/25 bg-primary/8"
        style={{ height: ITEM_H }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-9 bg-gradient-to-b from-popover to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-9 bg-gradient-to-t from-popover to-transparent"
      />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="listbox"
        aria-label="Select an option"
        aria-activedescendant={rows[selectedIndex]?.id}
        onKeyDown={(e) => {
          const el = scrollerRef.current;
          if (!el) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            commit(el.scrollTop + ITEM_H);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            commit(el.scrollTop - ITEM_H);
          } else if (e.key === "Enter") {
            e.preventDefault();
            clearTimeout(settleTimer.current);
            commit(el.scrollTop);
          }
        }}
        className="relative h-full overflow-y-auto outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: PAD }} aria-hidden />
        {rows.map((row, i) => {
          const distance = Math.abs(scrollTop / ITEM_H - i);
          const opacity = Math.max(0.3, 1 - distance * 0.4);
          const scale = Math.max(0.84, 1 - distance * 0.13);
          return (
            <button
              key={row.id}
              id={row.id}
              type="button"
              role="option"
              aria-selected={row.id === value}
              onClick={() => commit(i * ITEM_H)}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                opacity,
                transform: `scale(${scale})`,
              }}
              className={cn(
                "relative z-[1] flex w-full items-center truncate tracking-tight focus-visible:outline-none",
                align === "center"
                  ? "justify-center text-[14.5px] font-semibold"
                  : "justify-start px-4 text-[13.5px] font-semibold",
                row.indent && "pl-8 text-[12.5px] font-medium",
                row.id === value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {row.label}
            </button>
          );
        })}
        <div style={{ height: PAD }} aria-hidden />
      </div>
    </div>
  );
}

/**
 * Any flat, mutually-exclusive list as an iOS-style dial: the trigger just
 * shows the current value; clicking it opens a scroll wheel to spin to
 * another one.
 */
function WheelTrigger({
  open,
  triggerClassName,
  icon: Icon,
  label,
  ariaLabel,
  panelLabel,
  panelWidth,
  align,
  children,
}: {
  open: boolean;
  triggerClassName: string;
  icon: typeof CalendarDays;
  label: string;
  ariaLabel: string;
  panelLabel: string;
  panelWidth: number;
  align: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClassName} aria-label={ariaLabel}>
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="max-w-[190px] truncate">{label}</span>
          <ChevronDown
            className={cn("h-3 w-3 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={8}
        style={{ width: panelWidth }}
        className="rounded-xl border-border/60 p-2 shadow-elevated"
      >
        <div className="mb-1 px-1 text-center text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {panelLabel}
        </div>
        {children}
      </PopoverContent>
    </>
  );
}

export function MonthWheelPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (id: string) => void;
  options: WheelRow[];
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value)?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <WheelTrigger
        open={open}
        icon={CalendarDays}
        label={current}
        ariaLabel={`Reporting period: ${current}. Activate to change the month`}
        panelLabel="Reporting period"
        panelWidth={180}
        align="end"
        triggerClassName="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="max-h-[220px] overflow-y-auto pr-1 py-1 space-y-0.5 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40",
                  isSelected
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </WheelTrigger>
    </Popover>
  );
}

/* ---------------------------------- scope ---------------------------------- */

function scopeRows(): WheelRow[] {
  const rows: WheelRow[] = [{ id: "group", label: ESG_GROUP.name }];
  for (const e of ESG_GROUP.entities) {
    rows.push({ id: `entity:${e.id}`, label: e.name });
    for (const d of e.depots)
      rows.push({ id: `depot:${e.id}:${d.id}`, label: d.name, indent: true });
  }
  return rows;
}

function scopeRowId(scope: ScopeSel): string {
  if (!scope.entityId) return "group";
  if (!scope.depotId) return `entity:${scope.entityId}`;
  return `depot:${scope.entityId}:${scope.depotId}`;
}

function scopeFromRowId(id: string): ScopeSel {
  if (id.startsWith("depot:")) {
    const [, entityId, depotId] = id.split(":");
    return { entityId, depotId };
  }
  if (id.startsWith("entity:")) return { entityId: id.slice("entity:".length) };
  return {};
}

export function ScopeWheelPicker({
  scope,
  onChange,
}: {
  scope: ScopeSel;
  onChange: (s: ScopeSel) => void;
}) {
  const [open, setOpen] = useState(false);
  const rows = scopeRows();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <WheelTrigger
        open={open}
        icon={Building2}
        label={scopeLabel(scope)}
        ariaLabel={`Scope: ${scopeLabel(scope)}. Activate to change`}
        panelLabel="Scope"
        panelWidth={260}
        align="start"
        triggerClassName="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/8 px-2.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <Wheel
          rows={rows}
          value={scopeRowId(scope)}
          onChange={(id) => onChange(scopeFromRowId(id))}
          align="left"
        />
      </WheelTrigger>
    </Popover>
  );
}

/* --------------------------------- date range filter -------------------------------- */

const getPresetRange = (
  key: string,
  today = new Date("2026-07-15T09:00:00+05:30"),
): { start: Date; end: Date } => {
  const start = new Date(today);
  const end = new Date(today);

  switch (key) {
    case "today":
      return { start, end };
    case "yesterday":
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      return { start, end };
    case "last7":
      start.setDate(today.getDate() - 6);
      return { start, end };
    case "last30":
      start.setDate(today.getDate() - 29);
      return { start, end };
    case "thisMonth":
      start.setDate(1);
      end.setMonth(today.getMonth() + 1);
      end.setDate(0);
      return { start, end };
    case "prevMonth":
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end.setMonth(today.getMonth());
      end.setDate(0);
      return { start, end };
    case "thisQuarter": {
      const qStartMonth = Math.floor(today.getMonth() / 3) * 3;
      start.setMonth(qStartMonth);
      start.setDate(1);
      end.setMonth(qStartMonth + 3);
      end.setDate(0);
      return { start, end };
    }
    case "prevQuarter": {
      const qStartMonth = Math.floor(today.getMonth() / 3) * 3 - 3;
      start.setMonth(qStartMonth);
      start.setDate(1);
      end.setMonth(qStartMonth + 3);
      end.setDate(0);
      return { start, end };
    }
    case "thisYear":
      start.setMonth(0);
      start.setDate(1);
      end.setMonth(11);
      end.setDate(31);
      return { start, end };
    default:
      return { start, end };
  }
};

const formatRangeLabel = (start: Date, end: Date, presetKey?: string) => {
  const PRESETS: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 Days",
    last30: "Last 30 Days",
    thisMonth: "This Month",
    prevMonth: "Previous Month",
    thisQuarter: "This Quarter",
    prevQuarter: "Previous Quarter",
    thisYear: "This Year",
  };
  if (presetKey && PRESETS[presetKey]) {
    return PRESETS[presetKey];
  }
  const f = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  return `${f(start)} - ${f(end)}`;
};

function CalendarGrid({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDateClick,
  onDateHover,
}: {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const isSelected = (d: Date) => {
    if (startDate && d.toDateString() === startDate.toDateString()) return true;
    if (endDate && d.toDateString() === endDate.toDateString()) return true;
    return false;
  };

  const isInRange = (d: Date) => {
    if (!startDate) return false;
    const time = d.getTime();
    if (endDate) {
      return time > startDate.getTime() && time < endDate.getTime();
    }
    if (hoverDate) {
      const min = Math.min(startDate.getTime(), hoverDate.getTime());
      const max = Math.max(startDate.getTime(), hoverDate.getTime());
      return time > min && time < max;
    }
    return false;
  };

  return (
    <div className="w-[210px] select-none">
      <div className="text-center text-[12px] font-bold text-foreground mb-2">
        {monthNames[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10px] font-medium text-muted-foreground mb-1">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-6 w-6" />;

          const time = day.getTime();
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const isStart = startDate && day.toDateString() === startDate.toDateString();
          const isEnd = endDate && day.toDateString() === endDate.toDateString();

          return (
            <button
              key={time}
              type="button"
              onClick={() => onDateClick(day)}
              onMouseEnter={() => onDateHover(day)}
              onMouseLeave={() => onDateHover(null)}
              className={cn(
                "h-6 w-6 text-[10.5px] rounded-md transition-all flex items-center justify-center font-medium",
                selected && "bg-primary text-primary-foreground font-bold",
                inRange && !selected && "bg-primary/10 text-primary rounded-none",
                isStart && "rounded-r-none",
                isEnd && "rounded-l-none",
                !selected && !inRange && "text-foreground hover:bg-muted/80",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DualMonthCalendar({
  startDate,
  endDate,
  onRangeChange,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onRangeChange: (start: Date | null, end: Date | null) => void;
}) {
  const [current, setCurrent] = useState(() => {
    const today = new Date("2026-07-15T09:00:00+05:30");
    return { year: today.getFullYear(), month: today.getMonth() - 1 };
  });

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handlePrev = () => {
    setCurrent((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
      return { year: y, month: m };
    });
  };

  const handleNext = () => {
    setCurrent((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      return { year: y, month: m };
    });
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      onRangeChange(date, null);
    } else {
      if (date.getTime() < startDate.getTime()) {
        onRangeChange(date, startDate);
      } else {
        onRangeChange(startDate, date);
      }
    }
  };

  const secondMonth = current.month === 11 ? 0 : current.month + 1;
  const secondYear = current.month === 11 ? current.year + 1 : current.year;

  return (
    <div className="p-3 border-t border-border/40 bg-card rounded-b-xl">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-md border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-md border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        <CalendarGrid
          year={current.year}
          month={current.month}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
        />
        <CalendarGrid
          year={secondYear}
          month={secondMonth}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          onDateClick={handleDateClick}
          onDateHover={setHoverDate}
        />
      </div>
    </div>
  );
}

export function DateRangePicker() {
  const { dateRange, setDateRange } = useEsg();
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  useEffect(() => {
    if (open) {
      setTempRange(dateRange);
    }
  }, [open, dateRange]);

  const handlePresetSelect = (presetKey: string) => {
    if (presetKey === "custom") {
      setTempRange((prev) => ({
        ...prev,
        presetKey: "custom",
      }));
    } else {
      const range = getPresetRange(presetKey);
      const newRange: DateRange = {
        start: range.start,
        end: range.end,
        presetKey,
        label: formatRangeLabel(range.start, range.end, presetKey),
      };
      setTempRange(newRange);
      setDateRange(newRange);
      setOpen(false);
    }
  };

  const handleCustomRangeChange = (start: Date | null, end: Date | null) => {
    setTempRange((prev) => ({
      ...prev,
      start: start || prev.start,
      end: end || prev.end || start || prev.start,
      presetKey: "custom",
      label: formatRangeLabel(
        start || prev.start,
        end || prev.end || start || prev.start,
        "custom",
      ),
    }));
  };

  const handleApply = () => {
    const finalEnd = tempRange.end || tempRange.start;
    const finalRange: DateRange = {
      ...tempRange,
      end: finalEnd,
      label: formatRangeLabel(tempRange.start, finalEnd, tempRange.presetKey),
    };
    setDateRange(finalRange);
    setOpen(false);
  };

  const handleReset = () => {
    const range = getPresetRange("thisMonth");
    const defaultRange: DateRange = {
      start: range.start,
      end: range.end,
      presetKey: "thisMonth",
      label: formatRangeLabel(range.start, range.end, "thisMonth"),
    };
    setDateRange(defaultRange);
    setTempRange(defaultRange);
    setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const PRESET_OPTIONS = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last7", label: "Last 7 Days" },
    { key: "last30", label: "Last 30 Days" },
    { key: "thisMonth", label: "This Month" },
    { key: "prevMonth", label: "Previous Month" },
    { key: "thisQuarter", label: "This Quarter" },
    { key: "prevQuarter", label: "Previous Quarter" },
    { key: "thisYear", label: "This Year" },
    { key: "custom", label: "Custom Range" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label={`Reporting period date filter: ${dateRange.label}`}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="max-w-[190px] truncate">{dateRange.label}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="rounded-xl border border-border/60 bg-card shadow-elevated p-0 overflow-hidden"
          style={{ width: tempRange.presetKey === "custom" ? "480px" : "180px" }}
        >
          <div className="flex">
            <div className="w-[180px] p-1.5 space-y-0.5 border-r border-border/40 bg-card">
              <div className="px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/75 border-b border-border/40 mb-1">
                Quick Presets
              </div>
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = tempRange.presetKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handlePresetSelect(opt.key)}
                    className={cn(
                      "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60",
                      isSelected
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {tempRange.presetKey === "custom" && (
              <div className="flex-1 flex flex-col bg-card">
                <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between bg-muted/20">
                  <div className="text-[11.5px] font-bold text-foreground">Custom Date Range</div>
                  <div className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {tempRange.label}
                  </div>
                </div>
                <DualMonthCalendar
                  startDate={tempRange.start}
                  endDate={tempRange.end}
                  onRangeChange={handleCustomRangeChange}
                />

                <div className="flex items-center justify-end gap-2 p-2 border-t border-border/40 bg-muted/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-7 px-2.5 rounded-md border border-border/60 bg-card hover:bg-muted/80 text-[11px] font-semibold text-muted-foreground transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="h-7 px-2.5 rounded-md bg-primary hover:bg-primary/90 text-[11px] font-bold text-primary-foreground transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={handleApply}
        disabled={
          tempRange.start.getTime() === dateRange.start.getTime() &&
          tempRange.end.getTime() === dateRange.end.getTime()
        }
        className="h-8 px-2.5 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 disabled:pointer-events-none"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="h-8 px-2.5 text-[11.5px] font-semibold border border-border/60 bg-card hover:bg-muted/40 text-muted-foreground rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        Reset
      </button>
    </div>
  );
}

import { useState } from "react";

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Calendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    setSelectedDay(day);
  };

  return (
    <div style={{
      background: "white",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      width: 250,
      fontFamily: "sans-serif",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#202124", marginBottom: 12 }}>
        Calendar
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#3c4043" }}>
          {monthName} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {([["‹", prevMonth], ["›", nextMonth]] as [string, () => void][]).map(([ch, fn]) => (
            <button
              key={ch}
              onClick={fn}
              style={{
                width: 22, height: 22, border: "none", background: "none",
                cursor: "pointer", color: "#9aa0a6", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {DAYS_HEADER.map((d) => (
          <div key={d} style={{
            fontSize: 10, fontWeight: 600, color: "#9aa0a6",
            textAlign: "center", padding: "2px 0", letterSpacing: "0.3px",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = isCurrentMonth && day === selectedDay;

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              style={{
                aspectRatio: "1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12,
                borderRadius: "50%",
                cursor: day ? "pointer" : "default",
                color: isSelected ? "white" : isToday ? "#20b2a0" : "#3c4043",
                background: isSelected ? "#20b2a0" : "transparent",
                fontWeight: isSelected || isToday ? 700 : 400,
                outline: isToday && !isSelected ? "1.5px solid #20b2a0" : "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {day ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
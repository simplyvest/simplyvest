import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "@/styles/datepicker.css";
import { cn } from "@/utils/cn";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
  /** When true, prevents selecting dates/times in the past */
  disablePast?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  minDate,
  disabled,
  disablePast,
}: DateTimePickerProps) {
  const selected = value ? new Date(value) : null;
  const now = new Date();

  const effectiveMinDate = disablePast
    ? new Date(Math.max(now.getTime(), minDate?.getTime() ?? 0))
    : minDate;

  const isToday = (date: Date) => date.toDateString() === now.toDateString();

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange("");
      return;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const filterPassedTime = (time: Date) => {
    if (!disablePast) return true;
    if (!selected || !isToday(selected)) return true;
    const hour = time.getHours();
    const minute = time.getMinutes();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    if (hour > currentHour) return true;
    if (hour === currentHour && minute > currentMinute) return true;
    return false;
  };

  return (
    <DatePicker
      selected={selected}
      onChange={handleChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMM d, yyyy h:mm aa"
      placeholderText={placeholder}
      minDate={effectiveMinDate}
      filterTime={filterPassedTime}
      disabled={disabled}
      calendarClassName="!bg-bg1 !border-border !rounded-xl !shadow-lg"
      dayClassName={(date) =>
        cn(
          "hover:!bg-sol/10 !rounded-lg",
          date.toDateString() === now.toDateString() && "!bg-sol/5",
        )
      }
      popperClassName="!z-50"
      wrapperClassName="w-full"
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-bg1 px-3 py-2 text-sm text-text",
        "placeholder:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    />
  );
}

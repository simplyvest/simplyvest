import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "@/styles/datepicker.css";
import { cn } from "@/utils/cn";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString();
}

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

  const handleChangeRaw = (
    event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement> | undefined,
  ) => {
    if (!event?.target) return;
    if (!(event.target instanceof HTMLInputElement)) return;
    const text = event.target.value;
    if (!text) {
      onChange("");
      return;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) {
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");
        const hours = String(parsed.getHours()).padStart(2, "0");
        const minutes = String(parsed.getMinutes()).padStart(2, "0");
        onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
    }
  };

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
    // Filter past times when on today and disablePast is true
    if (disablePast && isToday(time)) {
      const hour = time.getHours();
      const minute = time.getMinutes();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (hour < currentHour) return false;
      if (hour === currentHour && minute <= currentMinute) return false;
    }

    // Filter times before minDate when on the same day as minDate
    if (minDate && selected && isSameDay(selected, minDate)) {
      const hour = time.getHours();
      const minute = time.getMinutes();
      const minHour = minDate.getHours();
      const minMinute = minDate.getMinutes();
      if (hour < minHour) return false;
      if (hour === minHour && minute <= minMinute) return false;
    }

    return true;
  };

  return (
    <DatePicker
      selected={selected}
      onChange={handleChange}
      onChangeRaw={handleChangeRaw}
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

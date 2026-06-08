import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Field } from "@/components/ui/field";

export function TimeFields({
  startTime,
  endTime,
  cliffTime,
  onStartTimeChange,
  onEndTimeChange,
  onCliffTimeChange,
}: {
  startTime: string;
  endTime: string;
  cliffTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onCliffTimeChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Field label="Start Date/Time" required>
        <DateTimePicker
          value={startTime}
          onChange={onStartTimeChange}
          placeholder="Select start time"
          disablePast
        />
      </Field>

      <Field label="End Date/Time" required>
        <DateTimePicker
          value={endTime}
          onChange={onEndTimeChange}
          placeholder="Select end time"
          minDate={startTime ? new Date(startTime) : undefined}
          disablePast
        />
      </Field>

      <Field label="Cliff Date/Time (optional)">
        <DateTimePicker
          value={cliffTime}
          onChange={onCliffTimeChange}
          placeholder="Select cliff time"
          minDate={startTime ? new Date(startTime) : undefined}
          disablePast
        />
      </Field>
    </div>
  );
}

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
        <Input
          type="datetime-local"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
        />
      </Field>

      <Field label="End Date/Time" required>
        <Input
          type="datetime-local"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
        />
      </Field>

      <Field label="Cliff Date/Time (optional)">
        <Input
          type="datetime-local"
          value={cliffTime}
          onChange={(e) => onCliffTimeChange(e.target.value)}
        />
      </Field>
    </div>
  );
}

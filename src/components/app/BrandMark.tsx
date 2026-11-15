import { GraduationCap } from "lucide-react";

export default function BrandMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span
        className={`text-base font-semibold tracking-tight ${inverted ? "text-navy-foreground" : "text-foreground"}`}
      >
        OpenTutor <span className="text-primary">AI</span>
      </span>
    </span>
  );
}

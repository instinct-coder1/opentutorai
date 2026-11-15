import { useId, type KeyboardEvent } from "react";

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

interface ChoiceGroupProps<T extends string | number> {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string | null | undefined;
  columns?: 2 | 3;
}

export default function ChoiceGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: ChoiceGroupProps<T>) {
  const labelId = useId();
  const gridClass = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  function handleArrowKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const next = options[(index + 1) % options.length];
    if (!next) return;
    onChange(next.value);
    const group = event.currentTarget.parentElement;
    group
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [(index + 1) % options.length]?.focus();
  }

  return (
    <div className="space-y-2">
      <p id={labelId} className="text-sm font-medium text-foreground">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className={`grid gap-3 ${gridClass}`}>
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (value === null && index === 0) ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleArrowKey(event, index)}
              className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                selected
                  ? "border-primary bg-accent shadow-sm ring-1 ring-primary"
                  : "border-border bg-card hover:-translate-y-0.5 hover:border-brand-border hover:shadow-sm"
              }`}
            >
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 text-xs text-subtle-foreground">{option.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

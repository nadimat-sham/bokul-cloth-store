import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

interface Base {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, className, ...input }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${error ? "field--error" : ""} ${className ?? ""}`}>
      <label htmlFor={id}>
        {label}
        {input.required && <span aria-hidden="true"> *</span>}
      </label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-err`} role="alert">{error}</p>}
    </div>
  );
}

export function TextArea({ label, error, hint, className, ...input }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${error ? "field--error" : ""} ${className ?? ""}`}>
      <label htmlFor={id}>
        {label}
        {input.required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-err`} role="alert">{error}</p>}
    </div>
  );
}

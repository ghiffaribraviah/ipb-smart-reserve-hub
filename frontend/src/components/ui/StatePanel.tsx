import { AlertCircle, Inbox, LoaderCircle, SearchX } from "lucide-react";
import { Button } from "./Button";

type StatePanelState = "loading" | "empty" | "error" | "not-found" | "retrying";
type StatePanelDensity = "page" | "section";

type StatePanelProps = {
  actionLabel?: string;
  density?: StatePanelDensity;
  message: string;
  onAction?: () => void;
  state: StatePanelState;
  title: string;
};

const iconByState = {
  loading: LoaderCircle,
  retrying: LoaderCircle,
  empty: Inbox,
  error: AlertCircle,
  "not-found": SearchX,
};

export function StatePanel({ actionLabel, density = "section", message, onAction, state, title }: StatePanelProps) {
  const Icon = iconByState[state];
  const isLoading = state === "loading" || state === "retrying";
  const role = state === "error" ? "alert" : isLoading ? "status" : "region";

  return (
    <section
      aria-label={title}
      className={[
        "flex flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-lg text-center shadow-ambient",
        density === "page" ? "min-h-80" : "min-h-48",
      ].join(" ")}
      role={role}
    >
      <span className="mb-md flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary-container">
        <Icon aria-hidden="true" className={isLoading ? "animate-spin" : ""} size={24} />
      </span>
      <h2 className="text-h3 text-primary-container">{title}</h2>
      <p className="mt-sm max-w-md text-body-md text-on-surface-variant">{message}</p>
      {actionLabel && onAction ? (
        <Button className="mt-md" onClick={onAction} variant={state === "error" ? "outline" : "primary"}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}

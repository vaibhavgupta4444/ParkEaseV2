export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      {icon && <div className="mb-3 text-primary">{icon}</div>}
      <h3 className="text-lg font-bold text-secondary">{title}</h3>
      {description && <p className="mt-1 text-sm text-textSecondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default function Badge({ label }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-textSecondary">
      {label}
    </span>
  );
}

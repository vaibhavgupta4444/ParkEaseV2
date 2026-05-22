export default function StarRating({ rating }) {
  return (
    <span className="text-xs font-semibold text-warning">
      ★ {rating.toFixed(1)}
    </span>
  );
}

const sizes = {
  default: {
    image: "h-10 w-12",
    text: "text-xl",
  },
  large: {
    image: "h-12 w-14",
    text: "text-2xl sm:text-3xl",
  },
};

export default function BrandLogo({ size = "default", className = "" }) {
  const selectedSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo.png" alt="ParkEase logo" className={`${selectedSize.image} object-contain`} />
      <span className={`${selectedSize.text} font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent`}>
        ParkEase
      </span>
    </div>
  );
}

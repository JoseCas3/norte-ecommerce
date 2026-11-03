import Image from "next/image";
const illustrations: Record<string, string> = {
  "🍶": "bottle",
  "📔": "notebook",
  "👜": "bag",
  "🎧": "headphones",
  "☕": "mug",
  "💡": "lamp",
};
export function ProductArtwork({ icon }: { icon: string }) {
  return (
    <Image
      src={`/products/${illustrations[icon] || "package"}.svg`}
      alt=""
      width={360}
      height={300}
      className="product-illustration"
    />
  );
}

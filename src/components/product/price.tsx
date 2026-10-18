import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Price({
  product,
  size = "sm",
}: {
  product: Pick<Product, "price" | "mrp">;
  size?: "sm" | "lg";
}) {
  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={cn("flex items-baseline flex-wrap", size === "lg" ? "gap-3" : "gap-2")}>
      <span className={cn("font-semibold text-gray-900", size === "lg" ? "text-3xl font-bold" : "text-sm")}>
        ₹{product.price.toLocaleString("en-IN")}
      </span>
      {product.mrp && discount > 0 && (
        <>
          <span className={cn("text-gray-400 line-through", size === "lg" ? "text-lg" : "text-xs")}>
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span className={cn("font-medium text-green-600", size === "lg" ? "text-base" : "text-xs")}>
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}

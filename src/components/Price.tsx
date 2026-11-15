import { discountPercent, formatMoney } from "../../shared/store.ts";

export function Price({ price, compareAt, size = "md" }: { price: number; compareAt: number | null; size?: "md" | "lg" }) {
  const off = discountPercent(price, compareAt);
  return (
    <p className={`price price--${size}`}>
      <span className="price__now">{formatMoney(price)}</span>
      {off > 0 && (
        <>
          <s className="price__was">
            <span className="visually-hidden">was </span>
            {formatMoney(compareAt!)}
          </s>
          <span className="price__off">{off}% off</span>
        </>
      )}
    </p>
  );
}

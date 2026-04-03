import { DollarSign, Info } from "lucide-react";
import { formatINR, getPlatformFee } from "../utils/format";

interface Props {
  bidAmountINR?: number;
}

export default function PlatformFeeCard({ bidAmountINR }: Props) {
  const tiers = [
    { range: "₹0 – ₹10,000", fee: "₹800" },
    { range: "₹10,001 – ₹30,000", fee: "₹1,000" },
    { range: "₹30,001 – ₹60,000", fee: "₹1,300" },
    { range: "₹60,001 – ₹1,00,000", fee: "₹1,500" },
    { range: "₹1,00,001+", fee: "₹2,000" },
  ];

  const platformFee = bidAmountINR ? getPlatformFee(bidAmountINR) : null;
  const gst = platformFee ? Math.round(platformFee * 0.18) : null;
  const tcs = bidAmountINR ? Math.round(bidAmountINR * 0.01) : null;
  const totalFees = platformFee && gst && tcs ? platformFee + gst + tcs : null;

  return (
    <div className="bg-white rounded-xl shadow-card p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground text-sm">
          ₹ Platform Fee Structure
        </h3>
      </div>

      <div className="rounded-lg overflow-hidden border border-border mb-3">
        <div className="grid grid-cols-2 bg-muted px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Transaction Amount
          </span>
          <span className="text-xs font-semibold text-muted-foreground text-right">
            Platform Fee
          </span>
        </div>
        {tiers.map((tier, i) => (
          <div
            key={tier.range}
            className={`grid grid-cols-2 px-3 py-2 border-t border-border ${
              platformFee &&
              (
                (i === 0 && bidAmountINR! <= 10000) ||
                  (i === 1 &&
                    bidAmountINR! > 10000 &&
                    bidAmountINR! <= 30000) ||
                  (i === 2 &&
                    bidAmountINR! > 30000 &&
                    bidAmountINR! <= 60000) ||
                  (i === 3 &&
                    bidAmountINR! > 60000 &&
                    bidAmountINR! <= 100000) ||
                  (i === 4 && bidAmountINR! > 100000)
              )
                ? "bg-primary/5"
                : ""
            }`}
          >
            <span className="text-xs text-foreground">{tier.range}</span>
            <span className="text-xs font-semibold text-foreground text-right">
              {tier.fee}
            </span>
          </div>
        ))}
      </div>

      {/* Yellow info box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-2">
        <p className="text-xs text-yellow-800 font-medium">
          +18% GST on platform fee &middot; +1% TCS on transaction amount
          (claimable)
        </p>
      </div>

      {/* Blue info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
        <div className="flex gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Seller pays 1% TCS on every transaction. Invoice generated after
            device inspection is complete.
          </p>
        </div>
      </div>

      {/* Calculated total */}
      {bidAmountINR && platformFee && gst && tcs && totalFees ? (
        <div className="bg-primary/5 rounded-lg px-3 py-3 border border-primary/20">
          <p className="text-xs font-semibold text-primary mb-2">
            Fee Breakdown for {formatINR(bidAmountINR * 100)}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-medium">
                {formatINR(platformFee * 100)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">GST (18% on fee)</span>
              <span className="font-medium">{formatINR(gst * 100)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">TCS (1%)</span>
              <span className="font-medium">{formatINR(tcs * 100)}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-primary/20 pt-1 mt-1">
              <span className="font-bold text-foreground">Total Payable</span>
              <span className="font-bold text-primary">
                {formatINR(totalFees * 100)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

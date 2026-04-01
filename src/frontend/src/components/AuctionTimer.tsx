import { Calendar, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCountdown } from "../utils/format";

interface Props {
  endsAt: bigint;
  auctionType: string;
  status: string;
}

export default function AuctionTimer({ endsAt, auctionType, status }: Props) {
  const [msLeft, setMsLeft] = useState<number>(0);

  useEffect(() => {
    const endMs = Number(endsAt) / 1_000_000;
    const update = () => setMsLeft(endMs - Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (status === "Ended" || status === "Sold") {
    return (
      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        Ended
      </span>
    );
  }

  const isLive = auctionType === "Live20min";
  const isEnded = msLeft <= 0;

  if (isEnded) {
    return (
      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        Ended
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        isLive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
      }`}
    >
      {isLive ? <Zap className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
      {formatCountdown(msLeft)}
    </span>
  );
}

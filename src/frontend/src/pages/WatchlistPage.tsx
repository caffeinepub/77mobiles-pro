import { useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../contexts/AppContext";
import {
  BUYER_AUCTIONS,
  DEMO_BIDS,
  getDeviceImage,
} from "../data/demoListings";
import { formatINR } from "../utils/format";

function WatchlistCountdown({ endsAt }: { endsAt: bigint }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const endMs = Number(endsAt) / 1_000_000;
    const update = () =>
      setSecs(Math.max(0, Math.floor((endMs - Date.now()) / 1000)));
    update();
    ref.current = setInterval(update, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [endsAt]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (secs === 0)
    return <span className="text-[9px] font-bold text-gray-400">Ended</span>;
  return (
    <span
      className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
      style={{ background: "#fef2f2", color: "#dc2626" }}
    >
      {String(m).padStart(2, "0")}m:{String(s).padStart(2, "0")}s
    </span>
  );
}

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist, toggleWatchlist } = useApp();

  const watchedItems = BUYER_AUCTIONS.filter((l) => watchlist.has(l.listingId));
  const endingSoon = watchedItems.filter((l) => {
    const ms = Number(l.endsAt) / 1_000_000 - Date.now();
    return ms > 0 && ms < 60 * 60 * 1000;
  });
  const priceDrops = watchedItems.filter((l) => {
    const bid = DEMO_BIDS[l.listingId];
    return bid !== undefined && bid < Number(l.basePrice);
  });
  const activeItems = watchedItems.filter(
    (l) => Number(l.endsAt) / 1_000_000 > Date.now(),
  );
  const endedItems = watchedItems.filter(
    (l) => Number(l.endsAt) / 1_000_000 <= Date.now(),
  );

  const statCards = [
    { label: "Watching", value: watchedItems.length, color: "#007AFF" },
    { label: "Ending Soon", value: endingSoon.length, color: "#ef4444" },
    { label: "Price Drops", value: priceDrops.length, color: "#22c55e" },
  ];

  if (watchedItems.length === 0) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen flex flex-col items-center justify-center px-6 text-center pb-20">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#EEF2FF" }}
        >
          <Star className="w-10 h-10" style={{ color: "#007AFF" }} />
        </div>
        <h2 className="font-black text-lg text-gray-900 mb-2">
          Your Watchlist is empty
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Start exploring auctions to save your favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      {/* Stat cards */}
      <div className="px-3 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl py-3 px-2 flex flex-col items-center gap-0.5"
              style={{
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <p
                className="text-xl font-black leading-none"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-[9px] font-semibold text-gray-400 text-center leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 pt-1">
        {/* Active watchlist — 2-column bento grid */}
        {activeItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {activeItems.map((listing, idx) => {
              const currentBid =
                DEMO_BIDS[listing.listingId] ?? Number(listing.basePrice);
              return (
                <div
                  key={listing.listingId}
                  data-ocid={`watchlist.item.${idx + 1}`}
                  className="bg-white rounded-xl overflow-hidden flex flex-col"
                  style={{
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <button
                    type="button"
                    className="relative w-full overflow-hidden flex-shrink-0"
                    style={{ height: "112px" }}
                    onClick={() =>
                      navigate({ to: `/listing/${listing.listingId}` })
                    }
                  >
                    <img
                      src={getDeviceImage(listing.model)}
                      alt={listing.model}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "12px 12px 0 0" }}
                    />
                    <div className="absolute top-1.5 right-1.5">
                      <WatchlistCountdown endsAt={listing.endsAt} />
                    </div>
                  </button>
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="font-bold text-xs text-gray-900 leading-snug mb-1 truncate">
                      {listing.model}
                    </p>
                    <p className="font-black text-sm text-gray-900 mb-2">
                      {formatINR(currentBid)}
                    </p>
                    <div className="flex gap-1 mt-auto">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({ to: `/listing/${listing.listingId}` })
                        }
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white"
                        style={{ background: "#007AFF" }}
                      >
                        Bid Now
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWatchlist(listing.listingId)}
                        className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-500"
                        style={{ background: "#f3f4f6" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recently ended */}
        {endedItems.length > 0 && (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Recently Ended
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {endedItems.map((listing, idx) => (
                <div
                  key={listing.listingId}
                  data-ocid={`watchlist.ended.item.${idx + 1}`}
                  className="bg-white rounded-xl overflow-hidden"
                  style={{ border: "1px solid #e5e7eb", opacity: 0.6 }}
                >
                  <div className="w-full h-20 overflow-hidden">
                    <img
                      src={getDeviceImage(listing.model)}
                      alt={listing.model}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "12px 12px 0 0" }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-xs text-gray-700 truncate">
                      {listing.model}
                    </p>
                    <span className="text-[9px] text-gray-400">Ended</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

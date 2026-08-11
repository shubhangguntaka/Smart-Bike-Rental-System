interface FilterPanelProps {
  maxPrice: number;
  setMaxPrice: (value: number) => void;

  maxDistance: number;
  setMaxDistance: (value: number) => void;
}

export default function FilterPanel({
  maxPrice,
  setMaxPrice,
  maxDistance,
  setMaxDistance,
}: FilterPanelProps) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border bg-white p-4 dark:bg-gray-800">

      <div>
        <label className="mb-1 block text-sm font-medium">
          Maximum Price (₹)
        </label>

        <input
          type="range"
          min="100"
          max="5000"
          step="50"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(Number(e.target.value))
          }
          className="w-full"
        />

        <p className="text-sm text-gray-500">
          ₹ {maxPrice}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Maximum Distance
        </label>

        <input
          type="range"
          min="1"
          max="100"
          value={maxDistance}
          onChange={(e) =>
            setMaxDistance(Number(e.target.value))
          }
          className="w-full"
        />

        <p className="text-sm text-gray-500">
          {maxDistance} km
        </p>
      </div>

    </div>
  );
}

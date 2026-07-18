import React from "react";
import { Star, StarHalf } from "lucide-react";

export const Stars = ({ rating }) => {
  if (!rating)
    return (
      <span className="text-slate-400 text-sm font-medium">
        No Ratings Provided
      </span>
    );
  const numRating = Number(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < Math.floor(numRating))
            return (
              <Star
                key={i}
                className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
              />
            );
          if (i < Math.ceil(numRating) && numRating % 1 !== 0)
            return (
              <StarHalf
                key={i}
                className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
              />
            );
          return <Star key={i} className="w-3.5 h-3.5 text-slate-200" />;
        })}
      </div>
      <span className="text-sm font-medium text-slate-700">
        {numRating.toFixed(1)}
      </span>
    </div>
  );
};

export default Stars;

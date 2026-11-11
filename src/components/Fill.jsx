import { useEffect, useState } from "react";

/* To'ldirilgan qism: 0 dan kerakli kenglikkacha silliq o'sadi.
   Qiymat o'zgarsa (masalan, davr almashsa), eski kenglikdan yangisiga o'tadi. */
export default function Fill({ value, className = "bg-sun" }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setWidth(value));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [value]);

  return (
    <span
      className={`block h-full rounded-full transition-[width] duration-700 ease-out ${className}`}
      style={{ width: `${width}%` }}
    />
  );
}

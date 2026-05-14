import React from "react";

export function GridBackground() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-white dark:bg-[#0a0a0a] pointer-events-none overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)]" />
    </div>
  );
}

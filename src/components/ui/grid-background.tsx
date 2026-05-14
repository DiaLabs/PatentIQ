export function GridBackground() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-white dark:bg-[#0a0a0a] pointer-events-none overflow-hidden transition-colors duration-300">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
    </div>
  );
}

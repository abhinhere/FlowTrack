import { motion } from "framer-motion";

export function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.1 }}
          className="h-36 rounded-2xl border border-white/10 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

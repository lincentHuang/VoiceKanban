"use client";

import React from "react";
import { motion } from "framer-motion";

interface AudioVisualizerProps {
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  const bars = [14, 28, 45, 60, 80, 100, 75, 55, 38, 20, 35, 65, 90, 70, 40, 22];

  return (
    <div className="flex items-center justify-center gap-1.5 h-20 px-4 py-2">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-orange-500 to-rose-500 shadow-xs"
          animate={
            isRecording
              ? {
                  height: [
                    `${Math.max(12, height * 0.25)}px`,
                    `${Math.max(16, height * 0.95)}px`,
                    `${Math.max(10, height * 0.4)}px`,
                  ],
                }
              : { height: "8px" }
          }
          transition={{
            duration: 0.6 + (i % 5) * 0.1,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: (i * 0.05) % 0.3,
          }}
        />
      ))}
    </div>
  );
};

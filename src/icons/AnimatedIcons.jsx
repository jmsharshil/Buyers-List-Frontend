"use client";

import { motion, useAnimation } from "motion/react";

const lidVariants = {
  normal: { y: 0 },
  animate: { y: -1.1 },
};

const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const Delete = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  background = "transparent",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        background,
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.g
          variants={lidVariants}
          animate={controls}
          transition={springTransition}
        >
          <path d="M3 6h18" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </motion.g>
        <motion.path
          d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
          variants={{
            normal: { d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8" },
            animate: { d: "M19 9v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V9" },
          }}
          animate={controls}
          transition={springTransition}
        />
        <motion.line
          x1="10"
          x2="10"
          y1="11"
          y2="17"
          variants={{
            normal: { y1: 11, y2: 17 },
            animate: { y1: 11.5, y2: 17.5 },
          }}
          animate={controls}
          transition={springTransition}
        />
        <motion.line
          x1="14"
          x2="14"
          y1="11"
          y2="17"
          variants={{
            normal: { y1: 11, y2: 17 },
            animate: { y1: 11.5, y2: 17.5 },
          }}
          animate={controls}
          transition={springTransition}
        />
      </svg>
    </div>
  );
};

export { Delete };

//////////////////////////////////////////////////////

"use client";



const pathVariant = {
  normal: { pathLength: 1, opacity: 1, pathOffset: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    pathOffset: [1, 0],
  },
};

const circleVariant = {
  normal: {
    pathLength: 1,
    pathOffset: 0,
    scale: 1,
  },
  animate: {
    pathLength: [0, 1],
    pathOffset: [1, 0],
    scale: [0.5, 1],
  },
};

const User = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  background = "transparent",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        background,
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.circle
          cx="12"
          cy="8"
          r="5"
          animate={controls}
          variants={circleVariant}
        />
        <motion.path
          d="M20 21a8 8 0 0 0-16 0"
          variants={pathVariant}
          transition={{
            delay: 0.2,
            duration: 0.4,
          }}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { User };

///////////////////////////////////////////////////////////////

"use client";



const sparkleVariants = {
  normal: {
    opacity: 1,
  },
  animate: (i) => ({
    opacity: [1, 0.3, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatDelay: 0.2,
      delay: i * 0.1,
      ease: "easeInOut",
    },
  }),
};

const WandSparkles = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  background = "transparent",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        background,
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
        <motion.path d="m14 7 3 3" variants={sparkleVariants} animate={controls} custom={0} />
        <motion.path d="M5 6v4" variants={sparkleVariants} animate={controls} custom={1} />
        <motion.path d="M19 14v4" variants={sparkleVariants} animate={controls} custom={2} />
        <motion.path d="M10 2v2" variants={sparkleVariants} animate={controls} custom={3} />
        <motion.path d="M7 8H3" variants={sparkleVariants} animate={controls} custom={4} />
        <motion.path d="M21 16h-4" variants={sparkleVariants} animate={controls} custom={5} />
        <motion.path d="M11 3H9" variants={sparkleVariants} animate={controls} custom={6} />
      </svg>
    </div>
  );
};

export { WandSparkles };


////////////////////////////////////////////////////////////////////

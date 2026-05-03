import { motion } from "framer-motion";
import images from "@/assets/images";

interface ImateLoadingProps {
  type: "screen" | "component";
}

const ImateLoading: React.FC<ImateLoadingProps> = ({ type }) => {
  return (
    <div className={`flex ${type === "screen" ? "h-screen" : ""} flex-col items-center justify-center bg-white`}>
      <motion.img
        src={images.logo}
        alt="Loading..."
        className={`${type === "screen" ? "h-20 w-20" : "h-10 w-10"} object-contain`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
      />
      <motion.p className={`${type === "screen" ? "" : "text-sm"}`}>Đang tải...</motion.p>
    </div>
  );
};

export default ImateLoading;

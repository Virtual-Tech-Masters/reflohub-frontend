import { motion } from 'framer-motion';

const RouteLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center"
      >
        <div className="flex flex-col items-center justify-center">
          {/* Glassmorphism Loading Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl mb-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-12 h-12 border-4 border-white/30 border-t-blue-400 rounded-full"
            ></motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 font-medium text-lg"
          >
            Loading content...
          </motion.p>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-3 max-w-xs"
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RouteLoader;
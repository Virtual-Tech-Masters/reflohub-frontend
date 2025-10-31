import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="flex flex-col items-center justify-center">
          {/* Glassmorphism Loading Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 rounded-full border-4 border-white/30 border-t-blue-400 absolute"
              ></motion.div>
              
              <motion.div
                animate={{
                  scale: [1, 0.8, 1],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 rounded-full border-4 border-white/30 border-r-purple-400 absolute left-2 top-2"
              ></motion.div>
              
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -180, -360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-8 h-8 rounded-full border-4 border-white/30 border-b-pink-400 absolute left-4 top-4"
              ></motion.div>
            </div>
          </div>
          
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4"
          >
            Loading Workspace
          </motion.h3>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full max-w-xs"
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;
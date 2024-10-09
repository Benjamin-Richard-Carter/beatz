import { motion, AnimatePresence } from 'framer-motion';
import { PropsWithChildren } from 'react';

export const MenuBackdrop = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex items-center justify-center z-50 backdrop-blur-3xl "
      onClick={(e) => e.stopPropagation()}>
      {children}
    </motion.div>
  );
};

export const MenuContainer = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      layout="position"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className="w-full m-5 rounded-3xl p-3 gap-3 flex flex-col z-50 overflow-clip md:w-1/3 items-center  ">
      <AnimatePresence>{children}</AnimatePresence>
    </motion.div>
  );
};

export const MenuCard = ({ children }: PropsWithChildren) => {
  return (
    <motion.div className="w-full flex flex-col justify-center p-3 gap-3 bg-white text-black rounded-2xl py-5">
      {children}
    </motion.div>
  );
};

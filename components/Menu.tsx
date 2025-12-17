import React from 'react';
import { FoodItem } from '../types';
import { IconTrash, IconX } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuProps {
  items: FoodItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const Menu: React.FC<MenuProps> = ({ items, onRemove, onClose }) => {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-gray-50 flex flex-col"
    >
      <div className="bg-white shadow-sm px-6 py-5 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-gray-800">My Menu ({items.length})</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <IconX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="mb-2">Your menu is empty.</p>
            <p className="text-sm">Swipe down on cards to add them!</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex bg-white rounded-xl p-3 shadow-sm border border-gray-100"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-lg object-cover bg-gray-200"
                />
                <div className="ml-4 flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                     {item.tags.slice(0, 3).map(t => <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>)}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-green-600">{item.calories} kCal</div>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-3 self-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <IconTrash className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      <div className="bg-white p-4 border-t border-gray-200">
         <div className="flex justify-between items-center text-gray-800 font-bold text-lg">
             <span>Total Calories</span>
             <span>{items.reduce((acc, curr) => acc + curr.calories, 0)}</span>
         </div>
      </div>
    </motion.div>
  );
};

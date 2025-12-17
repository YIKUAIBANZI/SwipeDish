import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { FoodItem, SwipeDirection } from '../types';

interface CardProps {
  item: FoodItem;
  onSwipe: (direction: SwipeDirection, item: FoodItem) => void;
  style?: React.CSSProperties;
  drag?: boolean;
}

export const Card: React.FC<CardProps> = ({ item, onSwipe, style, drag = true }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [showInfo, setShowInfo] = useState(false);

  // Rotation based on X movement
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Opacity indicators
  const opacityNope = useTransform(x, [-150, -20], [1, 0]);
  const opacityLike = useTransform(y, [20, 150], [0, 1]); // Down
  const opacitySkip = useTransform(y, [-150, -20], [1, 0]); // Up
  const opacityInfo = useTransform(x, [20, 150], [0, 1]); // Right

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x < -threshold) {
      // LEFT - Next
      await controls.start({ x: -window.innerWidth, rotate: -20, transition: { duration: 0.2 } });
      onSwipe(SwipeDirection.LEFT, item);
    } else if (info.offset.x > threshold) {
      // RIGHT - Info
      await controls.start({ x: 0, y: 0, rotate: 0 });
      setShowInfo(true);
      onSwipe(SwipeDirection.RIGHT, item);
    } else if (info.offset.y < -threshold) {
      // UP - Exclude
      await controls.start({ y: -window.innerHeight, opacity: 0, transition: { duration: 0.2 } });
      onSwipe(SwipeDirection.UP, item);
    } else if (info.offset.y > threshold) {
      // DOWN - Add to Menu
      await controls.start({ y: window.innerHeight, opacity: 0, transition: { duration: 0.2 } });
      onSwipe(SwipeDirection.DOWN, item);
    } else {
      // Return to center
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
  };

  return (
    <motion.div
      style={{ x, y, rotate, ...style }}
      drag={drag}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      className="absolute inset-0 w-full h-full bg-black overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl"
    >
      {/* Background Image - Full Screen */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      
      {/* Heavy Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

      {/* Info Overlay (Visible when toggled) */}
      {showInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 p-8 flex flex-col justify-center text-white"
        >
          <h2 className="text-4xl font-bold mb-2">{item.name}</h2>
          <div className="text-xl text-green-400 font-medium mb-6">{item.restaurantName}</div>
          
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">{item.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-2xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Calories</div>
                <div className="text-2xl font-bold">{item.calories}</div>
            </div>
             <div className="bg-white/10 p-4 rounded-2xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</div>
                <div className="text-lg font-bold truncate">{item.address || "Nearby"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {item.tags.map(tag => (
              <span key={tag} className="px-4 py-2 bg-white rounded-full text-black text-sm font-bold">
                #{tag}
              </span>
            ))}
          </div>

          <button 
            onClick={() => setShowInfo(false)}
            className="w-full py-4 bg-white text-black rounded-full font-black mt-auto hover:bg-gray-200 transition-colors"
          >
            CLOSE
          </button>
        </motion.div>
      )}

      {/* Basic Info (Always Visible at bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 text-white z-20 pointer-events-none">
        <h2 className="text-4xl font-black drop-shadow-xl leading-tight mb-2">{item.name}</h2>
        <div className="flex items-center space-x-2 text-lg font-medium text-gray-200 drop-shadow-md mb-4">
             <span>{item.restaurantName}</span>
             {item.address && (
                 <>
                  <span>•</span>
                  <span className="opacity-70 text-sm">{item.address}</span>
                 </>
             )}
        </div>
        <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-bold uppercase tracking-wide">
                    {tag}
                </span>
            ))}
        </div>
      </div>

      {/* Swipe Indicators */}
      <motion.div style={{ opacity: opacityNope }} className="absolute top-1/2 right-8 -translate-y-1/2 z-20">
        <div className="border-4 border-red-500 text-red-500 rounded-full w-24 h-24 flex items-center justify-center text-xl font-black uppercase tracking-widest bg-black/40 backdrop-blur-md transform rotate-12">
          NOPE
        </div>
      </motion.div>

      <motion.div style={{ opacity: opacityLike }} className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <div className="border-4 border-green-500 text-green-500 rounded-full px-6 py-2 text-3xl font-black uppercase tracking-widest bg-black/40 backdrop-blur-md">
          MENU
        </div>
      </motion.div>

      <motion.div style={{ opacity: opacitySkip }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
        <div className="border-4 border-gray-400 text-gray-400 rounded-full px-6 py-2 text-xl font-black uppercase tracking-widest bg-black/40 backdrop-blur-md">
          FILTER
        </div>
      </motion.div>

      <motion.div style={{ opacity: opacityInfo }} className="absolute top-1/2 left-8 -translate-y-1/2 z-20">
        <div className="border-4 border-blue-400 text-blue-400 rounded-full w-24 h-24 flex items-center justify-center text-xl font-black uppercase tracking-widest bg-black/40 backdrop-blur-md transform -rotate-12">
          INFO
        </div>
      </motion.div>

    </motion.div>
  );
};

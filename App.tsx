import React, { useState, useEffect } from 'react';
import { Card } from './components/Card';
import { Menu } from './components/Menu';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { IconMenu, IconSettings } from './components/Icons';
import { fetchFoodRecommendations } from './services/geminiService';
import { FoodItem, SwipeDirection, UserState, UserPreferences } from './types';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>({ isLoggedIn: false });
  const [queue, setQueue] = useState<FoodItem[]>([]);
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    taboos: "",
    dislikes: []
  });
  
  const [location, setLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);

  // Get location on mount (or when logged in)
  useEffect(() => {
    if (user.isLoggedIn && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location permission denied or error:", error);
        }
      );
    }
  }, [user.isLoggedIn]);

  // Initial Load trigger
  useEffect(() => {
    if (user.isLoggedIn && queue.length < 2) {
      loadMoreFood();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isLoggedIn, queue.length, preferences.taboos, location]);

  const loadMoreFood = async () => {
    if (loading) return;
    setLoading(true);
    
    // Pass current preferences and location to service
    const newItems = await fetchFoodRecommendations(preferences, location);
    
    // Deduplicate against existing queue and menu
    const existingIds = new Set([...queue.map(i => i.id), ...menu.map(i => i.id)]);
    const filteredItems = newItems.filter(i => !existingIds.has(i.id));
    
    setQueue(prev => [...prev, ...filteredItems]);
    setLoading(false);
  };

  const handleSwipe = (direction: SwipeDirection, item: FoodItem) => {
    if (direction === SwipeDirection.RIGHT) {
      return; // Info view, keep card
    }

    setQueue(prev => prev.filter(i => i.id !== item.id));

    switch (direction) {
      case SwipeDirection.LEFT:
        // Next/Skip
        break;
      case SwipeDirection.UP:
        // Exclude/Dislike: Add tags to dislikes to filter future API calls
        // We pick the first tag as a primary category to avoid, or all of them.
        const newDislikes = item.tags.slice(0, 2); // Avoid top 2 tags
        setPreferences(prev => ({
            ...prev,
            dislikes: [...Array.from(new Set([...prev.dislikes, ...newDislikes]))]
        }));
        break;
      case SwipeDirection.DOWN:
        // Add to Menu
        setMenu(prev => [...prev, item]);
        break;
    }
  };

  const handleLogin = (username: string) => {
    setUser({ isLoggedIn: true, username });
  };

  const removeFromMenu = (id: string) => {
    setMenu(prev => prev.filter(item => item.id !== id));
  };

  if (!user.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-40 pointer-events-none">
        {/* User Info */}
        <div className="flex items-center space-x-3 pointer-events-auto bg-black/20 backdrop-blur-md rounded-full pl-1 pr-4 py-1">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">
                {user.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-white text-sm shadow-black drop-shadow-md">{user.username}</span>
        </div>

        {/* Right Buttons */}
        <div className="flex space-x-3 pointer-events-auto">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20"
            >
                <IconSettings className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white relative hover:bg-white/20"
            >
                <IconMenu className="w-5 h-5" />
                {menu.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                )}
            </button>
        </div>
      </div>

      {/* Main Card Stack Area */}
      <div className="flex-1 relative w-full h-full">
        {queue.length === 0 && loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-0">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4"></div>
                <p className="font-medium tracking-wide opacity-70">SCOUTING NEARBY...</p>
             </div>
        )}
        
        {queue.length === 0 && !loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-0 p-8 text-center">
                <p className="text-2xl font-black mb-4">YOU'VE SEEN IT ALL</p>
                <button 
                    onClick={() => loadMoreFood()} 
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                >
                    REFRESH
                </button>
             </div>
        )}

        {/* Cards */}
        <AnimatePresence>
        {queue.map((item, index) => (
            index < 2 && (
                <Card 
                    key={item.id}
                    item={item}
                    onSwipe={handleSwipe}
                    drag={index === 0}
                    style={{ 
                        zIndex: queue.length - index,
                        scale: index === 0 ? 1 : 0.95, // Subtle depth
                        opacity: index === 0 ? 1 : 0 // Only show top card mostly, keeping performance high
                    }}
                />
            )
        ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isMenuOpen && (
          <Menu 
            items={menu}
            onRemove={removeFromMenu}
            onClose={() => setIsMenuOpen(false)} 
          />
        )}
      </AnimatePresence>

      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        taboos={preferences.taboos}
        onSave={(newTaboos) => {
            setPreferences(prev => ({ ...prev, taboos: newTaboos }));
            setQueue([]); // Clear queue to force reload with new preferences
        }}
      />

    </div>
  );
};

export default App;
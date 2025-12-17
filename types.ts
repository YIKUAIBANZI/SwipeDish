export interface FoodItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  calories: number;
  imageUrl: string;
  restaurantName?: string;
  address?: string;
}

export enum SwipeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
  NONE = 'NONE'
}

export interface UserState {
  isLoggedIn: boolean;
  username?: string;
}

export interface UserPreferences {
  taboos: string; // e.g. "No pork, Vegetarian"
  dislikes: string[]; // Accumulated from UP swipes
}

import { GoogleGenAI } from "@google/genai";
import { FoodItem, UserPreferences } from "../types";

// Helper to generate a consistent mock image URL since we can't generate real AI images in this environment easily.
const getImageUrl = (seed: string) => {
  const hash = seed.split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const id = Math.abs(hash) % 1000;
  return `https://picsum.photos/id/${id}/600/1000`; // Taller aspect ratio for full screen
};

interface Location {
  latitude: number;
  longitude: number;
}

export const fetchFoodRecommendations = async (
  prefs: UserPreferences,
  location?: Location
): Promise<FoodItem[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key found. Returning mock data.");
      return getMockData();
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use default location (San Francisco) if user denies permission or location not found yet
    const loc = location || { latitude: 37.7749, longitude: -122.4194 };

    // When using Google Maps tool, we CANNOT use responseSchema or responseMimeType: application/json.
    // We must parse the text manually.
    const prompt = `
      Find 5 distinct, popular, and high-quality dishes from highly-rated restaurants near the current location.
      
      CRITICAL FILTERS:
      - STRICTLY AVOID these taboo ingredients/diets: ${prefs.taboos || "None"}
      - Do NOT include foods with these tags/types: ${prefs.dislikes.join(", ") || "None"}
      
      For each item, provide the output in this EXACT JSON structure inside a list:
      [
        {
          "name": "Dish Name",
          "description": "Short appetizing description",
          "restaurantName": "Name of Restaurant",
          "address": "Address or approximate location",
          "calories": 0,
          "tags": ["tag1", "tag2"]
        }
      ]
      
      Return ONLY the raw JSON array. Do not use Markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: loc.latitude,
              longitude: loc.longitude
            }
          }
        }
      }
    });

    let text = response.text || "[]";
    // Clean up if the model adds markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", text);
      return getMockData();
    }

    if (!Array.isArray(data)) {
        return getMockData();
    }

    // Augment with IDs and Images
    return data.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`,
      imageUrl: getImageUrl(item.name),
      calories: item.calories || 500 // Fallback
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockData();
  }
};

const getMockData = (): FoodItem[] => [
  {
    id: '1',
    name: 'Avocado Toast',
    description: 'Creamy avocado spread on toasted sourdough with poached eggs and chili flakes.',
    tags: ['breakfast', 'healthy', 'vegetarian'],
    calories: 350,
    imageUrl: 'https://picsum.photos/id/1080/600/1000',
    restaurantName: "The Morning Brew",
    address: "123 Main St"
  },
  {
    id: '2',
    name: 'Truffle Mushroom Pasta',
    description: 'Handmade tagliatelle tossed in a rich truffle cream sauce with wild mushrooms.',
    tags: ['dinner', 'pasta', 'italian'],
    calories: 680,
    imageUrl: 'https://picsum.photos/id/1084/600/1000',
    restaurantName: "Luigi's Trattoria",
    address: "45 Olive Ave"
  },
  {
    id: '3',
    name: 'Spicy Tuna Roll',
    description: 'Fresh tuna with spicy mayo, cucumber, and sesame seeds.',
    tags: ['sushi', 'japanese', 'seafood'],
    calories: 320,
    imageUrl: 'https://picsum.photos/id/111/600/1000',
    restaurantName: "Sakura Sushi",
    address: "88 Fish Market Rd"
  }
];

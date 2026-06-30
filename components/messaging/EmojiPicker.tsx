"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Smile, Compass, Coffee, Star, Lightbulb, Flag } from "lucide-react";

// Standard emoji data categorized
const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys & People",
    icon: Smile,
    emojis: [
      { emoji: "😀", name: "grinning face", tags: ["smile", "happy"] },
      { emoji: "😃", name: "grinning face with big eyes", tags: ["smile", "happy"] },
      { emoji: "😄", name: "grinning face with smiling eyes", tags: ["smile", "happy"] },
      { emoji: "😁", name: "beaming face with smiling eyes", tags: ["smile", "happy"] },
      { emoji: "😆", name: "grinning squinting face", tags: ["smile", "happy", "laugh"] },
      { emoji: "😅", name: "grinning face with sweat", tags: ["hot", "sweat", "relief"] },
      { emoji: "🤣", name: "rolling on the floor laughing", tags: ["laugh", "lol"] },
      { emoji: "😂", name: "face with tears of joy", tags: ["laugh", "cry", "lol"] },
      { emoji: "🙂", name: "slightly smiling face", tags: ["smile"] },
      { emoji: "🙃", name: "upside-down face", tags: ["sarcasm", "silly"] },
      { emoji: "😉", name: "winking face", tags: ["wink", "flirt"] },
      { emoji: "😊", name: "smiling face with smiling eyes", tags: ["smile", "blush", "happy"] },
      { emoji: "😇", name: "smiling face with halo", tags: ["angel", "innocent"] },
      { emoji: "🥰", name: "smiling face with hearts", tags: ["love", "crush"] },
      { emoji: "😍", name: "smiling face with heart-eyes", tags: ["love", "crush", "heart"] },
      { emoji: "🤩", name: "star-struck", tags: ["excited", "star"] },
      { emoji: "😘", name: "face blowing a kiss", tags: ["love", "kiss"] },
      { emoji: "😗", name: "kissing face", tags: ["love", "kiss"] },
      { emoji: "☺", name: "smiling face", tags: ["smile", "happy"] },
      { emoji: "😚", name: "kissing face with closed eyes", tags: ["love", "kiss"] },
      { emoji: "😙", name: "kissing face with smiling eyes", tags: ["love", "kiss"] },
      { emoji: "😋", name: "face savoring food", tags: ["delicious", "tongue", "yum"] },
      { emoji: "😛", name: "face with tongue", tags: ["tongue", "silly"] },
      { emoji: "😜", name: "winking face with tongue", tags: ["tongue", "silly", "wink"] },
      { emoji: "🤪", name: "zany face", tags: ["silly", "crazy"] },
      { emoji: "😝", name: "squinting face with tongue", tags: ["tongue", "silly"] },
      { emoji: "🤑", name: "money-mouth face", tags: ["money", "rich"] },
      { emoji: "🤗", name: "hugging face", tags: ["hug", "friendly"] },
      { emoji: "🤭", name: "face with hand over mouth", tags: ["oops", "shock"] },
      { emoji: "🤫", name: "shushing face", tags: ["quiet", "shh"] },
      { emoji: "🤔", name: "thinking face", tags: ["think", "hmm"] },
      { emoji: "🤐", name: "zipper-mouth face", tags: ["secret", "quiet"] },
      { emoji: "🤨", name: "face with raised eyebrow", tags: ["suspicious", "skeptical"] },
      { emoji: "😐", name: "neutral face", tags: ["neutral", "meh"] },
      { emoji: "😑", name: "expressionless face", tags: ["annoyed", "meh"] },
      { emoji: "😶", name: "face without mouth", tags: ["quiet", "silent"] },
      { emoji: "😏", name: "smirking face", tags: ["smirk", "silly"] },
      { emoji: "😒", name: "unamused face", tags: ["bored", "annoyed"] },
      { emoji: "🙄", name: "face with rolling eyes", tags: ["bored", "annoyed", "roll"] },
      { emoji: "😬", name: "grimacing face", tags: ["oops", "grimace"] },
      { emoji: "🤥", name: "lying face", tags: ["liar", "pinocchio"] },
      { emoji: "😌", name: "relieved face", tags: ["relief", "peace"] },
      { emoji: "😔", name: "pensive face", tags: ["sad", "thoughtful"] },
      { emoji: "😪", name: "sleepy face", tags: ["sleepy", "tired"] },
      { emoji: "🤤", name: "drooling face", tags: ["drool", "delicious"] },
      { emoji: "😴", name: "sleeping face", tags: ["sleep", "zzz"] },
      { emoji: "😷", name: "face with medical mask", tags: ["sick", "doctor"] },
      { emoji: "🤒", name: "face with thermometer", tags: ["sick", "fever"] },
      { emoji: "🤕", name: "face with head-bandage", tags: ["hurt", "injury"] },
      { emoji: "🤢", name: "nauseated face", tags: ["sick", "gross"] },
      { emoji: "🤮", name: "face vomiting", tags: ["sick", "gross"] },
      { emoji: "🤧", name: "sneezing face", tags: ["sick", "cold"] },
      { emoji: "🥵", name: "hot face", tags: ["hot", "summer"] },
      { emoji: "🥶", name: "cold face", tags: ["cold", "winter"] },
      { emoji: "🥴", name: "woozy face", tags: ["dizzy", "drunk"] },
      { emoji: "😵", name: "knocked-out face", tags: ["dizzy", "dead"] },
      { emoji: "🤯", name: "exploding head", tags: ["mindblown", "shock"] },
      { emoji: "🤠", name: "cowboy hat face", tags: ["cowboy", "sheriff"] },
      { emoji: "🥳", name: "partying face", tags: ["party", "celebrate"] },
      { emoji: "😎", name: "smiling face with sunglasses", tags: ["cool", "sunglasses"] },
      { emoji: "🤓", name: "nerd face", tags: ["nerd", "smart"] },
      { emoji: "🧐", name: "face with monocle", tags: ["smart", "inspector"] },
      { emoji: "😕", name: "confused face", tags: ["confused", "meh"] },
      { emoji: "😟", name: "worried face", tags: ["worry", "sad"] },
      { emoji: "🙁", name: "slightly frowning face", tags: ["sad", "frown"] },
      { emoji: "😮", name: "face with open mouth", tags: ["shock", "surprised"] },
      { emoji: "😯", name: "hushed face", tags: ["shock", "surprised"] },
      { emoji: "😲", name: "astonished face", tags: ["shock", "surprised"] },
      { emoji: "😳", name: "flushed face", tags: ["blush", "embarrassed"] },
      { emoji: "🥺", name: "pleading face", tags: ["please", "sad", "puppy"] },
      { emoji: "😦", name: "frowning face with open mouth", tags: ["sad", "shock"] },
      { emoji: "😧", name: "anguished face", tags: ["sad", "shock"] },
      { emoji: "😨", name: "fearful face", tags: ["scared", "fear"] },
      { emoji: "😰", name: "anxious face with sweat", tags: ["scared", "sweat"] },
      { emoji: "😱", name: "face screaming in fear", tags: ["scared", "scream"] },
      { emoji: "😭", name: "loudly crying face", tags: ["sad", "cry"] },
      { emoji: "😡", name: "pouting face", tags: ["angry", "mad"] },
      { emoji: "😠", name: "angry face", tags: ["angry", "mad"] },
      { emoji: "👍", name: "thumbs up", tags: ["agree", "yes", "good"] },
      { emoji: "👎", name: "thumbs down", tags: ["disagree", "no"] },
      { emoji: "👌", name: "OK hand", tags: ["perfect", "ok"] },
      { emoji: "✌", name: "victory hand", tags: ["peace", "victory"] },
      { emoji: "👊", name: "oncoming fist", tags: ["fist", "punch"] },
      { emoji: "👋", name: "waving hand", tags: ["wave", "hello", "bye"] },
      { emoji: "🙌", name: "raising hands", tags: ["celebrate", "praise"] },
      { emoji: "👏", name: "clapping hands", tags: ["clap", "bravo"] },
      { emoji: "🙏", name: "folded hands", tags: ["please", "thankyou", "pray"] },
    ],
  },
  {
    id: "nature",
    name: "Animals & Nature",
    icon: Compass,
    emojis: [
      { emoji: "🐶", name: "dog face", tags: ["dog", "puppy", "pet"] },
      { emoji: "🐱", name: "cat face", tags: ["cat", "pet", "kitten"] },
      { emoji: "🐭", name: "mouse face", tags: ["mouse", "pet"] },
      { emoji: "🐹", name: "hamster face", tags: ["hamster", "pet"] },
      { emoji: "🐰", name: "rabbit face", tags: ["rabbit", "bunny"] },
      { emoji: "🦊", name: "fox face", tags: ["fox"] },
      { emoji: "🐻", name: "bear face", tags: ["bear"] },
      { emoji: "🐼", name: "panda face", tags: ["panda"] },
      { emoji: "🦁", name: "lion face", tags: ["lion"] },
      { emoji: "🐯", name: "tiger face", tags: ["tiger"] },
      { emoji: "🐨", name: "koala", tags: ["koala"] },
      { emoji: "🐵", name: "monkey face", tags: ["monkey"] },
      { emoji: "🦄", name: "unicorn", tags: ["unicorn", "fantasy"] },
      { emoji: "🐝", name: "honeybee", tags: ["bee", "bug"] },
      { emoji: "🌸", name: "cherry blossom", tags: ["flower", "spring"] },
      { emoji: "🌹", name: "rose", tags: ["flower", "love"] },
      { emoji: "🌺", name: "hibiscus", tags: ["flower", "tropical"] },
      { emoji: "🌻", name: "sunflower", tags: ["flower", "summer"] },
      { emoji: "🌱", name: "seedling", tags: ["plant", "nature"] },
      { emoji: "🌲", name: "evergreen tree", tags: ["tree", "nature"] },
      { emoji: "🍂", name: "fallen leaf", tags: ["leaf", "autumn"] },
      { emoji: "🍁", name: "maple leaf", tags: ["leaf", "canada"] },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: Coffee,
    emojis: [
      { emoji: "🍎", name: "red apple", tags: ["apple", "fruit"] },
      { emoji: "🍌", name: "banana", tags: ["banana", "fruit"] },
      { emoji: "🍉", name: "watermelon", tags: ["watermelon", "fruit"] },
      { emoji: "🍇", name: "grapes", tags: ["grapes", "fruit"] },
      { emoji: "🍓", name: "strawberry", tags: ["strawberry", "fruit"] },
      { emoji: "🍒", name: "cherries", tags: ["cherries", "fruit"] },
      { emoji: "🍍", name: "pineapple", tags: ["pineapple", "fruit", "tropical"] },
      { emoji: "🍕", name: "pizza", tags: ["pizza", "junkfood"] },
      { emoji: "🍔", name: "hamburger", tags: ["burger", "junkfood"] },
      { emoji: "🍟", name: "french fries", tags: ["fries", "junkfood"] },
      { emoji: "🌭", name: "hot dog", tags: ["hotdog", "junkfood"] },
      { emoji: "🍰", name: "shortcake", tags: ["cake", "dessert"] },
      { emoji: "🍩", name: "donut", tags: ["donut", "dessert"] },
      { emoji: "🍪", name: "cookie", tags: ["cookie", "dessert"] },
      { emoji: "🍫", name: "chocolate bar", tags: ["chocolate", "dessert"] },
      { emoji: "🍬", name: "candy", tags: ["candy", "dessert"] },
      { emoji: "🍺", name: "beer mug", tags: ["beer", "alcohol", "drink"] },
      { emoji: "🍷", name: "wine glass", tags: ["wine", "alcohol", "drink"] },
      { emoji: "☕", name: "hot beverage", tags: ["coffee", "tea", "drink"] },
      { emoji: "🥤", name: "cup with straw", tags: ["soda", "drink"] },
    ],
  },
  {
    id: "activity",
    name: "Activity & Travel",
    icon: Star,
    emojis: [
      { emoji: "⚽", name: "soccer ball", tags: ["soccer", "football", "sports"] },
      { emoji: "🏀", name: "basketball", tags: ["basketball", "sports"] },
      { emoji: "🏈", name: "american football", tags: ["football", "sports"] },
      { emoji: "⚾", name: "baseball", tags: ["baseball", "sports"] },
      { emoji: "🎾", name: "tennis", tags: ["tennis", "sports"] },
      { emoji: "🏐", name: "volleyball", tags: ["volleyball", "sports"] },
      { emoji: "🏆", name: "trophy", tags: ["win", "champion"] },
      { emoji: "🎮", name: "video game", tags: ["game", "controller"] },
      { emoji: "✈", name: "airplane", tags: ["plane", "travel", "flight"] },
      { emoji: "🚗", name: "automobile", tags: ["car", "travel"] },
      { emoji: "🚲", name: "bicycle", tags: ["bike", "sports"] },
      { emoji: "🚢", name: "ship", tags: ["ship", "boat", "cruise"] },
      { emoji: "🌋", name: "volcano", tags: ["volcano", "nature"] },
      { emoji: "🏢", name: "office building", tags: ["building", "office"] },
      { emoji: "🏨", name: "hotel", tags: ["hotel", "building", "stay"] },
      { emoji: "🏖", name: "beach with umbrella", tags: ["beach", "vacation"] },
    ],
  },
  {
    id: "objects",
    name: "Objects & Symbols",
    icon: Lightbulb,
    emojis: [
      { emoji: "💡", name: "light bulb", tags: ["light", "idea"] },
      { emoji: "💻", name: "laptop", tags: ["computer", "tech"] },
      { emoji: "📱", name: "mobile phone", tags: ["phone", "tech"] },
      { emoji: "✉", name: "envelope", tags: ["mail", "letter"] },
      { emoji: "🔑", name: "key", tags: ["key", "lock", "room"] },
      { emoji: "🎁", name: "wrapped gift", tags: ["gift", "present"] },
      { emoji: "🎈", name: "balloon", tags: ["balloon", "party"] },
      { emoji: "📷", name: "camera", tags: ["camera", "photo"] },
      { emoji: "📚", name: "books", tags: ["book", "read"] },
      { emoji: "💰", name: "money bag", tags: ["money", "rich"] },
      { emoji: "🔥", name: "fire", tags: ["fire", "hot", "cool"] },
      { emoji: "✨", name: "sparkles", tags: ["sparkle", "magic", "stars"] },
      { emoji: "⭐", name: "star", tags: ["star", "favorite"] },
      { emoji: "❤", name: "red heart", tags: ["heart", "love"] },
      { emoji: "🎉", name: "party popper", tags: ["celebrate", "party"] },
    ],
  },
  {
    id: "flags",
    name: "Flags",
    icon: Flag,
    emojis: [
      { emoji: "🇮🇳", name: "flag: India", tags: ["india", "flag"] },
      { emoji: "🇺🇸", name: "flag: United States", tags: ["usa", "flag"] },
      { emoji: "🇬🇧", name: "flag: United Kingdom", tags: ["uk", "flag"] },
      { emoji: "🇯🇵", name: "flag: Japan", tags: ["japan", "flag"] },
      { emoji: "🇩🇪", name: "flag: Germany", tags: ["germany", "flag"] },
      { emoji: "🇫🇷", name: "flag: France", tags: ["france", "flag"] },
      { emoji: "🇨🇦", name: "flag: Canada", tags: ["canada", "flag"] },
      { emoji: "🇦🇺", name: "flag: Australia", tags: ["australia", "flag"] },
    ],
  },
];

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

export default function EmojiPicker({ onSelectEmoji }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("booknest_recent_emojis");
        return stored ? JSON.parse(stored) : [];
      }
    } catch (e) {
      console.error("Failed to load recent emojis:", e);
    }
    return [];
  });
  
  // Hover preview state
  const [hoveredEmoji, setHoveredEmoji] = useState<{ emoji: string; name: string } | null>(null);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter emojis by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return EMOJI_CATEGORIES;
    const query = searchQuery.toLowerCase();

    return EMOJI_CATEGORIES.map((cat) => {
      const matching = cat.emojis.filter(
        (em) => em.name.includes(query) || em.tags.some((t) => t.includes(query))
      );
      return { ...cat, emojis: matching };
    }).filter((cat) => cat.emojis.length > 0);
  }, [searchQuery]);

  // Handle emoji click
  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);

    // Update recents
    setRecents((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 16);
      try {
        localStorage.setItem("booknest_recent_emojis", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save recent emojis:", e);
      }
      return next;
    });
  };

  // Jump scroll to category section
  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = categoryRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-[300px] h-[380px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden relative select-none">
      
      {/* Category Icons Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 bg-slate-50/50">
        {EMOJI_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              className={`p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
                activeCategory === cat.id ? "text-brand-700 bg-brand-50/50" : "text-slate-400"
              }`}
              title={cat.name}
            >
              <Icon className="h-4.5 w-4.5" />
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="w-full bg-slate-100 border border-transparent rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-200 transition"
          />
        </div>
      </div>

      {/* Emoji Scroll Area */}
      <div
        ref={categoriesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar"
      >
        {/* Recents Category (if search is empty and recents exist) */}
        {!searchQuery && recents.length > 0 && (
          <div className="space-y-1.5 text-left">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">Recently Used</span>
            <div className="grid grid-cols-8 gap-1">
              {recents.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleEmojiClick(em)}
                  onMouseEnter={() => setHoveredEmoji({ emoji: em, name: "Recent Emoji" })}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  className="h-7 w-7 flex items-center justify-center text-lg hover:scale-[1.2] transition-transform duration-100 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Categories */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No matching emojis
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              ref={(el) => {
                categoryRefs.current[cat.id] = el;
              }}
              className="space-y-1.5 text-left"
            >
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">
                {cat.name}
              </span>
              <div className="grid grid-cols-8 gap-1">
                {cat.emojis.map((em) => (
                  <button
                    key={em.emoji}
                    type="button"
                    onClick={() => handleEmojiClick(em.emoji)}
                    onMouseEnter={() => setHoveredEmoji({ emoji: em.emoji, name: em.name })}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    className="h-7 w-7 flex items-center justify-center text-lg hover:scale-[1.25] transition-transform duration-75 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    {em.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hover Preview Bar (Bottom Footer - Slack Style) */}
      <div className="h-12 border-t border-slate-100 px-3 py-1.5 bg-slate-50/50 flex items-center gap-2.5 shrink-0 text-left">
        {hoveredEmoji ? (
          <>
            <span className="text-2xl shrink-0 animate-fade-in">{hoveredEmoji.emoji}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate max-w-[220px]">
              :{hoveredEmoji.name.replace(/\s+/g, "_")}:
            </span>
          </>
        ) : (
          <>
            <Smile className="h-5 w-5 text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Choose an emoji...
            </span>
          </>
        )}
      </div>

    </div>
  );
}

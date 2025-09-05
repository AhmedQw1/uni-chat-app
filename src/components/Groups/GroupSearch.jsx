import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth } from "../../contexts/AuthContext";
import useGroups from "../../hooks/useGroups";

// Advanced search function with multiple matching strategies
function getAdvancedMatches(groups, searchText) {
  const search = searchText.trim().toLowerCase();
  if (!search) return [];

  return groups
    .map(group => {
      const name = group.name.toLowerCase();
      const words = name.split(/[\s\-&]+/); // Split on spaces, hyphens, and ampersands
      const searchWords = search.split(/\s+/);
      
      let score = 0;
      
      // Exact match (highest priority)
      if (name === search) score += 100;
      
      // Name starts with search
      if (name.startsWith(search)) score += 50;
      
      // Name contains search
      if (name.includes(search)) score += 30;
      
      // Any word starts with search
      if (words.some(word => word.startsWith(search))) score += 40;
      
      // Any word contains search
      if (words.some(word => word.includes(search))) score += 20;
      
      // Multiple word search - all words must match
      if (searchWords.length > 1) {
        const allWordsMatch = searchWords.every(searchWord => 
          words.some(word => word.includes(searchWord)) || name.includes(searchWord)
        );
        if (allWordsMatch) score += 35;
      }
      
      // Fuzzy matching for common abbreviations
      const abbreviations = {
        'cs': ['computer science', 'computer skills'],
        'se': ['software engineering', 'special education'],
        'ai': ['artificial intelligence'],
        'hr': ['human resource'],
        'pr': ['public relations'],
        'mis': ['management information systems'],
        'ce': ['computer engineering', 'civil engineering'],
        'is': ['islamic studies', 'information systems'],
        'ba': ['business analytics'],
        'fb': ['finance and banking']
      };
      
      if (abbreviations[search]) {
        abbreviations[search].forEach(fullName => {
          if (name.includes(fullName)) score += 45;
        });
      }
      
      // Subject-based matching
      const subjectKeywords = {
        'engineering': ['civil', 'computer', 'software', 'networks'],
        'language': ['arabic', 'english'],
        'management': ['human resource', 'business', 'finance'],
        'media': ['digital', 'communication', 'advertising', 'journalism'],
        'science': ['computer', 'data', 'analytics'],
        'education': ['special', 'physical'],
        'health': ['nursing', 'nutrition', 'pharmacy', 'dental']
      };
      
      Object.entries(subjectKeywords).forEach(([category, keywords]) => {
        if (search.includes(category) || keywords.some(keyword => search.includes(keyword))) {
          if (keywords.some(keyword => name.includes(keyword))) {
            score += 25;
          }
        }
      });
      
      return { ...group, score };
    })
    .filter(group => group.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export default function GroupSearchBar() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const { currentUser } = useAuth();
  const { allGroups, loading } = useGroups(currentUser?.major);

  // Combine all groups into a single array for searching - memoized to prevent re-renders
  const allGroupsArray = useMemo(() => [
    ...allGroups.majorSpecific,
    ...allGroups.general,
    ...allGroups.courses
  ], [allGroups.majorSpecific, allGroups.general, allGroups.courses]);

  // Debounce the search value by 300ms
  const debouncedSearch = useDebounce(search, 300);

  // Update suggestions on debounced input
  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setSuggestions([]);
      return;
    }
    setSuggestions(getAdvancedMatches(allGroupsArray, debouncedSearch).slice(0, 10)); // Show top 10 matches
  }, [debouncedSearch, allGroupsArray]);

  // Handle selection
  function handleSelect(group) {
    setSearch("");
    setSuggestions([]);
    navigate(`/groups/${group.id}`);
  }

  // Keyboard navigation for accessibility
  const [activeIndex, setActiveIndex] = useState(-1);
  function handleKeyDown(e) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActiveIndex(prev => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(suggestions[activeIndex]);
      e.preventDefault();
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="flex items-center border rounded-lg bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none bg-transparent text-sm"
          placeholder={loading ? "Loading groups..." : "Search for a group..."}
          disabled={loading}
        />
      </div>
      {focused && search.trim() && (
        <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border">
          {suggestions.length === 0 && !loading ? (
            <div className="p-3 text-gray-500 text-sm">No groups found.</div>
          ) : (
            suggestions.map((group, idx) => (
              <button
                key={group.id}
                onMouseDown={() => handleSelect(group)}
                className={`w-full text-left px-4 py-2 hover:bg-primary hover:text-white rounded ${
                  idx === activeIndex ? "bg-primary text-white" : ""
                }`}
                tabIndex={-1}
              >
                <span className="font-bold">{group.name}</span>
                {group.description && (
                  <span className="ml-2 text-gray-500 text-xs">{group.description}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
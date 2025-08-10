import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "../../hooks/useDebounce"; // Add this hook

// Helper for fuzzy matching
function getFuzzyMatches(groups, text) {
  const pattern = text.trim().toLowerCase();
  if (!pattern) return [];
  // Simple fuzzy scoring (edit for more advanced if needed)
  return groups
    .map(group => ({
      ...group,
      score: group.name.toLowerCase().startsWith(pattern)
        ? 2
        : group.name.toLowerCase().includes(pattern)
        ? 1
        : 0,
    }))
    .filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export default function GroupSearchBar() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef();

  // Fetch groups on mount
  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      try {
        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, orderBy("name"), limit(100)); // Adjust limit as needed
        const snapshot = await getDocs(q);
        const groupList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupList);
        setLoading(false);
      } catch (err) {
        setError("Failed to load groups.");
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  // Debounce the search value by 300ms
  const debouncedSearch = useDebounce(search, 300);

  // Update suggestions on debounced input
  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setSuggestions([]);
      return;
    }
    setSuggestions(getFuzzyMatches(groups, debouncedSearch).slice(0, 8)); // Show top 8 matches
  }, [debouncedSearch, groups]);

  // Handle selection
  function handleSelect(group) {
    setSearch("");
    setSuggestions([]);
    navigate(`/groups/${group.id}`); // Fixed route
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
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}
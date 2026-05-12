"use client";
import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { ImSpinner2 } from "react-icons/im"; // You may install this or replace with any spinner
import { formatPrice } from "@/utils/priceFormatter";

const SearchIcon = ({ onClose }) => {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearch = (value) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
      setSearchValue("");
      setShowDropdown(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(searchValue);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Fetch suggestions when input changes
  useEffect(() => {
    if (searchValue.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setLoading(true);

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchValue)}`,
        );
        const { data } = await res.json();
        logger.log("data", data);

        // Filter to only show products
        // const productsOnly = data.filter(
        //   (item) =>
        //     item.subtype === "product" ||
        //     item.object_type === "product" ||
        //     item.type === "product"
        // );

        // setSuggestions(productsOnly.slice(0, 6));
        // const filtered = data.filter(
        //   (item) =>
        //     (item.subtype === "product" || item.object_type === "product") &&
        //     (item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        //       item.title?.rendered
        //         ?.toLowerCase()
        //         .includes(searchValue.toLowerCase()))
        // );
        const filtered = data.filter((item) => {
          const isProduct =
            item.subtype === "product" || item.object_type === "product";
          const isPublished = item.status === "publish";
          const isVisible = item.catalog_visibility === "visible";
          const notTestCopy = !item.name?.toLowerCase().includes("copy");

          const matchesQuery =
            item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.title?.rendered
              ?.toLowerCase()
              .includes(searchValue.toLowerCase());

          return (
            isProduct && isPublished && isVisible && notTestCopy && matchesQuery
          );
        });

        setSuggestions(filtered.slice(0, 6));
      } catch (err) {
        logger.error("Search error:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-[420px]">
      <div className="flex items-center bg-white border border-gray-300 rounded-[64px] h-[48px] px-6 py-[14px]">
        <CiSearch size={20} className="text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          className="w-full outline-none text-gray-800 placeholder-gray-400 text-[14px]"
          placeholder="Search for a treatment or medication"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {searchValue.trim() && (
          <button
            onClick={() => handleSearch(searchValue)}
            className="px-3 py-1 bg-gray-600 text-white leading-[140%] text-xs rounded-full hover:bg-gray-700 transition-colors"
          >
            Search
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-72 overflow-auto"
        >
          {loading && (
            <li className="px-4 py-4 text-center text-gray-500">
              <ImSpinner2 className="animate-spin inline-block mr-2" />
              Loading...
            </li>
          )}

          {!loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              No results found
            </li>
          )}

          {/* Product Results */}
          {!loading &&
            suggestions.map((item) => (
              <li
                key={item.id}
                className="border-b border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3"
                onClick={() => {
                  // Navigate directly to the product page
                  if (item.link) {
                    router.push(item.link);
                  } else if (item.slug) {
                    router.push(`/product/${item.slug}`);
                  } else {
                    // Fallback to search page
                    handleSearch(
                      item.title?.rendered || item.name || item.slug,
                    );
                  }
                  setSearchValue("");
                  setShowDropdown(false);
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title?.rendered || item.name || item.slug}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-gray-900 text-sm truncate"
                    dangerouslySetInnerHTML={{
                      __html: item.title?.rendered || item.name || item.slug,
                    }}
                  />
                  {item.price && (
                    <div className="text-xs text-gray-500 mt-1">
                      ${formatPrice(item.price)}
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default SearchIcon;

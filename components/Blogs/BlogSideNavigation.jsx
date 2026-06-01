"use client";

import { useMemo, useState, useEffect } from "react";

const BlogSideNavigation = ({ html, loading = false }) => {
  const [activeSection, setActiveSection] = useState("");

  // Function to normalize HTML entities and clean text
  const normalizeText = (text) => {
    return text
      .replace(/&#8217;/g, "'") // Convert HTML apostrophe to regular apostrophe
      .replace(/&#8216;/g, "'") // Convert HTML left single quote to regular apostrophe
      .replace(/&#8220;/g, '"') // Convert HTML left double quote to regular quote
      .replace(/&#8221;/g, '"') // Convert HTML right double quote to regular quote
      .replace(/&amp;/g, '&') // Convert HTML ampersand to regular ampersand
      .replace(/&lt;/g, '<') // Convert HTML less than to regular <
      .replace(/&gt;/g, '>') // Convert HTML greater than to regular >
      .replace(/&quot;/g, '"') // Convert HTML quote to regular quote
      .replace(/&#39;/g, "'") // Convert HTML apostrophe to regular apostrophe
      .trim();
  };

  const headings = useMemo(() => {
    if (!html) return [];
    
    const matches = [];
    const seenTexts = new Set(); // Track seen normalized text content to prevent duplicates
    const seenSlugs = new Set(); // Track seen slugs to prevent duplicate IDs
    
    // Extract all headings (h1, h2, h3, h4, h5, h6) - use non-greedy matching
    const headingRegex = /<(h[1-6])[^>]*>([^<]*(?:<[^>]*>[^<]*)*?)<\/\1>/gi;
    let headingMatch;
    
    while ((headingMatch = headingRegex.exec(html)) !== null) {
      const tagName = headingMatch[1];
      const content = headingMatch[2];
      
      // Extract text content from the heading and normalize it
      const rawTextContent = content.replace(/<[^>]*>/g, '').trim();
      const normalizedTextContent = normalizeText(rawTextContent);
      
      // Skip empty headings or headings with only whitespace/nbsp
      const isEmpty = !normalizedTextContent || 
                     normalizedTextContent === '' || 
                     normalizedTextContent === '&nbsp;' ||
                     /^\s*$/.test(normalizedTextContent);
      
      if (!isEmpty && !seenTexts.has(normalizedTextContent)) {
        // Create a slug from the normalized text for the href
        const slug = normalizedTextContent.toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .trim();
        
        // Only add if we haven't seen this normalized text or slug before
        if (!seenSlugs.has(slug)) {
          seenTexts.add(normalizedTextContent);
          seenSlugs.add(slug);
          matches.push({
            text: normalizedTextContent,
            slug: slug,
            level: parseInt(tagName.charAt(1)),
            type: 'heading'
          });
        }
      }
    }
    
    
    return matches;
  }, [html]);

  // Track which section is currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (slug) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (loading) {
    return (
      <div className="lg:col-span-3 col-span-12 sm:mb-4">
        <div className="">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (headings.length === 0) {
    return null;
  }

  // Determine the smallest heading level present to normalize indentation
  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1;

  return (
    <div className="lg:col-span-3 col-span-12 sm:mb-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <div className="">

        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Content
        </h3>
        <nav className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-1">
            {headings.map((heading, index) => {
              const isActive = activeSection === heading.slug;
              // Normalize indentation relative to the smallest level used in this article
              const depth = Math.max(0, heading.level - minLevel);
              // Map depth to fixed, purgable Tailwind margin classes so base left padding from `p-3` is preserved
              const depthToIndent = ["ml-0", "ml-2", "ml-4", "ml-6", "ml-8"]; // capped at ml-8
              const indentClass = depthToIndent[Math.min(depth, depthToIndent.length - 1)];
              
              return (
                <button
                  key={index}
                  onClick={() => scrollToHeading(heading.slug)}
                  className={`relative block w-full text-left text-sm rounded transition-all duration-200  p-3 ${indentClass} ${
                    isActive 
                      ? 'text-black font-bold bg-gray-100 border-l-2 border-l-gray-400' 
                      : 'text-gray-700 hover:text-black hover:font-bold hover:border-l-2 hover:border-l-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {/* Active section indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                  )}
                  
                  <span className="">{heading.text}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default BlogSideNavigation;

import React, { useState, useEffect, useMemo } from 'react';

export const HERO_PHRASES = [
  {
    id: 1,
    line1: "Search and Find",
    line2: [
      { text: "Luxury", isHighlight: true },
      { text: " House", isHighlight: false }
    ],
    fullText: "Search and Find Luxury House"
  },
  {
    id: 2,
    line1: "Discover Your Perfect",
    line2: [
      { text: "Luxury", isHighlight: true },
      { text: " Home", isHighlight: false }
    ],
    fullText: "Discover Your Perfect Luxury Home"
  },
  {
    id: 3,
    line1: "Find Premium Properties",
    line2: [
      { text: "With ", isHighlight: false },
      { text: "QUIREX", isHighlight: true }
    ],
    fullText: "Find Premium Properties With QUIREX"
  }
];


export const useTypewriterHeadline = (phrases = HERO_PHRASES, options = {}) => {
  const {
    typingSpeed = 80,
    deletingSpeed = 45,
    pauseDuration = 1800,
    emptyPauseDuration = 280
  } = options;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);


  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const currentPhrase = phrases[phraseIndex] || phrases[0];

  const line1Len = currentPhrase.line1.length;
  const line2Len = useMemo(() => {
    return currentPhrase.line2.reduce((acc, seg) => acc + seg.text.length, 0);
  }, [currentPhrase]);

  const totalChars = line1Len + line2Len;

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && charCount === totalChars) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && charCount === 0) {
      const delayNext = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, emptyPauseDuration);
      return () => clearTimeout(delayNext);
    }

    const currentSpeed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(() => {
      setCharCount((prev) => prev + (isDeleting ? -1 : 1));
    }, currentSpeed);

    return () => clearTimeout(timer);
  }, [
    charCount,
    isDeleting,
    isPaused,
    totalChars,
    prefersReducedMotion,
    pauseDuration,
    emptyPauseDuration,
    deletingSpeed,
    typingSpeed,
    phrases.length
  ]);

  // Compute displayed lines & highlight slices
  const renderedState = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        line1Text: currentPhrase.line1,
        line2Segments: currentPhrase.line2,
        cursorLine: null
      };
    }

    if (charCount <= line1Len) {
      return {
        line1Text: currentPhrase.line1.substring(0, charCount),
        line2Segments: [],
        cursorLine: 1
      };
    }

    const remainingForLine2 = charCount - line1Len;
    let accumulated = 0;
    const line2Segments = [];

    for (const segment of currentPhrase.line2) {
      if (accumulated >= remainingForLine2) break;
      const needed = remainingForLine2 - accumulated;
      const textToTake = segment.text.substring(0, needed);
      if (textToTake.length > 0) {
        line2Segments.push({
          text: textToTake,
          isHighlight: segment.isHighlight
        });
      }
      accumulated += segment.text.length;
    }

    return {
      line1Text: currentPhrase.line1,
      line2Segments,
      cursorLine: 2
    };
  }, [charCount, currentPhrase, line1Len, prefersReducedMotion]);

  return {
    ...renderedState,
    prefersReducedMotion,
    fullText: currentPhrase.fullText
  };
};

const HeroTypewriter = ({ phrases = HERO_PHRASES, className = "" }) => {
  const { line1Text, line2Segments, cursorLine, prefersReducedMotion, fullText } = useTypewriterHeadline(phrases);

  return (
    <h1 className={`quirex-luxury-headline ${className}`.trim()} aria-label={fullText}>
      {/* Line 1 */}
      <span className="quirex-headline-line quirex-headline-line-1">
        <span className="quirex-headline-text-content">
          {line1Text || <span className="quirex-invisible-spacer" aria-hidden="true">&nbsp;</span>}
        </span>
        {cursorLine === 1 && !prefersReducedMotion && (
          <span className="quirex-headline-cursor" aria-hidden="true" />
        )}
      </span>

      {/* Line 2 */}
      <span className="quirex-headline-line quirex-headline-line-2">
        <span className="quirex-headline-text-content">
          {line2Segments.length > 0 ? (
            line2Segments.map((segment, index) => (
              <span
                key={index}
                className={segment.isHighlight ? "highlight" : ""}
              >
                {segment.text}
              </span>
            ))
          ) : (
            <span className="quirex-invisible-spacer" aria-hidden="true">&nbsp;</span>
          )}
        </span>
        {cursorLine === 2 && !prefersReducedMotion && (
          <span className="quirex-headline-cursor" aria-hidden="true" />
        )}
      </span>
    </h1>
  );
};

export default HeroTypewriter;

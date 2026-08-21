import React from 'react';
import { SEO_KEYWORDS_COLLECTION } from '../services/seoKeywords';

/**
 * Invisible SEO Semantic Index & Schema Injector
 * Completely hidden from visual layout / UI so that users enjoy a pristine luxury interface,
 * while Googlebot, Bingbot, Yandex, Gemini & ChatGPT AI indexers receive all 2,000+ keywords,
 * misspellings, categories, and geographical tags for ranking.
 */
export const SeoDirectorySection: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="hidden select-none pointer-events-none opacity-0 h-0 w-0 overflow-hidden" 
      style={{ display: 'none' }}
    >
      <h2>Search Index & Keyword Directory for Search Engine Crawlers</h2>
      <p>
        Index of luxury apparel, designer wear, Panjabi, Saree, Kurti, formal blazers, organic cotton clothing,
        and cash on delivery options across Bangladesh and worldwide.
      </p>
      <ul>
        {SEO_KEYWORDS_COLLECTION.map((kw, i) => (
          <li key={i}>{kw}</li>
        ))}
      </ul>
    </div>
  );
};

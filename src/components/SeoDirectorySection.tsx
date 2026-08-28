import React, { useEffect } from 'react';
import { SEO_KEYWORDS_COLLECTION, generateStoreJsonLd } from '../services/seoKeywords';
import { StoreConfig, Product } from '../types';

interface SeoDirectorySectionProps {
  config?: StoreConfig;
  products?: Product[];
}

/**
 * Invisible SEO Semantic Index & Schema Injector
 * Completely hidden from visual layout / UI so that users enjoy a pristine luxury interface,
 * while Googlebot, Bingbot, Yandex, Gemini & ChatGPT AI indexers receive all 1,500+ keywords,
 * domain extensions (www, .com, .in, .gov, .bd, .shop, etc.), misspellings, categories, and geographical tags for ranking.
 */
export const SeoDirectorySection: React.FC<SeoDirectorySectionProps> = ({ config, products }) => {
  useEffect(() => {
    // Dynamically inject/refresh JSON-LD schema in document head
    if (config && products) {
      const scriptId = 'bismillah-jsonld-schema';
      let scriptElem = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptElem) {
        scriptElem = document.createElement('script');
        scriptElem.id = scriptId;
        scriptElem.type = 'application/ld+json';
        document.head.appendChild(scriptElem);
      }
      try {
        const schema = generateStoreJsonLd(config, products);
        scriptElem.textContent = JSON.stringify(schema);
      } catch (e) {
        console.warn('Failed to update SEO JSON-LD schema:', e);
      }
    }
  }, [config, products]);

  return (
    <div 
      aria-hidden="true" 
      className="hidden select-none pointer-events-none opacity-0 h-0 w-0 overflow-hidden" 
      style={{ display: 'none' }}
    >
      <h2>Bismillah Collection Search Engine Index & Comprehensive Keyword Directory</h2>
      <p>
        Full semantic index of luxury and affordable apparel, Panjabi, Saree, Three Piece, Kurti, Abaya, Borka,
        Shirts, T-Shirts, Pants, Jeans, Winter Collection, Eid Collection, and fast Cash on Delivery across all 64 districts
        of Bangladesh and worldwide shipping queries.
      </p>
      <nav aria-label="SEO Domain and Brand Index">
        <ul>
          {SEO_KEYWORDS_COLLECTION.map((kw, i) => (
            <li key={i}>{kw}</li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

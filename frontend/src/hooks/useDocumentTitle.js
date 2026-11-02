import { useEffect } from 'react';

/**
 * Custom hook to update document title and meta description dynamically
 * @param {string} title - Page title
 * @param {string} description - Meta description
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | NJS Property Group`;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}


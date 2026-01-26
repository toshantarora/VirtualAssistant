import { useEffect } from 'react';

/**
 * Custom hook to set page title and meta tags
 * @param {string} title - Page title
 * @param {string} description - Page description for meta tag
 */
export const useDocumentTitle = (title, description = 'Usage Monitor - Healthcare Management System') => {
  useEffect(() => {
    // Set document title
    const previousTitle = document.title;
    document.title = title ? `${title} | Usage Monitor` : 'Usage Monitor';

    // Set or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    const previousDescription = metaDescription.content;
    metaDescription.content = description;

    // Cleanup: restore previous values when component unmounts
    return () => {
      document.title = previousTitle;
      if (metaDescription) {
        metaDescription.content = previousDescription;
      }
    };
  }, [title, description]);
};

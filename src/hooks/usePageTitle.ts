import { useEffect } from "react";

const SITE_NAME = "The Skills Mine";

/**
 * Sets `document.title` for the current page, restoring the previous title on unmount.
 * Pass just the page-specific segment; " - The Skills Mine" is appended automatically.
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} - ${SITE_NAME}`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

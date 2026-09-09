"use client";

import { useEffect } from "react";

export default function LoadingCursor({
  loading,
}: {
  loading: boolean;
}) {
  useEffect(() => {
    if (loading) {
      document.body.classList.add("is-loading");
    } else {
      document.body.classList.remove("is-loading");
    }
    return () => {
      document.body.classList.remove("is-loading");
    };
  }, [loading]);
  return null;
}
 

// components/HtmlClassClient.tsx
'use client';

import { useEffect } from 'react';

export default function HtmlClassClient() {
  useEffect(() => {
    document.documentElement.classList.add('mdl-js');
  }, []);

  return null;
}

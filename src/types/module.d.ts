// Type declarations for modules that might not have TypeScript definitions

declare module '@/types/database.types' {
  const content: {
    Database: any;
    Json: any;
  };
  export default content;
}

// Declaration for common file types
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module '*.pdf' {
  const content: any;
  export default content;
}

// Declaration for next/navigation
declare module 'next/navigation' {
  export * from 'react-router-dom';
  // Add any specific exports that your code needs
  export const useRouter: any;
  export const useSearchParams: any;
  export const usePathname: any;
}

// Declaration for Supabase modules if needed
declare module '@supabase/supabase-js' {
  export * from '@supabase/supabase-js/dist/main/index';
}
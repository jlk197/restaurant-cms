export interface PageItem {
  id: number;
  title: string;
  description: string;
  type: 'hero' | 'text' | 'promo' | string; // Typy sekcji
  
  // Pola z page_content
  image_url?: string;
  is_active: boolean;
  position?: number;
}

export interface PageItemFormData {
  id?: number;
  title: string;
  description: string;
  type: string;
  image_url: string;
  position?: number;
  is_active: boolean;
}
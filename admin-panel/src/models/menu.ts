export interface MenuItem {
  // Pola własne (z tabeli menu_item)
  id: number;
  name: string;
  description: string;
  price: string; // Backend (Postgres) często zwraca typ DECIMAL/NUMERIC jako string, aby zachować precyzję
  currency_id?: number;
  currency_code?: string; // Np. "PLN" (z backendowego JOIN-a)

  // Pola dziedziczone (z tabeli page_content)
  image_url?: string;
  is_active: boolean;
  position?: number;
  item_type?: 'Menu_Item';
  creation_time?: string;
}

// Opcjonalnie: Typ pomocniczy do formularza (gdzie ID jest opcjonalne przy tworzeniu)
export interface MenuItemFormData {
  id?: number;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  currency_id?: number;
  is_active?: boolean;
  position?: number;
}
export type ContentType = 'Chef' | 'Menu_Item' | 'Page_Item';

export interface MasterContentItem {

  id: number;
  item_type: ContentType;
  image_url: string;
  is_active: boolean;
  position: number;
  creation_time: string;

  display_name: string;
  info_label?: string; 
}
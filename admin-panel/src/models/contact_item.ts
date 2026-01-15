export interface ContactItem {
  id: number;
  value: string;
  contact_type_id: number;
  contact_type_value: string;
  contact_type_icon_url?: string;
  is_active: boolean;
  creator_id: number;
  creation_time: string;
  last_modification_time: string;
  last_modificator_id: number;
}

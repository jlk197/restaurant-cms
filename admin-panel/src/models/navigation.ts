export type LinkType = "internal" | "external" | "anchor";

export interface Navigation {
  id: number;
  title: string;
  position: number;
  url: string;
  link_type: LinkType;
  is_active: boolean;
  navigation_id: number | null;
  creation_time: string;
  creator_id: number | null;
  last_modification_time: string | null;
  last_modificator_id: number | null;
}

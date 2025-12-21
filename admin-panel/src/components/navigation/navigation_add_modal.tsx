import React, { useState, useEffect } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { Navigation } from "../../models/navigation";
import navigationService from "../../services/navigationService";
import administratorService from "../../services/administratorService";
import pageService from "../../services/pageService";
import { Page } from "../../models/page";
import { useApi } from "../../hooks/useApi";
import { useCallback } from "react";

interface NavigationAddModalProps {
  editedNavigation?: Navigation | null;
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export default function NavigationAddModal({
  editedNavigation,
  isOpen,
  closeModal,
  onSuccess,
}: NavigationAddModalProps) {
  const [formData, setFormData] = useState<
    Omit<
      Navigation,
      "id" | "creation_time" | "last_modification_time" | "last_modificator_id"
    >
  >({
    title: "",
    position: 1,
    url: "",
    link_type: "internal",
    is_active: true,
    navigation_id: null,
    creator_id: null,
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch pages for internal links
  const { data: pages, execute: fetchPages } = useApi<Page[]>(
    useCallback(() => pageService.getAll(), []),
    "Cannot get pages"
  );

  // Fetch all navigation items for parent selection
  const { data: allNavigations, execute: fetchNavigations } = useApi<
    Navigation[]
  >(
    useCallback(() => navigationService.getAll(), []),
    "Cannot get navigation items"
  );

  // Predefined anchor sections
  const anchorSections = [
    { value: "#home", label: "Home" },
    { value: "#about", label: "About Us" },
    { value: "#menu", label: "Our Menu" },
    { value: "#chefs", label: "Our Chefs" },
    { value: "#contact", label: "Contact Us" },
  ];

  // Recursive function to build hierarchical navigation list
  const buildHierarchicalList = (
    parentId: number | null = null,
    level: number = 0
  ): { nav: Navigation; level: number }[] => {
    const items =
      allNavigations?.filter((nav) => nav.navigation_id === parentId) || [];
    return items.flatMap((nav) => [
      { nav, level },
      ...buildHierarchicalList(nav.id, level + 1),
    ]);
  };

  const hierarchicalNavigations = buildHierarchicalList();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const response = await administratorService.getLoggedInUser();
      if (response.success && response.data) {
        setCurrentUserId(response.data.id);
        if (!editedNavigation) {
          setFormData((prev) => ({ ...prev, creator_id: response.data.id }));
        }
      }
    };
    if (isOpen) {
      fetchCurrentUser();
      fetchPages();
      fetchNavigations();
    }
  }, [isOpen, editedNavigation, fetchPages, fetchNavigations]);

  useEffect(() => {
    if (editedNavigation) {
      setFormData({
        title: editedNavigation.title,
        position: editedNavigation.position,
        url: editedNavigation.url,
        link_type: editedNavigation.link_type,
        is_active: editedNavigation.is_active,
        navigation_id: editedNavigation.navigation_id,
        creator_id: editedNavigation.creator_id,
      });
    } else {
      setFormData({
        title: "",
        position: 1,
        url: "",
        link_type: "internal",
        is_active: true,
        navigation_id: null,
        creator_id: currentUserId,
      });
    }
  }, [editedNavigation, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = editedNavigation
      ? await navigationService.update({
          ...formData,
          id: editedNavigation.id,
          last_modificator_id: currentUserId,
        } as Navigation)
      : await navigationService.add(formData);
    if (response.success) {
      closeModal();
      setFormData({
        title: "",
        position: 1,
        url: "",
        link_type: "internal",
        is_active: true,
        navigation_id: null,
        creator_id: currentUserId,
      });
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {editedNavigation ? "Edit Navigation Item" : "Add Navigation Item"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            placeholder="Enter title (max 20 characters)"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value.slice(0, 20) })
            }
            required
          />
        </div>
        <div>
          <Label>Link Type</Label>
          <select
            value={formData.link_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                link_type: e.target.value as "internal" | "external" | "anchor",
                url: "", // Reset URL when type changes
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="internal">Internal Page</option>
            <option value="external">External URL</option>
            <option value="anchor">Anchor/Section</option>
          </select>
        </div>

        {/* Conditional URL field based on link type */}
        {formData.link_type === "internal" && (
          <div>
            <Label>Select Page</Label>
            <select
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">-- Select a page --</option>
              {pages?.map((page) => (
                <option key={page.id} value={`/${page.slug}`}>
                  {page.title} (/{page.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.link_type === "external" && (
          <div>
            <Label>External URL</Label>
            <Input
              type="url"
              placeholder="e.g., https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
            />
          </div>
        )}

        {formData.link_type === "anchor" && (
          <div>
            <Label>Select Section</Label>
            <select
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">-- Select a section --</option>
              {anchorSections.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label>Parent Navigation (Optional)</Label>
          <select
            value={formData.navigation_id ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                navigation_id: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- No parent (Top level) --</option>
            {hierarchicalNavigations
              ?.filter((item) => item.nav.id !== editedNavigation?.id) // Don't allow selecting itself as parent
              ?.map((item) => (
                <option key={item.nav.id} value={item.nav.id}>
                  {"\u00A0".repeat(item.level * 4)}
                  {item.level > 0 ? "└─ " : ""}
                  {item.nav.title}
                </option>
              ))}
          </select>
        </div>
        <div>
          <Label>Position</Label>
          <Input
            type="number"
            placeholder="Enter position"
            value={formData.position.toString()}
            onChange={(e) =>
              setFormData({
                ...formData,
                position: parseInt(e.target.value) || 1,
              })
            }
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <Label htmlFor="is_active" className="mb-0">
            Active
          </Label>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

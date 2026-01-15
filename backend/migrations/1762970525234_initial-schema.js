/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Tabela Administrator
  pgm.createTable("administrator", {
    id: "id",
    name: {
      type: "varchar(20)",
      notNull: true,
    },
    surname: {
      type: "varchar(50)",
      notNull: true,
    },
    email: {
      type: "varchar(50)",
      notNull: true,
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    password: {
      type: "varchar(255)",
      notNull: true,
    },
  });

  // Dodaj domyślnego administratora (login: admin, hasło: admin)
  pgm.sql(`
    INSERT INTO administrator (name, surname, email, password)
    VALUES ('Admin', 'System', 'admin@cms.local', '$2b$10$XzlxSyPMesYTwFkfYoEuquaNPqNVlJr0N6.3OQhRV/nmHcToRcTx6')
  `);

  // Tabela Password_Reset_Token
  pgm.createTable("password_reset_token", {
    id: "id",
    administrator_id: {
      type: "integer",
      notNull: true,
      references: "administrator",
      onDelete: "CASCADE",
    },
    email: {
      type: "varchar(50)",
      notNull: true,
    },
    token: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: "timestamp",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    used: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });

  // Add index on administrator_id for faster lookups
  pgm.createIndex("password_reset_token", "administrator_id");

  // Add index on email for faster lookups
  pgm.createIndex("password_reset_token", "email");

  // Add index on token for faster lookups
  pgm.createIndex("password_reset_token", "token");

  // Tabela Currency
  pgm.createTable("currency", {
    id: "id",
    code: {
      type: "varchar(5)",
      notNull: true,
    },
    name: {
      type: "varchar(50)",
      notNull: true,
    },
  });

  // Tabela Contact_Type
  pgm.createTable("contact_type", {
    id: "id",
    value: {
      type: "varchar(20)",
    },
    icon_url: {
      type: "varchar(255)",
      notNull: true,
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Configuration table - first create enum type
  pgm.createType("configuration_type", ["text", "richText", "image", "movie"]);

  // Configuration table
  pgm.createTable("configuration", {
    key: {
      type: "varchar(50)",
      primaryKey: true,
    },
    value: {
      type: "text",
      notNull: false,
      default: null,
    },
    description: {
      type: "varchar(255)",
      notNull: true,
    },
    type: {
      type: "configuration_type",
      notNull: true,
      default: "text",
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Add sample configuration records
  pgm.sql(`
    INSERT INTO configuration (key, value, description, type, creator_id)
    VALUES
      ('site_name', NULL, 'Site name displayed next to slider', 'text', 1),
      ('site_tagline', NULL, 'Site tag line displayed next to slider', 'text', 1),
      ('header_logo', NULL, 'Restaurant logo displayed in header', 'image', 1),
      ('about_us_content', NULL, 'Content of "About us" section', 'richText', 1),
      ('about_us_video', NULL, 'Video displayed next to "About us" section', 'movie', 1),
      ('our_menu_header', NULL, 'Header of "Our menu" section', 'text', 1),
      ('our_chefs_header', NULL, 'Header of "Our chefs" section', 'text', 1),
      ('contact_us_content', NULL, 'Content of "Contact us" section', 'richText', 1),
      ('instagram_link', NULL, 'Instagram link', 'text', 1),
      ('facebook_link', NULL, 'Facebook link', 'text', 1),
      ('twitter_link', NULL, 'Twitter link', 'text', 1),
      ('linkedin_link', NULL, 'Linkedin link', 'text', 1)
  `);

  // Tabela Contact_Item
  pgm.createTable("contact_item", {
    id: "id",
    value: {
      type: "varchar(50)",
      notNull: true,
    },
    contact_type_id: {
      type: "integer",
      references: "contact_type",
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Tabela Page
  pgm.createTable("page", {
    id: "id",
    title: {
      type: "varchar(50)",
      notNull: true,
    },
    description: {
      type: "varchar(255)",
      notNull: true,
    },
    header_image_url: {
      type: "varchar(255)",
    },
    slug: {
      type: "varchar(20)",
      notNull: true,
    },
    meta_data: {
      type: "text",
      notNull: true,
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Tabela Page_Content
  pgm.createTable("page_content", {
    id: "id",
    item_type: {
      type: "varchar(20)",
      notNull: true,
    },
    image_url: {
      type: "varchar(255)",
      notNull: true,
    },
    position: {
      type: "integer",
      notNull: true,
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Enum for navigation link types
  pgm.createType("link_type", ["internal", "external", "anchor"]);

  // Tabela Navigation
  pgm.createTable("navigation", {
    id: "id",
    title: {
      type: "varchar(20)",
      notNull: true,
    },
    position: {
      type: "integer",
      notNull: true,
    },
    url: {
      type: "varchar(255)",
      notNull: true,
    },
    link_type: {
      type: "link_type",
      notNull: true,
      default: "internal",
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    navigation_id: {
      type: "integer",
      references: "navigation",
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Tabela Menu_Item
  pgm.createTable("menu_item", {
    id: "id",
    name: {
      type: "varchar(20)",
      notNull: true,
    },
    description: {
      type: "varchar(255)",
      notNull: true,
    },
    price: {
      type: "decimal(10,2)",
      notNull: true,
    },
    currency_id: {
      type: "integer",
      references: "currency",
    },
  });

  // Dodanie FK do page_content dla menu_item
  pgm.addConstraint("menu_item", "menu_item_page_content_fk", {
    foreignKeys: {
      columns: "id",
      references: "page_content(id)",
    },
  });

  // Tabela Chef_item
  pgm.createTable("chef_item", {
    id: "id",
    name: {
      type: "varchar(20)",
      notNull: true,
    },
    surname: {
      type: "varchar(50)",
      notNull: true,
    },
    specialization: {
      type: "varchar(20)",
      notNull: true,
    },
    facebook_link: {
      type: "varchar(255)",
    },
    instagram_link: {
      type: "varchar(255)",
    },
    twitter_link: {
      type: "varchar(255)",
    },
  });

  // Dodanie FK do page_content dla chef_item
  pgm.addConstraint("chef_item", "chef_item_page_content_fk", {
    foreignKeys: {
      columns: "id",
      references: "page_content(id)",
    },
  });

  // Tabela Page_Item
  pgm.createTable("page_item", {
    id: "id",
    title: {
      type: "varchar(50)",
      notNull: true,
    },
    description: {
      type: "varchar(255)",
      notNull: true,
    },
    type: {
      type: "varchar(20)",
    },
  });

  // Dodanie FK do page_content dla page_item
  pgm.addConstraint("page_item", "page_item_page_content_fk", {
    foreignKeys: {
      columns: "id",
      references: "page_content(id)",
    },
  });

  // Tabela Slider_Image
  pgm.createTable("slider_image", {
    id: "id",
    image_url: {
      type: "varchar(255)",
      notNull: true,
    },
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    creation_time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    creator_id: {
      type: "integer",
      references: "administrator",
    },
    last_modification_time: {
      type: "timestamp",
    },
    last_modificator_id: {
      type: "integer",
      references: "administrator",
    },
  });

  // Tabela PageToContent (relacja many-to-many)
  pgm.createTable("page_to_content", {
    page_id: {
      type: "integer",
      notNull: true,
      references: "page",
      onDelete: "CASCADE",
    },
    page_content_id: {
      type: "integer",
      notNull: true,
      references: "page_content",
      onDelete: "CASCADE",
    },
  });

  // Klucz główny dla tabeli page_to_content
  pgm.addConstraint("page_to_content", "page_to_content_pkey", {
    primaryKey: ["page_id", "page_content_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Usuwanie tabel w odwrotnej kolejności (ze względu na FK)
  pgm.dropTable("page_to_content");
  pgm.dropTable("slider_image");
  pgm.dropTable("page_item");
  pgm.dropTable("chef_item");
  pgm.dropTable("menu_item");
  pgm.dropTable("navigation");
  pgm.dropTable("page_content");
  pgm.dropTable("page");
  pgm.dropTable("contact_item");
  pgm.dropTable("configuration");
  pgm.dropType("configuration_type");
  pgm.dropTable("contact_type");
  pgm.dropTable("currency");
  pgm.dropTable("password_reset_token");
  pgm.dropTable("administrator");
};

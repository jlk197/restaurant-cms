-- Przykładowe dane dla Restaurant CMS
-- Uruchom: docker exec -i cms_postgres psql -U cms_user -d cms_db < seed-data.sql

-- Administratorzy
INSERT INTO administrator (name, surname, email, password) VALUES
('Jan', 'Kowalski', 'jan@restauracja.pl', 'haslo123'),
('Anna', 'Nowak', 'anna@restauracja.pl', 'haslo456');

-- Waluty
INSERT INTO currency (code, name) VALUES
('PLN', 'Polski złoty'),
('EUR', 'Euro'),
('USD', 'Dolar amerykański');

-- Typy kontaktu
INSERT INTO contact_type (value, creator_id) VALUES
('Email', 1),
('Telefon', 1),
('Adres', 1),
('Facebook', 1),
('Instagram', 1);

-- Elementy kontaktu
INSERT INTO contact_item (value, contact_type_id, is_active, creator_id) VALUES
('kontakt@restauracja.pl', 1, true, 1),
('+48 123 456 789', 2, true, 1),
('ul. Główna 1, 00-001 Warszawa', 3, true, 1),
('https://facebook.com/restauracja', 4, true, 1),
('https://instagram.com/restauracja', 5, true, 1);

-- Konfiguracja
INSERT INTO configuration (key, value, description, is_active, creator_id) VALUES
('site_name', 'Restauracja Smak', 'Nazwa restauracji', true, 1),
('site_description', 'Najlepsza kuchnia w mieście', 'Opis strony', true, 1),
('opening_hours', 'Pn-Pt: 12:00-22:00, Sb-Nd: 14:00-23:00', 'Godziny otwarcia', true, 1),
('reservation_email', 'rezerwacje@restauracja.pl', 'Email do rezerwacji', true, 1),
('max_table_size', '12', 'Maksymalna liczba osób przy stoliku', true, 1);

-- Strony
INSERT INTO page (title, description, header_image_url, slug, meta_data, creator_id) VALUES
('Strona główna', 'Witamy w naszej restauracji', 'https://example.com/home.jpg', 'home', '{"keywords": "restauracja, jedzenie, Warszawa"}', 1),
('O nas', 'Poznaj naszą historię', 'https://example.com/about.jpg', 'o-nas', '{"keywords": "historia, restauracja"}', 1),
('Menu', 'Nasze dania', 'https://example.com/menu.jpg', 'menu', '{"keywords": "menu, dania, kuchnia"}', 1),
('Kontakt', 'Skontaktuj się z nami', 'https://example.com/contact.jpg', 'kontakt', '{"keywords": "kontakt, rezerwacje"}', 1);

-- Nawigacja
INSERT INTO navigation (title, position, url, is_active, navigation_id, creator_id) VALUES
('Strona główna', 1, '/', true, NULL, 1),
('O nas', 2, '/o-nas', true, NULL, 1),
('Menu', 3, '/menu', true, NULL, 1),
('Galeria', 4, '/galeria', true, NULL, 1),
('Kontakt', 5, '/kontakt', true, NULL, 1);

-- Obrazy slidera
INSERT INTO slider_image (image_url, is_active, creator_id) VALUES
('https://example.com/slider1.jpg', true, 1),
('https://example.com/slider2.jpg', true, 1),
('https://example.com/slider3.jpg', true, 1);

-- Zawartość stron (page_content)
INSERT INTO page_content (item_type, image_url, position, is_active, creator_id) VALUES
('menu_item', 'https://example.com/pizza.jpg', 1, true, 1),
('menu_item', 'https://example.com/pasta.jpg', 2, true, 1),
('menu_item', 'https://example.com/steak.jpg', 3, true, 1),
('chef_item', 'https://example.com/chef1.jpg', 1, true, 1),
('chef_item', 'https://example.com/chef2.jpg', 2, true, 1);

-- Pozycje menu
INSERT INTO menu_item (id, name, description, price, currency_id) VALUES
(1, 'Pizza Margherita', 'Klasyczna pizza z sosem pomidorowym, mozzarellą i bazylią', 28.00, 1),
(2, 'Pasta Carbonara', 'Makaron z boczkiem, jajkiem i parmezanem', 32.00, 1),
(3, 'Stek wołowy', 'Stek z polędwicy wołowej z ziemniakami i warzywami', 65.00, 1);

-- Kucharze
INSERT INTO chef_item (id, name, surname, specialization, facebook_link, instagram_link, twitter_link) VALUES
(4, 'Mario', 'Rossi', 'Kuchnia włoska', 'https://facebook.com/mario', 'https://instagram.com/mario', NULL),
(5, 'Pierre', 'Dubois', 'Kuchnia francuska', 'https://facebook.com/pierre', 'https://instagram.com/pierre', NULL);

-- Elementy stron
INSERT INTO page_item (title, description, type) VALUES
('Witamy', 'Witamy w naszej restauracji', 'hero'),
('Nasza historia', 'Od 1995 roku serwujemy najlepsze dania', 'text'),
('Specjalne oferty', 'Sprawdź nasze promocje', 'promo');

-- Relacje strona-zawartość
INSERT INTO page_to_content (page_id, page_content_id) VALUES
(3, 1),  -- Menu -> Pizza
(3, 2),  -- Menu -> Pasta
(3, 3),  -- Menu -> Steak
(2, 4),  -- O nas -> Chef 1
(2, 5);  -- O nas -> Chef 2

-- Wyświetl podsumowanie
SELECT 'Administratorzy:' as tabela, COUNT(*) as liczba FROM administrator
UNION ALL
SELECT 'Waluty:', COUNT(*) FROM currency
UNION ALL
SELECT 'Strony:', COUNT(*) FROM page
UNION ALL
SELECT 'Menu:', COUNT(*) FROM menu_item
UNION ALL
SELECT 'Kucharze:', COUNT(*) FROM chef_item
UNION ALL
SELECT 'Nawigacja:', COUNT(*) FROM navigation
UNION ALL
SELECT 'Slider:', COUNT(*) FROM slider_image
UNION ALL
SELECT 'Konfiguracja:', COUNT(*) FROM configuration
UNION ALL
SELECT 'Kontakt:', COUNT(*) FROM contact_item;

SELECT '✅ Dane testowe zostały załadowane!' as status;


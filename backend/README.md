# Restaurant CMS - Backend

Backend API dla systemu CMS restauracji, zbudowany w Node.js/Express z bazą danych PostgreSQL.

## 🚀 Szybki start

### 1. Uruchom Docker
```bash
cd ..
docker-compose up -d
```

### 2. Uruchom migracje (pierwszorazowo)
```bash
npm run migrate:up
```

### 3. Sprawdź czy działa
```bash
curl http://localhost:5000/api/hello
```

## 📦 Struktura projektu

```
backend/
├── index.js              # Główny plik serwera z endpointami API
├── db.js                 # Konfiguracja połączenia z PostgreSQL
├── database.json         # Konfiguracja migracji
├── .env                  # Zmienne środowiskowe (lokalne)
├── migrations/           # Migracje bazy danych
│   └── 1762970525234_initial-schema.js
├── API.md               # Dokumentacja API
├── DATABASE.md          # Dokumentacja struktury bazy
├── MIGRATIONS.md        # Przewodnik po migracjach
└── package.json         # Zależności i skrypty
```

## 🗄️ Baza danych

### Tabele (13):
- **administrator** - Administratorzy systemu
- **page** - Strony CMS
- **menu_item** - Pozycje menu restauracji
- **chef_item** - Kucharze
- **navigation** - Elementy nawigacji
- **slider_image** - Obrazy slidera
- **configuration** - Ustawienia konfiguracji
- **currency** - Waluty
- **contact_type** - Typy kontaktu
- **contact_item** - Elementy kontaktu
- **page_content** - Zawartość stron
- **page_item** - Elementy stron
- **page_to_content** - Relacja strony-zawartość

### Migracje

```bash
# Uruchom migracje
npm run migrate:up

# Cofnij ostatnią migrację
npm run migrate:down

# Utwórz nową migrację
npm run migrate:create nazwa-migracji
```

## 🔌 API Endpoints

### Administratorzy
- `GET /api/administrators` - Lista administratorów
- `GET /api/administrators/:id` - Szczegóły administratora
- `POST /api/administrators` - Utwórz administratora
- `PUT /api/administrators/:id` - Zaktualizuj administratora
- `DELETE /api/administrators/:id` - Usuń administratora

### Strony
- `GET /api/pages` - Lista stron
- `GET /api/pages/:id` - Szczegóły strony
- `POST /api/pages` - Utwórz stronę
- `PUT /api/pages/:id` - Zaktualizuj stronę
- `DELETE /api/pages/:id` - Usuń stronę

### Menu
- `GET /api/menu-items` - Lista pozycji menu
- `POST /api/menu-items` - Utwórz pozycję menu
- `PUT /api/menu-items/:id` - Zaktualizuj pozycję
- `DELETE /api/menu-items/:id` - Usuń pozycję

### Kucharze
- `GET /api/chefs` - Lista kucharzy
- `POST /api/chefs` - Dodaj kucharza
- `PUT /api/chefs/:id` - Zaktualizuj kucharza
- `DELETE /api/chefs/:id` - Usuń kucharza

### Nawigacja
- `GET /api/navigation` - Lista elementów nawigacji
- `POST /api/navigation` - Dodaj element
- `PUT /api/navigation/:id` - Zaktualizuj element
- `DELETE /api/navigation/:id` - Usuń element

### Slider
- `GET /api/slider-images` - Lista obrazów slidera
- `POST /api/slider-images` - Dodaj obraz
- `PUT /api/slider-images/:id` - Zaktualizuj obraz
- `DELETE /api/slider-images/:id` - Usuń obraz

### Konfiguracja
- `GET /api/configuration` - Lista ustawień
- `GET /api/configuration/:key` - Ustawienie po kluczu
- `POST /api/configuration` - Dodaj ustawienie
- `PUT /api/configuration/:key` - Zaktualizuj ustawienie
- `DELETE /api/configuration/:key` - Usuń ustawienie

### Waluty
- `GET /api/currencies` - Lista walut
- `POST /api/currencies` - Dodaj walutę

### Kontakt
- `GET /api/contact-types` - Typy kontaktu
- `POST /api/contact-types` - Dodaj typ
- `GET /api/contact-items` - Elementy kontaktu
- `POST /api/contact-items` - Dodaj element
- `PUT /api/contact-items/:id` - Zaktualizuj element
- `DELETE /api/contact-items/:id` - Usuń element

📖 **Pełna dokumentacja API:** [API.md](./API.md)

## 🛠️ Technologie

- **Node.js 18** - Runtime
- **Express.js** - Framework webowy
- **PostgreSQL 16** - Baza danych
- **node-pg-migrate** - Migracje bazy danych
- **pg** - Driver PostgreSQL
- **Docker** - Konteneryzacja

## 📝 Zmienne środowiskowe

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=cms_user
DB_PASSWORD=cms_password
DB_NAME=cms_db
NODE_ENV=development
PORT=5000
```

## 🧪 Testowanie

```bash
# Test połączenia
curl http://localhost:5000/api/hello

# Pobierz strony
curl http://localhost:5000/api/pages

# Utwórz administratora
curl -X POST http://localhost:5000/api/administrators \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan","surname":"Kowalski","email":"jan@test.pl","password":"test123"}'
```


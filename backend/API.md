# API Documentation - Restaurant CMS

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### 🔐 Administratorzy (Administrators)

#### GET /administrators

Pobierz wszystkich administratorów

```json
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jan",
      "surname": "Kowalski",
      "email": "jan@example.com"
    }
  ]
}
```

#### GET /administrators/:id

Pobierz administratora po ID

#### POST /administrators

Utwórz nowego administratora

```json
Request: {
  "name": "Jan",
  "surname": "Kowalski",
  "email": "jan@example.com",
  "password": "haslo123"
}
```

#### PUT /administrators/:id

Zaktualizuj administratora

#### DELETE /administrators/:id

Usuń administratora

---

### 📄 Strony (Pages)

#### GET /pages

Pobierz wszystkie strony (z informacją o twórcy i modyfikatorze)

#### GET /pages/:id

Pobierz stronę po ID

#### POST /pages

Utwórz nową stronę

```json
Request: {
  "title": "O nas",
  "description": "Opis strony",
  "header_image_url": "https://example.com/image.jpg",
  "slug": "o-nas",
  "meta_data": "{\"keywords\": \"restauracja\"}",
  "creator_id": 1
}
```

#### PUT /pages/:id

Zaktualizuj stronę

```json
Request: {
  "title": "O nas - zaktualizowane",
  "description": "Nowy opis",
  "header_image_url": "https://example.com/new-image.jpg",
  "slug": "o-nas",
  "meta_data": "{\"keywords\": \"restauracja, jedzenie\"}",
  "last_modificator_id": 1
}
```

#### DELETE /pages/:id

Usuń stronę

---

### 🍽️ Menu (Menu Items)

#### GET /menu-items

Pobierz wszystkie pozycje menu (z informacją o walucie)

#### POST /menu-items

Utwórz nową pozycję menu

```json
Request: {
  "name": "Pizza Margherita",
  "description": "Klasyczna pizza z sosem pomidorowym i mozzarellą",
  "price": 25.99,
  "currency_id": 1
}
```

#### PUT /menu-items/:id

Zaktualizuj pozycję menu

#### DELETE /menu-items/:id

Usuń pozycję menu

---

### 👨‍🍳 Kucharze (Chefs)

#### GET /chefs

Pobierz wszystkich kucharzy

#### POST /chefs

Utwórz nowego kucharza

```json
Request: {
  "name": "Mario",
  "surname": "Rossi",
  "specialization": "Kuchnia włoska",
  "facebook_link": "https://facebook.com/mario",
  "instagram_link": "https://instagram.com/mario",
  "twitter_link": "https://twitter.com/mario"
}
```

#### PUT /chefs/:id

Zaktualizuj kucharza

#### DELETE /chefs/:id

Usuń kucharza

---

### 🧭 Nawigacja (Navigation)

#### GET /navigation

Pobierz wszystkie elementy nawigacji (posortowane po pozycji)

#### POST /navigation

Utwórz nowy element nawigacji

```json
Request: {
  "title": "Strona główna",
  "position": 1,
  "url": "/",
  "is_active": true,
  "navigation_id": null,
  "creator_id": 1
}
```

#### PUT /navigation/:id

Zaktualizuj element nawigacji

#### DELETE /navigation/:id

Usuń element nawigacji

---

### 🖼️ Slider (Slider Images)

#### GET /slider-images

Pobierz wszystkie aktywne obrazy slidera

#### POST /slider-images

Utwórz nowy obraz slidera

```json
Request: {
  "image_url": "https://example.com/slider1.jpg",
  "is_active": true,
  "creator_id": 1
}
```

#### PUT /slider-images/:id

Zaktualizuj obraz slidera

#### DELETE /slider-images/:id

Usuń obraz slidera

---

### ⚙️ Konfiguracja (Configuration)

#### GET /configuration

Pobierz wszystkie aktywne ustawienia konfiguracji

#### GET /configuration/:key

Pobierz ustawienie po kluczu

#### POST /configuration

Utwórz nowe ustawienie

```json
Request: {
  "key": "site_name",
  "value": "Moja Restauracja",
  "description": "Nazwa strony wyświetlana w nagłówku",
  "is_active": true,
  "creator_id": 1
}
```

#### PUT /configuration/:key

Zaktualizuj ustawienie

#### DELETE /configuration/:key

Usuń ustawienie

---

### 💰 Waluty (Currencies)

#### GET /currencies

Pobierz wszystkie waluty

#### POST /currencies

Utwórz nową walutę

```json
Request: {
  "code": "PLN",
  "name": "Polski złoty"
}
```

---

### 📞 Typy kontaktu (Contact Types)

#### GET /contact-types

Pobierz wszystkie typy kontaktu

#### POST /contact-types

Utwórz nowy typ kontaktu

```json
Request: {
  "value": "Email",
  "creator_id": 1
}
```

---

### 📧 Elementy kontaktu (Contact Items)

#### GET /contact-items

Pobierz wszystkie aktywne elementy kontaktu

#### POST /contact-items

Utwórz nowy element kontaktu

```json
Request: {
  "value": "kontakt@restauracja.pl",
  "contact_type_id": 1,
  "is_active": true,
  "creator_id": 1
}
```

#### PUT /contact-items/:id

Zaktualizuj element kontaktu

#### DELETE /contact-items/:id

Usuń element kontaktu

---

## Testowanie API

### Przykład z curl:

```bash
# Pobierz wszystkie strony
curl http://localhost:5000/api/pages

# Utwórz nowego administratora
curl -X POST http://localhost:5000/api/administrators \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan","surname":"Kowalski","email":"jan@test.pl","password":"test123"}'

# Pobierz wszystkie pozycje menu
curl http://localhost:5000/api/menu-items
```

### Przykład z JavaScript (fetch):

```javascript
// Pobierz wszystkie strony
fetch("http://localhost:5000/api/pages")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Utwórz nową stronę
fetch("http://localhost:5000/api/pages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Nowa strona",
    description: "Opis",
    slug: "nowa-strona",
    meta_data: "{}",
    creator_id: 1,
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## Format odpowiedzi

Wszystkie endpointy zwracają odpowiedzi w formacie JSON:

### Sukces:

```json
{
  "success": true,
  "data": { ... }
}
```

### Błąd:

```json
{
  "success": false,
  "error": "Opis błędu"
}
```

### Usunięcie:

```json
{
  "success": true,
  "message": "Zasób został usunięty"
}
```

# 🔄 Przewodnik po migracjach bazy danych

## Czym są migracje?

Migracje to sposób na wersjonowanie struktury bazy danych. Zamiast tworzyć tabele ręcznie lub w kodzie, definiujesz zmiany w plikach migracji, które można:
- Uruchamiać (`up`) - aplikować zmiany
- Cofać (`down`) - wycofywać zmiany
- Śledzić w systemie kontroli wersji (Git)

## 📝 Podstawowe komendy

### Utworzenie nowej migracji
```bash
npm run migrate:create nazwa-migracji
```

### Uruchomienie wszystkich oczekujących migracji
```bash
npm run migrate:up
```

### Cofnięcie ostatniej migracji
```bash
npm run migrate:down
```

### Sprawdzenie statusu migracji
```bash
npm run migrate
```

## 🎯 Przykłady użycia

### Przykład 1: Dodanie nowej tabeli

```bash
npm run migrate:create add-tags-table
```

Edytuj utworzony plik:

```javascript
exports.up = (pgm) => {
  pgm.createTable('tags', {
    id: 'id',
    name: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tags');
};
```

### Przykład 2: Dodanie kolumny do istniejącej tabeli

```bash
npm run migrate:create add-avatar-to-users
```

```javascript
exports.up = (pgm) => {
  pgm.addColumn('users', {
    avatar_url: {
      type: 'varchar(255)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'avatar_url');
};
```

### Przykład 3: Dodanie indeksu

```bash
npm run migrate:create add-index-to-posts-slug
```

```javascript
exports.up = (pgm) => {
  pgm.createIndex('posts', 'slug');
};

exports.down = (pgm) => {
  pgm.dropIndex('posts', 'slug');
};
```

### Przykład 4: Zmiana typu kolumny

```bash
npm run migrate:create change-content-type
```

```javascript
exports.up = (pgm) => {
  pgm.alterColumn('posts', 'content', {
    type: 'text',
    notNull: true,
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('posts', 'content', {
    type: 'text',
    notNull: false,
  });
};
```

## 📚 Dostępne operacje

- `pgm.createTable(tableName, columns)` - tworzenie tabeli
- `pgm.dropTable(tableName)` - usuwanie tabeli
- `pgm.addColumn(tableName, columns)` - dodawanie kolumny
- `pgm.dropColumn(tableName, columnName)` - usuwanie kolumny
- `pgm.alterColumn(tableName, columnName, options)` - modyfikacja kolumny
- `pgm.createIndex(tableName, columns)` - tworzenie indeksu
- `pgm.dropIndex(tableName, columns)` - usuwanie indeksu
- `pgm.addConstraint(tableName, constraintName, expression)` - dodawanie ograniczenia
- `pgm.dropConstraint(tableName, constraintName)` - usuwanie ograniczenia
- `pgm.sql(query)` - wykonanie surowego SQL

## ⚠️ Dobre praktyki

1. **Zawsze definiuj funkcję `down`** - pozwala to cofnąć migrację
2. **Jedna migracja = jedna zmiana** - łatwiej zarządzać i debugować
3. **Testuj migracje lokalnie** przed wdrożeniem na produkcję
4. **Nie modyfikuj starych migracji** - twórz nowe zamiast edytować istniejące
5. **Commituj migracje do Git** - cały zespół powinien mieć te same migracje

## 🔗 Więcej informacji

Dokumentacja node-pg-migrate: https://salsita.github.io/node-pg-migrate/


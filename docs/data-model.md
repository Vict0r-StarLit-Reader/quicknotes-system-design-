# QuickNotes Data Model

## 1. Entities & Schema Definitions
The database schema consists of four core relational entities: `users`, `notes`, `tags`, and a junction table `note_tags` for many-to-many relationships.

### Tables & Columns
* **`users`**: `id` (PK, UUID), `username` (VARCHAR), `email` (VARCHAR), `created_at` (TIMESTAMP)
* **`notes`**: `id` (PK, UUID), `user_id` (FK, UUID), `title` (VARCHAR(100)), `body` (TEXT), `created_at` (TIMESTAMP), `updated_at` (TIMESTAMP)
* **`tags`**: `id` (PK, UUID), `name` (VARCHAR(50))
* **`note_tags`**: `note_id` (FK, UUID), `tag_id` (FK, UUID) – *Composite Primary Key (`note_id`, `tag_id`)*

---

## 2. Relationships Explanation
* **`users` to `notes` (One-to-Many):** One user can author multiple notes, but each note belongs to a single user (`notes.user_id` references `users.id`).
* **`notes` to `tags` (Many-to-Many):** A note can contain multiple tags, and a single tag can be applied to many notes. This is resolved via the intermediate `note_tags` junction table.

---

## 3. SQL `CREATE TABLE` Statements

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```
## 4.SQL 'SELECT' Statements
```sql
 SELECT id, title, body, created_at 
 FROM notes 
 WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' 
 ORDER BY created_at DESC;
 


  SELECT n.id, n.title, n.body 
 FROM notes n
 JOIN note_tags nt ON n.id = nt.note_id
 JOIN tags t ON nt.tag_id = t.id
 WHERE t.name = 'urgent' AND n.user_id = '123e4567-e89b-12d3-a456-426614174000'; 

 SELECT u.username, COUNT(n.id) AS total_notes
 FROM users u
 LEFT JOIN notes n ON u.id = n.user_id
 GROUP BY u.id, u.username;
 ```

## 5.Indexing Strategy
* **Index on notes(user_id):** Created to optimize lookup performance when fetching a user's specific note feeds without full table scans.
```sql
 CREATE INDEX idx_notes_user_id ON notes(user_id);
 ```

 ## 6. SQL vs. NoSQL Justification
* **Choice:** Relational SQL Database (PostgreSQL)
* **Trade-Off / Rationale:** 
  * *Why SQL:* QuickNotes relies heavily on strict relational integrity (user ownership mapping, cascading deletes when users or notes are removed), structured transactional safety, and complex querying capabilities (such as multi-table joins across tags and notes). 
  * *Trade-off:* While NoSQL document stores offer flexible schemas and high write throughput, they lack native relational constraints and ACID guarantees. We traded the schema flexibility of NoSQL for the robust transactional safety, foreign key integrity, and complex relational querying required for user data protection and reliable data modeling.

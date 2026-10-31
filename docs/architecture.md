# QuickNotes System Architecture

## 1. Functional and Non-Functional Requirements
* **Functional Requirements:** 
  * Users can load, view, create, update, and delete notes via a RESTful API interface.
  * The system supports tagging notes and organizing content by categories.
  * Real-time search and filtering capabilities over large volumes of user notes.
* **Non-Functional Requirements:**
  * **High Availability:** 99.9% uptime target to support 1 million Daily Active Users (DAU).
  * **Low Latency:** API response times under 200ms for read operations.
  * **Scalability:** Horizontal auto-scaling capacity for application and caching tiers.

---

## 2. Load Estimates (1 Million Users)
* **Active Users (DAU):** 1,000,000 users
* **Read Requests:** Average 20 reads per user/day = 20,000,000 requests/day
  * **Average Reads/sec:** $20,000,000 \div 86,400 \approx 231.48 \text{ req/sec}$
  * **Peak Reads/sec (5× factor):** $\approx 1,157.40 \text{ req/sec}$
* **Write Requests:** Average 5 writes per user/day = 5,000,000 requests/day
  * **Average Writes/sec:** $5,000,000 \div 86,400 \approx 57.87 \text{ req/sec}$
  * **Peak Writes/sec (5× factor):** $\approx 289.35 \text{ req/sec}$
* **Annual Storage Growth:** Assuming each note record averages 2 KB (including metadata and tag mappings):
  * Daily Storage: $5,000,000 \text{ writes} \times 2 \text{ KB} = 10,000,000 \text{ KB} \approx 10 \text{ GB/day}$
  * Annual Storage: $10 \text{ GB} \times 365 \text{ days} = \mathbf{3.65 \text{ TB/year}}$

---

## 3. System Architecture Diagram

```text
[ Clients / Mobile & Web Apps ]
              │
              ▼
         [ DNS Route 53 ]
              │
              ▼
          [ CDN ] (Static asset caching)
              │
              ▼
     [ Load Balancer ] (Distributes traffic)
              │
              ├──► [ App Servers ] ──(Cache Read/Write)──► [ Redis In-Memory Cache ]
              │         │                                             │
              │         │ (Async Events)                       (Cache Misses)
              │         ▼                                             ▼
              │    [ Message Queue ]                   [ Read Replicas (Read Queries) ]
              │         │                                             │
              │         ▼                                [ Primary Database (Writes) ]
              │    [ Worker Service ] ────────────────────────────────┘
```        

 ## 4. Component Explanations
* **DNS:** Routes client requests to the nearest edge location or load balancer.
* **CDN:** Caches frontend static files globally to minimize latency.
* **Load Balancer:** Spreads incoming traffic evenly across backend application instances.
* **App Servers:** Stateless servers handling HTTP request validation, authentication, and core business logic.
* **Redis In-Memory Cache:** Stores hot user data and frequently accessed note lists to reduce database query load.
* **Primary Database:** Handles all transactional write operations (inserts, updates, deletes).
* **Read Replica:** Handles read-heavy queries offloaded from the primary database.
* **Message Queue & Worker Service:** Handles background tasks asynchronously (e.g., search indexing, analytics logging).

---

## 5. Request Flows
* **`GET /notes` Flow:**
  1. Client sends request through Load Balancer to an App Server.
  2. App Server checks Redis Cache for cached user notes.
  3. If cached (Cache Hit), results are returned immediately.
  4. If not cached (Cache Miss), the query runs against the Database Read Replica, populates Redis, and returns results to the client.
* **`POST /notes` Flow:**
  1. Client sends note payload to App Server.
  2. App Server validates user token and request body.
  3. Transaction writes new note record to the Primary Database.
  4. App Server invalidates stale cache keys in Redis and returns `201 Created`.

---

## 6. Architectural Trade-Offs & Single Points of Failure (SPOF)
* **Trade-Off 1: Eventual Consistency vs. Strong Consistency (Read Replicas)**
  * *Choice:* Utilizing read replicas for listing notes.
  * *Trade-off:* Users may experience a brief replication lag (milliseconds) where a newly created note doesn't instantly show up on a secondary read query, traded off for massive read scalability.
* **Trade-Off 2: Caching Freshness vs. Performance (Redis TTL)**
  * *Choice:* Caching user feeds with time-to-live (TTL) expiration.
  * *Trade-off:* Stale data may be displayed briefly if updates occur outside cache invalidation hooks, prioritized in favor of high throughput and low database CPU usage.
* **Mitigating Single Points of Failure (SPOF):**
  * *Load Balancers:* Deployed in active-active pairs with DNS failover.
  * *Database:* Primary database configured with automated failover and multi-region read replicas.
  * *App Servers:* Horizontally auto-scaled behind a managed container orchestration group.
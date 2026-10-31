# QuickNotes System Design

## Description
A production-ready transition plan and frontend implementation for QuickNotes, scaling from a browser-only tool to a distributed service supporting 1 million users.

## How to Run the API Client
1. Clone the repository to your local machine.
2. Open `index.html` in any modern web browser or serve it using a local static server (e.g., Live Server in VS Code).
3. Click "Load notes" to fetch data via GET, fill out the form to create notes via POST, and use the delete buttons to remove items via DELETE.

## Documentation Links
* [API Design Document](docs/api-design.md)
* [Data Model Document](docs/data-model.md)
* [Architecture Document](docs/architecture.md)

## What I Learned
* Designing robust RESTful APIs with proper status code handling, clear endpoint routing, and structured error payloads.
* Architecting scalable database schemas with correct relational mapping, foreign keys, and targeted indexing strategies.
* Planning high-throughput distributed systems incorporating CDNs, caching layers, and asynchronous worker queues to handle millions of active users.
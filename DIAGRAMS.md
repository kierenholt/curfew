DNS filtering
```mermaid
flowchart TD
    Z[Child device] -->|DNS request| A[DNS Listener]
    A --> |domain blocked| B(return null IP)
    A --> |domain is allowed| C(DNS forwarder)
    C --> |fetches IP| D(upstream DNS server)
    D --> C
    C --> |IP|Z
```

Simple stack
```mermaid
flowchart TD
    Z[App] --> |command e.g. block youtube| A(api listener)
    A --> |get blocked ips and ports| D(database)
    D --> |ips and ports| B(router adapter)
    B --> |http request| C[physical router]
```

Testing router adapters
```mermaid
sequenceDiagram
    test class->>+Router adapter: Settings to change
    Router adapter->>+Router: http request
    Router-->>-Router adapter: response

    test class->>+Router adapter: Settings to check
    Router adapter->>+Router: http request
    Router-->>-Router adapter: response
``

Inegration testing - whole backend
```mermaid
sequenceDiagram
    supertest ->> api listener: call endpoint 
    api listener->>+database: Settings to change
    database->>+Mock router adapter: http request

    api listener->>+Mock router adapter: Settings to check
```

TODO - remove as many imports from as many classes, undo statics

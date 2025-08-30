# pouch-db-vue

A Vue 3 composable for reactive PouchDB integration.

## Features

- Reactive PouchDB queries using Vue 3 composition API
- Real-time updates through PouchDB change events
- Type-safe database operations
- Supports find queries, document retrieval and allDocs

## Installation

```sh
npm install vue3-pouch pouchdb pouchdb-find
```

## Usage

```ts
import { usePouchRef } from 'vue3-pouch'
import PouchDB from 'pouchdb-browser'
import find from 'pouchdb-find'

// Register PouchDB plugins
PouchDB.plugin(find)

// Initialize database
const db = new PouchDB<YourDocType>('my-database')

// Use in component

  // Query by selector
  const { content: posts } = usePouchRef({
    selector: { type: 'post' }
  }, db)

  // Get single document
  const { content: singleDoc } = usePouchRef('doc-id', db)

  // Get all documents
  const { content: allDocs } = usePouchRef('all', db)

```

## API

### usePouchRef(findParams, db)

Creates a reactive reference to PouchDB query results.

Parameters:
- `findParams`: PouchDB find query object, document ID string, or "all" 
- `db`: PouchDB database instance

Returns:
- `content`: Readonly ref containing query results


## License

MIT

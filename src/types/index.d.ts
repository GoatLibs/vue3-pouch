/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-adapter-idb" />
/// <reference types="pouchdb-adapter-websql" />
/// <reference types="pouchdb-adapter-http" />
/// <reference types="pouchdb-mapreduce" />
/// <reference types="pouchdb-replication" />
/// <reference types="pouchdb-find" />

import { Ref } from "vue"


export type PouchDatabase<T extends {}> = PouchDB.Database<T>

//export type PouchFindParams<T extends {}> = PouchDB.Find.FindRequest<T>

export interface PouchFindParams<T extends {}> extends PouchDB.Find.FindRequest<T> {

}

export type PouchFindResponse<T extends {}> = PouchDB.Find.FindResponse<T>

export type PouchObserver = PouchDB.Core.Changes<{}>

export type PouchExistingDocument<T extends {}> = PouchDB.Core.ExistingDocument<T>

export type PouchExistingDocumentArray<T extends {}> = Array<{
    docs: PouchDB.Core.ExistingDocument<T>
}>

export type Config<T extends {}> = PouchFindParams<T> | "all" | string | Ref<PouchFindParams<T> | string | null>

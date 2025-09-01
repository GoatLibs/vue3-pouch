import { ref, onMounted, onUnmounted, readonly } from 'vue'
import type { PouchDatabase, PouchExistingDocument, PouchFindParams, PouchObserver } from '../types';


export function usePouchRef<TContent extends TDatabaseType,
    TDatabaseType extends {} = {},
    TIsSingle extends boolean = false,
    TDatabase extends PouchDatabase<TDatabaseType> = PouchDatabase<TDatabaseType>,
>(config: PouchFindParams<TContent> | "all" | string, db: TDatabase) {
    const contentWrite = ref<(TIsSingle extends true ? PouchExistingDocument<TContent> : PouchExistingDocument<TContent>[]) | null>(null)

    const content = readonly(contentWrite)

    let observer: PouchObserver | undefined;
    onMounted(async () => {
        if (config === "all") {
            contentWrite.value = (await db.allDocs({
                include_docs: true
            })).rows.map((d) => {
                return d.doc!
            })
        }
        else if (typeof config === 'string') {
            contentWrite.value = await db.get(config)
        }
        else {
            if (config.limit === 1) {
                contentWrite.value = (await db.find(config)).docs[0]
            }
            else {
                contentWrite.value = (await db.find(config)).docs
            }
        }
        observer = db.changes({
            since: 'now',
            live: true
        }).on('change', async () => {
            if (config === "all") {
                contentWrite.value = await db.allDocs()
            }
            else if (typeof config === 'string') {
                contentWrite.value = await db.get(config)
            }
            else {
                contentWrite.value = (await db.find(config)).docs
            }
        })
    })
    onUnmounted(() => {
        observer?.cancel()
    })

    return { content }
}

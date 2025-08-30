import { ref, onMounted, onUnmounted, readonly } from 'vue'
import type { PouchDatabase, PouchExistingDocument, PouchFindParams, PouchFindResponse, PouchObserver } from '../types';


export function usePouchRef<C extends {}>(findParams: PouchFindParams<C> | "all" | string, db: PouchDatabase<C>) {
    const contentWrite = ref<PouchFindResponse<C> | PouchExistingDocument<C> | null>(null)

    const content = readonly(contentWrite)

    let observer: PouchObserver | undefined;
    onMounted(async () => {
        if (findParams === "all") {
            contentWrite.value = await db.allDocs()
        }
        else if (typeof findParams === 'string') {
            contentWrite.value = await db.get(findParams)
        }
        else {
            contentWrite.value = await db.find(findParams)
        }
        observer = db.changes({
            since: 'now',
            live: true
        }).on('change', async () => {
            if (findParams === "all") {
                contentWrite.value = await db.allDocs()
            }
            else if (typeof findParams === 'string') {
                contentWrite.value = await db.get(findParams)
            }
            else {
                contentWrite.value = await db.find(findParams)
            }
        })
    })
    onUnmounted(() => {
        observer?.cancel()
    })

    return { content }
}

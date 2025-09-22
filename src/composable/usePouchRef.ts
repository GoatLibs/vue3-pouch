import { ref, onMounted, onUnmounted, readonly, isRef, toValue, watchEffect } from 'vue'
import type { Config, PouchDatabase, PouchExistingDocument, PouchFindParams, PouchObserver } from '../types';


export function usePouchRef<TContent extends TDatabaseType,
    TDatabaseType extends {} = {},
    TIsSingle extends boolean = false,
    TDatabase extends PouchDatabase<TDatabaseType> = PouchDatabase<TDatabaseType>,
>(config: Config<TContent>, db: TDatabase) {
    const contentWrite = ref<(TIsSingle extends true ? PouchExistingDocument<TContent> : PouchExistingDocument<TContent>[]) | null | undefined>(undefined)

    const content = readonly(contentWrite)

    let observer: PouchObserver | undefined;

    async function updateRef() {
        try {
            const goodConfig = toValue(config)
            if (goodConfig) {
                if (goodConfig === "all") {
                    contentWrite.value = (await db.allDocs({
                        include_docs: true
                    })).rows.map((d) => {
                        return d.doc!
                    }) ?? null
                }
                else if (typeof goodConfig === 'string') {
                    contentWrite.value = await db.get(goodConfig) ?? null
                }
                else {
                    if (goodConfig.limit === 1) {
                        contentWrite.value = (await db.find(goodConfig)).docs[0] ?? null
                    }
                    else {
                        contentWrite.value = (await db.find(goodConfig)).docs ?? null
                    }
                }
            }
            else {
                contentWrite.value = null
            }
        }
        catch (e) {
            throw e;
        }
    }
    onMounted(async () => {
        await updateRef()
        observer = db.changes({
            since: 'now',
            live: true
        }).on('change', async () => {
            await updateRef()
        })
    })
    onUnmounted(() => {
        observer?.cancel()
    })

    watchEffect(async () => {
        await updateRef()
    })
    return { content }
}

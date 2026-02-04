import { ref, onMounted, onUnmounted, readonly, isRef, toValue, watchEffect } from 'vue'
import type { Config, PouchDatabase, PouchExistingDocument, PouchFindParams, PouchObserver, Options, PouchError } from '../types';

function isPouchError(error: unknown): error is PouchError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        'message' in error
    );
}

export function usePouchRef<TContent extends TDatabaseType,
    TDatabaseType extends {} = {},
    TIsSingle extends boolean = false,
    TDatabase extends PouchDatabase<TDatabaseType> = PouchDatabase<TDatabaseType>,
>(config: Config<TContent>, db: TDatabase, options?: Options) {
    const contentWrite = ref<(TIsSingle extends true ? PouchExistingDocument<TContent> : PouchExistingDocument<TContent>[]) | null | undefined>(undefined)

    const isInit = ref<boolean>(false)
    const isLoading = ref<boolean>(false)
    const isLoaded = ref<boolean>(false)
    const isError = ref<boolean>(false)
    const error = ref<string | null>(null)

    let observer: PouchObserver | undefined;

    async function updateRef() {
        try {
            const goodConfig = toValue(config)
            if (goodConfig) {
                isError.value = false
                error.value = null
                isLoading.value = true

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
            isLoading.value = false
            isLoaded.value = true
        }
        catch (e: unknown) {
            isLoading.value = false
            isError.value = true
            error.value = isPouchError(e) ? e.message ?? "" : ""

            if (options?.throwOnError) {
                throw e;
            }
            else {
                options?.onError(e)
            }
        }
    }
    onMounted(async () => {
        isInit.value = true
        if (options?.onInit) {
            options.onInit()
        }

        // Observer function is called on init, so don't need to call here
        // await updateRef()
        observer = db.changes({
            since: 'now',
            live: true
        }).on('change', async () => {
            if (options?.onChange) {
                options.onChange()
            }
            await updateRef()
        })
    })
    onUnmounted(() => {
        observer?.cancel()
    })

    watchEffect(async () => {
        await updateRef()
    })
    return {
        content: readonly(contentWrite),
        isLoading: readonly(isLoading),
        isLoaded: readonly(isLoaded),
        isError: readonly(isError),
        error: readonly(error)
    }
}

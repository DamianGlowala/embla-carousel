import {
  Ref,
  MaybeRefOrGetter,
  isRef,
  toValue,
  watch,
  onBeforeUnmount,
  shallowRef
} from 'vue'
import { areOptionsEqual, arePluginsEqual } from 'embla-carousel-reactive-utils'
import EmblaCarousel, {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType
} from 'embla-carousel'

export type UseEmblaCarouselType = [
  Ref<HTMLElement | undefined>,
  Ref<EmblaCarouselType | undefined>,
  EmblaCarouselType
]

function useEmblaCarousel(
  options: MaybeRefOrGetter<EmblaOptionsType> = {},
  plugins: MaybeRefOrGetter<EmblaPluginType[]> = []
): UseEmblaCarouselType {
  EmblaCarousel.globalOptions = useEmblaCarousel.globalOptions

  const isReactiveOptions = isRef(options) || typeof options === 'function'
  const isReactivePlugins = isRef(plugins) || typeof plugins === 'function'

  let storedOptions = toValue(options)
  let storedPlugins = toValue(plugins)

  const serverApi = EmblaCarousel(null, storedOptions, storedPlugins)
  const clientApi = shallowRef<EmblaCarouselType>()
  const rootNode = shallowRef<HTMLElement>()

  function reInit(): void {
    if (!clientApi.value) return
    clientApi.value.reInit(storedOptions, storedPlugins)
  }

  watch(
    () => rootNode.value,
    (node) => {
      if (clientApi.value) {
        clientApi.value.destroy()
        clientApi.value = undefined
      }

      if (node) {
        EmblaCarousel.globalOptions = useEmblaCarousel.globalOptions
        clientApi.value = EmblaCarousel(node, storedOptions, storedPlugins)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (clientApi.value) clientApi.value.destroy()
  })

  if (isReactiveOptions) {
    watch(options, (newOptions) => {
      if (areOptionsEqual(storedOptions, newOptions)) return
      storedOptions = newOptions
      reInit()
    })
  }

  if (isReactivePlugins) {
    watch(plugins, (newPlugins) => {
      if (arePluginsEqual(storedPlugins, newPlugins)) return
      storedPlugins = newPlugins
      reInit()
    })
  }

  return [rootNode, clientApi, serverApi]
}

declare namespace useEmblaCarousel {
  let globalOptions: EmblaOptionsType | undefined
}

useEmblaCarousel.globalOptions = undefined

export default useEmblaCarousel

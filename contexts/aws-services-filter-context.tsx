'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export type SortType = 'simpleName' | 'category' | 'fullName'
export type PrefixDisplayType = 'with' | 'without'

type LayoutMode = 'card' | 'list' | 'icon'

interface AwsServicesFilterContextProps {
  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
  layoutMode: LayoutMode
  setLayoutMode: (v: LayoutMode) => void
  sortType: SortType
  setSortType: React.Dispatch<React.SetStateAction<SortType>>
  prefixDisplay: PrefixDisplayType
  setPrefixDisplay: React.Dispatch<React.SetStateAction<PrefixDisplayType>>
}

const QUERY_PARAMS = {
  categories: 'categories',
  layout: 'view',
  prefixDisplay: 'prefix',
}

export const AwsServicesFilterContext = createContext<
  AwsServicesFilterContextProps | undefined
>(undefined)

export function AwsServicesFilterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialCategories = searchParams.get(QUERY_PARAMS.categories)
    ? searchParams.get(QUERY_PARAMS.categories)!.split(',')
    : []
  const initialLayoutMode =
    (searchParams.get(QUERY_PARAMS.layout) as LayoutMode) || 'card'
  const initialSortType =
    (searchParams.get('sort') as SortType) || 'category'
  const initialPrefixDisplay =
    (searchParams.get(QUERY_PARAMS.prefixDisplay) as PrefixDisplayType) || 'without'

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initialLayoutMode)
  const [sortType, setSortType] = useState<SortType>(initialSortType)
  const [prefixDisplay, setPrefixDisplay] = useState<PrefixDisplayType>(initialPrefixDisplay)

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategories.length > 0)
      params.set(QUERY_PARAMS.categories, selectedCategories.join(','))
    if (layoutMode !== 'card') params.set(QUERY_PARAMS.layout, layoutMode)
    if (sortType !== 'simpleName') params.set('sort', sortType)
    if (prefixDisplay !== 'with') params.set(QUERY_PARAMS.prefixDisplay, prefixDisplay)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [selectedCategories, layoutMode, sortType, prefixDisplay])

  const contextValue = useMemo(() => {
    return {
      selectedCategories,
      setSelectedCategories,
      layoutMode,
      setLayoutMode,
      sortType,
      setSortType,
      prefixDisplay,
      setPrefixDisplay,
    }
  }, [selectedCategories, layoutMode, sortType, prefixDisplay])

  return (
    <AwsServicesFilterContext.Provider value={contextValue}>
      {children}
    </AwsServicesFilterContext.Provider>
  )
}

export function useAwsServicesFilter() {
  const ctx = useContext(AwsServicesFilterContext)
  if (!ctx) {
    throw new Error('useAwsServicesFilter must be used within AwsServicesFilterProvider')
  }
  return ctx
}

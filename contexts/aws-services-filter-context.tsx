'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type LayoutMode = 'card' | 'list'

interface AwsServicesFilterContextProps {
  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
  layoutMode: LayoutMode
  setLayoutMode: (v: LayoutMode) => void
}

const QUERY_PARAMS = {
  categories: 'categories',
  layout: 'view',
}

const AwsServicesFilterContext = createContext<
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

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initialLayoutMode)

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategories.length > 0)
      params.set(QUERY_PARAMS.categories, selectedCategories.join(','))
    if (layoutMode !== 'card') params.set(QUERY_PARAMS.layout, layoutMode)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [selectedCategories, layoutMode])

  const contextValue = useMemo(() => {
    return {
      selectedCategories,
      setSelectedCategories,
      layoutMode,
      setLayoutMode,
    }
  }, [selectedCategories, layoutMode])

  return (
    <AwsServicesFilterContext.Provider value={contextValue}>
      {children}
    </AwsServicesFilterContext.Provider>
  )
}

export function useAwsServicesFilter() {
  const ctx = useContext(AwsServicesFilterContext)
  if (!ctx)
    throw new Error(
      'useAwsServicesFilter must be used within AwsServicesFilterProvider'
    )
  return ctx
}

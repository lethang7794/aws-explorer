import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Grid, BoxSelect, X } from 'lucide-react'
import { awsServiceCategories, type Service } from '@/lib/aws-services-data'
import {
  SortType,
  PrefixDisplayType,
  useAwsServicesFilter,
} from '@/contexts/aws-services-filter-context'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { scrollTop } from '@/helpers/scroll-top'
import { PAGE_SIZES } from '@/components/services-list'
import { cn } from '@/lib/utils'

export function SearchFilterSection({
  handleCategoryChange,
  services,
  searchTerm,
  selectedCategories,
  serviceCountOfSelectedCategories,
  setPage,
  setSearchTerm,
  pageSize,
  handlePageSizeChange,
  className,
  totalServices,
}: {
  handleCategoryChange: (c: string) => void
  services: Service[]
  searchTerm: string
  selectedCategories: string[]
  serviceCountOfSelectedCategories: number
  setPage: (p: number) => void
  setSearchTerm: (s: string) => void
  pageSize: number
  handlePageSizeChange: (p: number) => void
  className?: string
  totalServices: number
}) {
  return (
    <aside
      className={cn(
        'flex flex-col-reverse md:block md:col-span-1 space-y-3 md:space-y-6 p-6 pt-2 md:pt-6 bg-card rounded-lg shadow self-start md:sticky md:top-[136px] md:h-fit',
        className
      )}
    >
      <SearchInputSection
        services={services}
        searchTerm={searchTerm}
        selectedCategories={selectedCategories}
        serviceCountOfSelectedCategories={serviceCountOfSelectedCategories}
        setSearchTerm={setSearchTerm}
        totalServices={totalServices}
      />
      <CategoriesInputSection
        services={services}
        handleCategoryChange={handleCategoryChange}
        setPage={setPage}
      />
      <SortInputSection setPage={setPage} />
      <ServiceNamePrefixInputSection />
      <LayoutInputSection />
      <PageSizeInputSection
        pageSize={pageSize}
        handlePageSizeChange={handlePageSizeChange}
        totalServices={totalServices}
      />
    </aside>
  )
}

function SearchInputSection({
  services,
  searchTerm,
  selectedCategories,
  serviceCountOfSelectedCategories,
  setSearchTerm,
  totalServices,
}: {
  services: Service[]
  searchTerm: string
  selectedCategories: string[]
  serviceCountOfSelectedCategories: number
  setSearchTerm: (s: string) => void
  totalServices: number
}) {
  return (
    <div className="mt-4 md:mt-0">
      <h2 className="text-xl font-semibold mb-3">
        <SearchHeader
          servicesCount={services.length}
          selectedCategoriesCount={selectedCategories.length}
          serviceCountOfSelectedCategories={serviceCountOfSelectedCategories}
          totalServices={totalServices}
        />
      </h2>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search by name or description ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X />
          </button>
        )}
      </div>
    </div>
  )
}

function SearchHeader({
  servicesCount: initialServicesCount,
  selectedCategoriesCount,
  serviceCountOfSelectedCategories,
  totalServices,
}: {
  servicesCount: number
  selectedCategoriesCount: number
  serviceCountOfSelectedCategories: number
  totalServices: number
}) {
  return (
    <>
      Search in{' '}
      {selectedCategoriesCount
        ? serviceCountOfSelectedCategories
        : totalServices}{' '}
      services
      {selectedCategoriesCount > 0 ? (
        <span className="text-sm font-normal">
          {selectedCategoriesCount === 1
            ? ` (of ${selectedCategoriesCount} category)`
            : ` (of ${selectedCategoriesCount} categories)`}
        </span>
      ) : (
        ''
      )}
    </>
  )
}

function CategoriesInputSection({
  services,
  setPage,
  handleCategoryChange,
}: {
  services: Service[]
  handleCategoryChange: (category: string) => void
  setPage: (p: number) => void
}) {
  const { selectedCategories, setSelectedCategories } = useAwsServicesFilter()

  // Memoize category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const { name: category } of awsServiceCategories) {
      counts[category] = services.filter((service) =>
        service.categories.includes(category)
      ).length
    }
    return counts
  }, [services])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        Filter by Category
        {selectedCategories.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategories([])
              setPage(1) // Reset to first page
              scrollTop()
            }}
            className="ml-2 py-1 h-auto text-sm text-primary hover:underline"
          >
            Clear all filters
          </Button>
        )}
      </h2>
      <div className="space-y-2 max-h-36 md:max-h-72 overflow-y-auto pr-2">
        {awsServiceCategories.map(({ name: category, icon }) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => handleCategoryChange(category)}
            />
            <Label
              htmlFor={`category-${category}`}
              className="flex-grow flex items-center gap-2 text-sm font-medium cursor-pointer"
            >
              <img src={`/aws/${icon}.svg`} alt={icon} className="h-5 w-5" />
              <div className="flex-grow">{category}</div>
              <span className="ml-0 text-sm text-muted-foreground">
                ({categoryCounts[category]})
              </span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function SortInputSection({ setPage }: { setPage: (p: number) => void }) {
  const { sortType, setSortType } = useAwsServicesFilter()

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Sort by</h2>
      <div className="flex flex-wrap gap-2">
        <RadioGroup
          value={sortType}
          onValueChange={(value: SortType) => {
            setSortType(value)
            setPage(1) // Reset to first page
            scrollTop()
          }}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="category" id="sort-category" />
            <Label htmlFor="sort-category">Category</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="simpleName" id="sort-simpleName" />
            <Label htmlFor="sort-simpleName">Alphabet</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="fullName" id="sort-fullName" />
            <Label htmlFor="sort-fullName">Alphabet (with Amazon/AWS)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

function ServiceNamePrefixInputSection() {
  const { prefixDisplay, setPrefixDisplay } = useAwsServicesFilter()

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Amazon/AWS in Service Name</h2>
      <div className="flex flex-wrap gap-2">
        <RadioGroup
          value={prefixDisplay}
          onValueChange={(value: PrefixDisplayType) => {
            setPrefixDisplay(value)
          }}
          className="flex flex-wrap gap-3"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="without" id="prefix-without" />
            <Label htmlFor="prefix-without">Without</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="with" id="prefix-with" />
            <Label htmlFor="prefix-with">With</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

function LayoutInputSection() {
  const { layoutMode, setLayoutMode } = useAwsServicesFilter()

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Layout</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={layoutMode === 'card' ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setLayoutMode('card')}
          aria-label="Card view"
          className="w-fit px-2"
        >
          <LayoutGrid className="h-5 w-5" />
          Grid
        </Button>
        <Button
          variant={layoutMode === 'list' ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setLayoutMode('list')}
          aria-label="List view"
          className="w-fit px-2"
        >
          <List className="h-5 w-5" /> List
        </Button>
        <Button
          variant={layoutMode === 'icon' ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setLayoutMode('icon')}
          aria-label="Icon view"
          className="w-fit px-2"
        >
          <Grid className="h-5 w-5" /> Icon
        </Button>
        <Button
          variant={layoutMode === 'drawio' ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setLayoutMode('drawio')}
          aria-label="Draw.io view"
          className="w-fit px-2"
        >
          <BoxSelect className="h-5 w-5" /> Draw.io
        </Button>
      </div>
    </div>
  )
}

function PageSizeInputSection({
  pageSize,
  handlePageSizeChange,
  totalServices,
}: {
  pageSize: number
  handlePageSizeChange: (size: number) => void
  totalServices: number
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Items per page</h2>
      <div className="flex flex-wrap gap-2">
        {[...PAGE_SIZES, totalServices].map((size) => (
          <Button
            key={size}
            variant={pageSize === size ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handlePageSizeChange(size)}
            className="w-fit px-2"
          >
            {size === totalServices ? `All ${size} services` : size}
          </Button>
        ))}
      </div>
    </div>
  )
}

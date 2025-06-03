import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Grid } from 'lucide-react'
import { awsServiceCategories, type Service } from '@/lib/aws-services-data'
import {
  SortType,
  PrefixDisplayType,
  useAwsServicesFilter,
} from '@/contexts/aws-services-filter-context'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { scrollTop } from '@/helpers/scroll-top'

export function SearchFilterSection({
  handleCategoryChange,
  services,
  searchTerm,
  selectedCategories,
  serviceCountOfSelectedCategories,
  setPage,
  setSearchTerm,
}: {
  handleCategoryChange: (c: string) => void
  services: Service[]
  searchTerm: string
  selectedCategories: string[]
  serviceCountOfSelectedCategories: number
  setPage: (p: number) => void
  setSearchTerm: (s: string) => void
}) {
  return (
    <aside className="flex flex-col-reverse md:block md:col-span-1 space-y-3 md:space-y-6 p-6 pt-2 md:pt-6 bg-card rounded-lg shadow self-start md:sticky md:top-[136px] md:h-fit">
      <SearchInputSection
        services={services}
        searchTerm={searchTerm}
        selectedCategories={selectedCategories}
        serviceCountOfSelectedCategories={serviceCountOfSelectedCategories}
        setSearchTerm={setSearchTerm}
      />
      <CategoriesInputSection
        services={services}
        handleCategoryChange={handleCategoryChange}
        setPage={setPage}
      />
      <SortInputSection setPage={setPage} />
      <ServiceNamePrefixInputSection />
      <LayoutInputSection />
    </aside>
  )
}

function SearchInputSection({
  services,
  searchTerm,
  selectedCategories,
  serviceCountOfSelectedCategories,
  setSearchTerm,
}: {
  services: Service[]
  searchTerm: string
  selectedCategories: string[]
  serviceCountOfSelectedCategories: number
  setSearchTerm: (s: string) => void
}) {
  return (
    <div className="mt-4 md:mt-0">
      <h2 className="text-xl font-semibold mb-3">
        <SearchHeader
          servicesCount={services.length}
          selectedCategoriesCount={selectedCategories.length}
          serviceCountOfSelectedCategories={serviceCountOfSelectedCategories}
        />
      </h2>
      <Input
        type="text"
        placeholder="Search by name or description ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div>
  )
}

function SearchHeader({
  servicesCount: initialServicesCount,
  selectedCategoriesCount,
  serviceCountOfSelectedCategories,
}: {
  servicesCount: number
  selectedCategoriesCount: number
  serviceCountOfSelectedCategories: number
}) {
  return (
    <>
      Search{' '}
      {selectedCategoriesCount > 0
        ? serviceCountOfSelectedCategories === 1
          ? `in 1 service`
          : `in ${serviceCountOfSelectedCategories} services`
        : initialServicesCount === 1
          ? `in 1 service`
          : `in ${initialServicesCount} services`}
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
      <div className="space-y-2 max-h-36 md:max-h-96 overflow-y-auto pr-2">
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
      </div>
    </div>
  )
}

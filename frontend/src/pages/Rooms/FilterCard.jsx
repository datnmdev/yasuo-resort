import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { Button } from '@ui/button';
import { Search, Users, DollarSign, XCircle, SlidersHorizontal } from 'lucide-react';

export function FilterCard({
  isFiltered,
  filterState,
  setFilterState,
  handleApplyFilters,
  handleClearFilters,
  roomTypes,
  className,
}) {
  return (
    <Card className={`p-6 border-none shadow-sm bg-white/50 ${className}`}>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6" />
          Filter Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Room Number */}
          <div className="relative col-span-2">
            <Label htmlFor="search-room" className="mb-2 block">
              Search Room Number
            </Label>
            <Search className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search-room"
              placeholder="Search by room number..."
              value={filterState.keyword}
              onChange={(e) => setFilterState((prev) => ({ ...prev, keyword: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Room Type */}
          <div>
            <Label htmlFor="room-type" className="mb-2 block">
              Room Type
            </Label>
            <Select
              value={filterState.typeId}
              onValueChange={(value) => setFilterState((prev) => ({ ...prev, typeId: value }))}
            >
              <SelectTrigger id="room-type">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Guests */}
          <div>
            <Label htmlFor="num-guests" className="mb-2 block">
              Number of Guests
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="num-guests"
                type="number"
                placeholder="Guests"
                value={filterState.numGuests}
                onChange={(e) => setFilterState((prev) => ({ ...prev, numGuests: e.target.value }))}
                className="pl-10"
                min="1"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label htmlFor="min-price" className="mb-2 block">
              Min Price
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="min-price"
                type="number"
                placeholder="Min"
                value={filterState.priceRange.minPrice}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, minPrice: e.target.value },
                  }))
                }
                className="pl-10"
                min="0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="max-price" className="mb-2 block">
              Max Price
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="max-price"
                type="number"
                placeholder="Max"
                value={filterState.priceRange.maxPrice}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, maxPrice: e.target.value },
                  }))
                }
                className="pl-10"
                min="0"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4 col-span-full">
            <div>
              <Label htmlFor="check-in-date" className="mb-2 block">
                Check-in Date
              </Label>
              <Input
                id="check-in-date"
                type="date"
                value={filterState.dateRange.startDate}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, startDate: e.target.value },
                  }))
                }
                min={new Date().toISOString().split('T')[0]}
                className="flex-1"
              />
            </div>
            <div>
              <Label htmlFor="check-out-date" className="mb-2 block">
                Check-out Date
              </Label>
              <Input
                id="check-out-date"
                type="date"
                value={filterState.dateRange.endDate}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, endDate: e.target.value },
                  }))
                }
                min={filterState.dateRange.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 col-span-full">
            {!isFiltered && (
              <Button onClick={handleApplyFilters} className="flex-1 bg-teal-700 hover:bg-teal-700/90" size="lg">
                Apply Filters
              </Button>
            )}
            <Button onClick={handleClearFilters} variant="outline" className="flex-1" size="lg">
              <XCircle className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

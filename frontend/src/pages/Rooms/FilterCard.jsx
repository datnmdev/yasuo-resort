import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { Button } from '@ui/button';
import { Users, XCircle, SlidersHorizontal } from 'lucide-react';
import dayjs from 'dayjs';
import { Slider } from 'antd';
import { formatCurrencyUSD } from '@libs/utils';
import RecommendRoom from './RecommendRoom';
import Cookies from 'js-cookie';

const MIN = 0;
const MAX = 5000;
const accessToken = Cookies.get('accessToken');
export function FilterCard({ filterState, setFilterState, handleClearFilters, roomTypes, className }) {

  return (
    <>

      <Card className={`p-6 border-none shadow-sm bg-white/50 ${className}`}>
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6" />
            Filter Rooms
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  value={filterState.maxPeople}
                  onChange={(e) => setFilterState((prev) => ({ ...prev, maxPeople: e.target.value }))}
                  className="pl-10"
                  min="1"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="col-span-2">
              <Label className="mb-2 block">Price Range</Label>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{formatCurrencyUSD(filterState.priceRange.minPrice || MIN)}</span>
                <span>{formatCurrencyUSD(filterState.priceRange.maxPrice || MAX)}</span>
              </div>

              <Slider
                range
                min={MIN}
                max={MAX}
                step={100}
                value={[Number(filterState.priceRange.minPrice || MIN), Number(filterState.priceRange.maxPrice || MAX)]}
                onChange={([min, max]) =>
                  setFilterState((prev) => ({
                    ...prev,
                    priceRange: {
                      minPrice: String(min),
                      maxPrice: String(max),
                    },
                  }))
                }
              />
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
                  onBlur={(e) => {
                    let newStart = dayjs(e.target.value, 'YYYY-MM-DD', true);
                    const todayPlus1 = dayjs().add(1, 'day').startOf('day');

                    if (!newStart.isValid() || newStart.isBefore(todayPlus1)) {
                      newStart = todayPlus1;
                    }

                    setFilterState((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, startDate: newStart.format('YYYY-MM-DD') },
                    }));
                  }}
                  min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
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
                  onBlur={(e) => {
                    const startStr = filterState.dateRange.startDate;
                    const endStr = e.target.value;

                    let newStart = dayjs(startStr, 'YYYY-MM-DD', true);
                    let newEnd = dayjs(endStr, 'YYYY-MM-DD', true);

                    // Nếu checkout không hợp lệ hoặc < checkin => set checkout = checkin
                    if (!newEnd.isValid() || newEnd.isBefore(newStart)) {
                      newEnd = newStart;
                    }

                    setFilterState((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, endDate: newEnd.format('YYYY-MM-DD') },
                    }));
                  }}
                  min={
                    filterState.dateRange.startDate
                      ? dayjs(filterState.dateRange.startDate).format('YYYY-MM-DD')
                      : dayjs().add(1, 'day').format('YYYY-MM-DD')
                  }
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 col-span-full">
              <Button onClick={handleClearFilters} variant="outline" className="flex-1" size="lg">
                <XCircle className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {accessToken && <RecommendRoom />}
    </>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Cart from './Cart';
import ServiceCard from './ServiceCard';
import SupportBox from './SupportBox';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@ui/input';
import { Card, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import serviceApi from '@apis/service';

// const services = [
//     {
//       title: 'Massage Thái truyền thống',
//       desc: 'Massage thư giãn toàn thân với kỹ thuật Thái cổ truyền, giúp giảm căng thẳng và mệt mỏi',
//       price: 800000,
//     },
//     {
//       title: 'Chăm sóc da mặt cao cấp',
//       desc: 'Liệu trình chăm sóc da mặt với sản phẩm thiên nhiên, làm sạch sâu và nuôi dưỡng da',
//       price: 1200000,
//     },
//     {
//       title: 'Tắm bùn khoáng',
//       desc: 'Tắm bùn khoáng thiên nhiên giúp thải độc và làm mềm da',
//       price: 600000,
//     },
//     {
//       title: 'BBQ Hải sản bãi biển',
//       desc: 'Tiệc nướng hải sản tươi sống ngay trên bãi biển với view hoàng hôn tuyệt đẹp',
//       price: 1500000,
//     },
//   ];

export default function ServicePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['services', currentPage, searchQuery],
    queryFn: () =>
      serviceApi.getServices({
        page: currentPage,
        limit,
        keyword: searchQuery,
      }),
    keepPreviousData: true,
  });

  const services = data.data?.data[0] || [];
  const totalPages = Math.ceil(data.data?.data[1] || 1 / limit);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 h-12 bg-white rounded-lg outline-none border border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-300 bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {services.map((service, idx) => (
                <ServiceCard key={idx} service={service} />
              ))}
            </div>

            {services.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
                <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="transition-colors duration-200 hover:bg-green-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={`transition-colors duration-200 hover:bg-green-700 ${
                      currentPage === page ? 'bg-green-600 ' : ''
                    }`}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="transition-colors duration-200 hover:bg-green-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="space-y-6">
        <Cart />
        <SupportBox />
      </div>
    </div>
  );
}

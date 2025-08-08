import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal } from 'antd';
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import { formatCurrencyUSD } from '@src/libs/utils';
import SignaturePad from 'signature_pad';
import bookingApi from '@apis/booking';
import service from '@apis/service';
import uploadApi from '@apis/upload';
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useReactToPrint } from 'react-to-print';

export default function Contract() {
  // Lấy thông tin user từ Redux store
  const user = useSelector(userSelector.selectUser);

  // State quản lý danh sách hợp đồng
  const [contracts, setContracts] = useState([]);
  console.log("check contract abc", contracts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // State quản lý PDF preview
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState(null);
  const [isOpenPdfModal, setOpenPdfModal] = useState(false);

  // State quản lý ký hợp đồng và hủy booking
  const [bookingToSign, setBookingToSign] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Refs cho signature pad (canvas vẽ chữ ký)
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  // State quản lý các modal
  const [isOpenSignModal, setOpenSignModal] = useState(false); // Modal ký hợp đồng
  const [isOpenCancelBooking, setIsOpenCancelBooking] = useState(false); // Modal hủy booking
  const [isOpenAppendixModal, setIsOpenAppendixModal] = useState(false); // Modal xem phụ lục hợp đồng

  // State quản lý chỉnh sửa dịch vụ
  const [editingServiceId, setEditingServiceId] = useState(null); // ID service đang được edit
  const [editedService, setEditedService] = useState({}); // Dữ liệu service đang edit

  // State quản lý in phụ lục hợp đồng
  const [contractToViewAppendix, setContractToViewAppendix] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  console.log("contractToViewAppendix", contractToViewAppendix);

  // Mapping trạng thái dịch vụ với label và styling
  const serviceStatusMap = {
    pending: { label: '⏳ Pending', className: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs' },
    confirmed: { label: '✅ Confirmed', className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' },
    cancelled: { label: '❌ Cancelled', className: 'bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs' },
    rejected: { label: '🚫 Rejected', className: 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs' },
  };
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Contract-Appendix-${contractToViewAppendix?.id || ''}`,
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (contractToViewAppendix && printRef.current) {
      setTimeout(() => {
        console.log("In ref:", printRef.current);
        handlePrint();
      }, 200);
    }
  }, [contractToViewAppendix]);

  // Function xác định trạng thái hiển thị của hợp đồng
  const getContractStatusDisplay = (contract) => {
    const today = new Date().toISOString().split("T")[0];
    const isEnded = contract.status === 'confirmed' && contract.endDate < today;

    // Nếu hợp đồng đã kết thúc (confirmed nhưng quá ngày kết thúc)
    if (isEnded) {
      return {
        label: '📅 Contract Ended',
        className: 'bg-blue-100 text-blue-700',
      };
    }

    const map = {
      pending: {
        label: '⏳ Pending',
        className: 'bg-yellow-100 text-yellow-700',
      },
      confirmed: {
        label: '✅ Confirmed',
        className: 'bg-green-100 text-green-700',
      },
      rejected: {
        label: '🚫 Rejected',
        className: 'bg-red-100 text-red-700',
      },
      cancelled: {
        label: '❌ Cancelled',
        className: 'bg-gray-200 text-gray-600',
      },
    };

    return map[contract.status] || {
      label: contract.status,
      className: 'bg-gray-200 text-gray-600',
    };
  };


  // Function lấy danh sách hợp đồng của user từ API
  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getBookings({ page: 1, limit: 100 });
      const bookings = res.data.data[0] || [];
      // Lọc chỉ lấy booking của user hiện tại
      const userBookings = bookings.filter((b) => b.userId === user?.id);
      setContracts(userBookings);
    } catch (err) {
      setError('Không thể tải hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  // Effect: Tải danh sách hợp đồng khi user đã đăng nhập
  useEffect(() => {
    if (user?.id) fetchContracts();
  }, [user?.id]);

  // Effect: Khởi tạo signature pad khi modal ký hợp đồng được mở
  useEffect(() => {
    if (isOpenSignModal && canvasRef.current) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        // Lấy width của parent element để responsive
        const parentWidth = canvas.parentElement?.getBoundingClientRect().width || 600;

        // Set kích thước canvas
        canvas.width = parentWidth;
        canvas.height = parentWidth / 2;

        // Khởi tạo nền trắng cho canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Khởi tạo SignaturePad
        signaturePadRef.current = new SignaturePad(canvas, {
          backgroundColor: '#fff',
        });
      }, 0); // delay 1 frame để DOM render xong
    }
  }, [isOpenSignModal]);

  // Function xử lý ký hợp đồng
  const handleSignContract = async () => {
    // Kiểm tra xem đã ký chưa
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      return toast.warning('Please sign before submitting!');
    }

    // Chuyển đổi signature từ canvas thành file
    const dataUrl = signaturePadRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload signature file lên server
      const uploadRes = await uploadApi.uploadFile(formData);
      const signaturePath = uploadRes.data?.path?.replace(/\//g, '/');

      // Gửi API ký hợp đồng với signature URL
      await bookingApi.userSignTheContract({
        param: {
          bookingId: bookingToSign.id,
        },
        body: {
          signatureUrl: signaturePath,
        },
      });

      // Đóng modal và reset state
      setOpenSignModal(false);
      setBookingToSign(null);

      // Refresh lại danh sách hợp đồng
      const refreshed = await bookingApi.getBookings({ page: 1, limit: 100 });
      const refreshedBookings = refreshed.data.data[0] || [];
      setContracts(refreshedBookings.filter((b) => b.userId === user?.id));
    } catch (err) {
      toast.error('Signing failed!');
    }
  };
  // Function đóng modal ký hợp đồng và cleanup
  const handleCloseSignModal = () => {
    setOpenSignModal(false);
    setTimeout(() => {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear(); // Xóa chữ ký
        signaturePadRef.current.off(); // Remove event listeners
      }
    }, 300); // Đợi modal đóng hoàn toàn trước khi cleanup
  };

  // Function xử lý hủy booking
  const handleCancelBooking = async () => {
    try {
      // Gọi API hủy booking
      await bookingApi.cancelBooking({
        param: { bookingId: bookingToCancel.id },
      });

      // Đóng modal và reset state
      setIsOpenCancelBooking(false);
      setBookingToCancel(null);

      // Refresh lại danh sách hợp đồng
      await fetchContracts();
    } catch (err) {
      toast.error('Booking cancellation failed!');
    }
  };
  // Function xử lý hủy dịch vụ
  const handleCancelService = async (serviceId) => {
    try {
      // Tìm service trong tất cả contracts
      const serviceCheck = contracts
        .flatMap(c => c.bookingServices || [])
        .find(s => s.id === serviceId);

      if (!serviceCheck) return toast.error("Service not found");

      // Kiểm tra xem service đã bắt đầu chưa
      const today = new Date().toISOString().split("T")[0];
      const isStarted = service.startDate <= today;

      if (isStarted) {
        return toast.warning("Service has already started. You cannot cancel it.");
      }
      // Gọi API hủy service
      console.log("serviceId", serviceId);
      await service.cancelBookedService({ serviceId });
      console.log("Service cancelled successfully");
      toast.success("Service cancelled successfully");

      // Refresh lại danh sách hợp đồng
      await fetchContracts();

    } catch (err) {
      console.error("Failed to cancel service", err);
      toast.error("Failed to cancel service");
    }
  };

  // Helper function: Format date thành string YYYY-MM-DD
  const formatDate = (date) => new Date(date).toISOString().split("T")[0];

  // Helper function: Lấy ngày bắt đầu tối thiểu (hôm nay hoặc ngày bắt đầu contract)
  const getMinStartDate = (contractStart) => {
    const today = new Date();
    const start = new Date(contractStart);
    return formatDate(today > start ? today : start);
  };

  // Function xử lý xác nhận chỉnh sửa service
  const handleConfirmEdit = async (serviceId, contract) => {
    console.log('handleConfirmEdit called with:', { serviceId, editedService });
    const { quantity, startDate, endDate } = editedService;
    const today = new Date().toISOString().split("T")[0];

    // Tìm service hiện tại trong contract
    const currentService = contract.bookingServices.find(s => s.id === serviceId);
    if (!currentService) {
      return toast.error('Service not found.');
    }

    // Validation: Kiểm tra dữ liệu đầu vào
    if (!quantity || !startDate || !endDate) {
      console.log('Missing data:', { quantity, startDate, endDate });
      return toast.warning('Please enter complete information.');
    }

    // Validation: Ngày bắt đầu phải >= ngày tối thiểu
    if (new Date(startDate) < new Date(getMinStartDate(contract.startDate))) {
      return toast.error('Invalid start date.');
    }

    // Validation: Ngày kết thúc phải sau ngày bắt đầu
    if (new Date(endDate) < new Date(startDate)) {
      return toast.warning('End date must be after start date.');
    }

    // Validation: Ngày kết thúc phải trước ngày kết thúc contract
    if (new Date(endDate) > new Date(contract.endDate)) {
      return toast.warning('End date must be before contract end date.');
    }

    // Validation: Không thể thay đổi số lượng nếu service đã bắt đầu
    if (new Date(currentService.startDate) <= new Date() && editedService.quantity !== currentService.quantity) {
      return toast.warning('Number of people cannot be changed once service has started..');
    }

    // Validation: Kiểm tra trùng thời gian với cùng loại dịch vụ
    const overlapping = contract.bookingServices.some((other) => {
      // Bỏ qua nếu khác loại service hoặc chính service đang edit
      if (other.serviceId !== currentService.serviceId || other.id === serviceId) return false;

      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      const otherStart = new Date(other.startDate);
      const otherEnd = new Date(other.endDate);

      // Kiểm tra có giao thời gian không
      return newStart <= otherEnd && newEnd >= otherStart;
    });

    if (overlapping) {
      return toast.warning('This service usage time overlaps with another booking (same service).');
    }

    try {
      // Gọi API cập nhật service
      await service.updateBookedService(
        { serviceId: serviceId },
        { quantity: Number(quantity), startDate, endDate }
      );

      // Reset editing state
      setEditingServiceId(null);
      setEditedService({});

      // Refresh lại danh sách hợp đồng
      await fetchContracts();
    } catch (err) {
      toast.error('Update failed!');
    }
  };

  // === RENDER JSX ===
  return (
    // Animation wrapper với Framer Motion
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Your booking contract</h1>
          <p className="text-gray-600">View details of created contracts/bookings.</p>
        </div>
        {/* Filter section */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {/* Main content với conditional rendering */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : contracts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">You don't have any contract yet</div>
        ) : (
          <div className="space-y-8">
            {/* Danh sách contracts sau khi filter */}
            {contracts
              .filter((contract) => {
                if (filterStatus === 'all') return true;
                return contract.status === filterStatus;
              })
              .map((contract) => (
                <div key={contract.id} className="bg-white p-6 rounded shadow">
                  {/* Contract card */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                    <div>
                      <div className="font-semibold text-lg text-teal-700">Booking code: #{contract.id}</div>
                      {/* Hiển thị lý do từ chối nếu contract bị reject */}
                      {contract.status === 'rejected' && contract.reasonForRejection && (
                        <div className="text-red-600 font-medium mb-4 p-3 bg-red-50 border border-red-200 rounded">
                          <span className="font-semibold">❌ Rejected by admin:</span>
                          <div
                            className="mt-1 text-red-700"
                            dangerouslySetInnerHTML={{ __html: contract.reasonForRejection }}
                          />
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Date created: {new Date(contract.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {/* status hợp đồng - span */}
                    < div >
                      {(() => {
                        const statusInfo = getContractStatusDisplay(contract);

                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="font-medium mb-1">Customer</div>
                      <div className="text-gray-700">{contract.user?.name}</div>
                      <div className="text-gray-500 text-sm">Email: {contract.user?.email}</div>
                      <div className="text-gray-500 text-sm">Phone: {contract.user?.phone}</div>
                      <div className="text-gray-500 text-sm">Citizen identification: {contract.user?.cccd}</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Room</div>
                      <div className="text-gray-700">
                        {contract.room?.roomNumber} ({contract.room?.type?.name})
                      </div>
                      <div className="text-gray-500 text-sm">Date in: {contract.startDate}</div>
                      <div className="text-gray-500 text-sm">Date out: {contract.endDate}</div>
                      <div className="text-gray-500 text-sm">Room's price: {formatCurrencyUSD(contract.roomPrice)}</div>
                      <div className="text-gray-500 text-sm">Total: {formatCurrencyUSD(contract.totalPrice)}</div>
                    </div>
                  </div>
                  <div className="mb-2 font-medium">Additional services</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Service Name</th>
                          <th className="px-3 py-2 text-left">Number of people</th>
                          <th className="px-3 py-2 text-left">Start Date</th>
                          <th className="px-3 py-2 text-left">End Date</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contract.bookingServices?.length > 0 ? (
                          contract.bookingServices.map((s) => {
                            const isEditing = editingServiceId === s.id;
                            return (
                              <tr key={s.id} className="border-b last:border-0">
                                <td className="px-3 py-2">{s.service?.name}</td>
                                <td className="px-3 py-2">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      min={1}
                                      max={contract.room?.maxPeople}
                                      className="border px-2 py-1 w-20"
                                      value={editedService.quantity ?? s.quantity}
                                      onChange={(e) => setEditedService({ ...editedService, quantity: e.target.value })}
                                      disabled={new Date(s.startDate) <= new Date()} // khóa nếu dịch vụ đã bắt đầu
                                    />
                                  ) : (
                                    s.quantity
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      className="border px-2 py-1"
                                      min={getMinStartDate(contract.startDate)}
                                      max={formatDate(contract.endDate)}
                                      value={editedService.startDate ?? s.startDate}
                                      onChange={(e) => setEditedService({ ...editedService, startDate: e.target.value })}
                                    />
                                  ) : (
                                    s.startDate
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      className="border px-2 py-1"
                                      min={editedService.startDate ?? s.startDate}
                                      max={formatDate(contract.endDate)}
                                      value={editedService.endDate ?? s.endDate}
                                      onChange={(e) => setEditedService({ ...editedService, endDate: e.target.value })}
                                    />
                                  ) : (
                                    s.endDate
                                  )}
                                </td>
                                <td className="px-3 py-2 relative">
                                  <div>
                                    {s.status === 'rejected' && s.reasonForRejection ? (
                                      <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold cursor-pointer relative"
                                        onMouseEnter={() => setHoveredServiceId(s.id)}
                                        onMouseLeave={() => setHoveredServiceId(null)}
                                      >
                                        ❌ Rejected
                                        {hoveredServiceId === s.id && (
                                          <div
                                            className="absolute left-full top-0 z-20 ml-2 w-64 bg-white border border-red-200 rounded shadow-lg p-3 text-xs text-red-700"
                                            style={{ transform: 'translateY(-30%)' }}
                                          >
                                            <span className="font-semibold">Reason:</span>
                                            <div className="mt-1" dangerouslySetInnerHTML={{ __html: s.reasonForRejection }} />
                                          </div>
                                        )}
                                      </span>
                                    ) : (
                                      <span className={serviceStatusMap[s.status]?.className || 'text-gray-500'}>
                                        {serviceStatusMap[s.status]?.label || s.status}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{formatCurrencyUSD(s.price)}/person/day</td>
                                <td className="px-2 py-2"> {/* Cột chứa nút */}
                                  {isEditing ? (
                                    <>
                                      <button
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                        onClick={() => handleConfirmEdit(s.id, contract)}
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        onClick={() => {
                                          setEditingServiceId(null);
                                          setEditedService({});
                                        }}
                                      >
                                        Exit Edit
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                      disabled={contract.status === 'cancelled'}
                                      onClick={() => {
                                        const today = new Date().toISOString().split("T")[0];
                                        const isStarted = s.startDate <= today;
                                        const isEditable = s.status === 'pending' && !isStarted;
                                        if (!isEditable) {
                                          toast.warning("Only services with 'pending' status and not yet started can be edited.");
                                          return;
                                        }
                                        setEditingServiceId(s.id);
                                        setEditedService({ quantity: s.quantity, startDate: s.startDate, endDate: s.endDate });
                                      }}
                                    >
                                      Edit
                                    </button>
                                  )}

                                  {(() => {
                                    const today = new Date().toISOString().split("T")[0];
                                    const isStarted = s.startDate <= today;
                                    const isCancelled = s.status === 'cancelled';
                                    const isConfirmed = s.status === 'confirmed';
                                    const isRejected = s.status === 'rejected';
                                    const isDisabled = isStarted || isCancelled || isConfirmed || contract.status === 'cancelled' || isRejected;

                                    return (
                                      <button
                                        className={`px-3 py-1 rounded transition ${isDisabled
                                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                                          }`}
                                        disabled={isDisabled}
                                        onClick={() => handleCancelService(s.id)}
                                      >
                                        Cancel
                                      </button>
                                    );
                                  })()}
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-center text-gray-400">
                              No services yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-500">
                      Status of contract: {contract.contract ? 'Created' : 'Not created'}
                    </div>

                    {/*
                      Nếu hợp đồng bị huỷ (cancelled) hoặc bị từ chối (rejected),
                      hiển thị thông báo trạng thái màu đỏ phía dưới bảng dịch vụ.
                      - Nếu cancelled: user tự huỷ booking
                      - Nếu rejected: admin từ chối, có thể có lý do
                    */}
                    {contract.status === 'cancelled' || contract.status === 'rejected' ? (
                      <div className="text-sm font-medium text-red-600">
                        {contract.status === 'cancelled'
                          ? '❌ The request has been cancel by you' // Thông báo user đã huỷ
                          : '🚫 The request has been rejected by admin.' // Thông báo admin từ chối
                        }
                        {/* Nếu có lý do từ chối, có thể show thêm ở đây (hiện tại đã có ở trên header contract card) */}
                      </div>
                    ) : (
                      <>
                        {/* show hợp đồng */}
                        {contract.contract?.contractUrl && (
                          <button
                            onClick={() => {
                              setPdfUrlToPreview(`${import.meta.env.VITE_API_BASE_URL}/${contract.contract.contractUrl}`);
                              setOpenPdfModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-sm"
                          >
                            View contract (PDF)
                          </button>
                        )}

                        {/* show phụ lục hợp đồng */}
                        {contract.status === 'confirmed' && new Date(contract.endDate) > new Date() && (
                          <button
                            onClick={() => {
                              // Tạo nội dung in động cho hợp đồng cụ thể này
                              const currentDate = new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });

                              // Tính tổng tiền dịch vụ (chỉ services confirmed)
                              const totalServicePrice = contract.bookingServices?.filter(s => s.status === 'confirmed').reduce((total, s) => {
                                const quantity = s.quantity || 0;
                                const price = parseFloat(s.price || 0);
                                const start = new Date(s.startDate);
                                const end = new Date(s.endDate);
                                const timeDiff = end.getTime() - start.getTime();
                                const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                const serviceTotal = quantity * price * numberOfDays;
                                return total + serviceTotal;
                              }, 0) || 0;

                              const printContent = `
                                <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
                                  <!-- Header -->
                                  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                                    <h1 style="color: #2563eb; margin: 0; font-size: 24px;">YASUO RESORT SYSTEM</h1>
                                    <h2 style="color: #1f2937; margin: 10px 0; font-size: 20px;">SERVICE APPENDIX</h2>
                                    <p style="margin: 5px 0; color: #6b7280;">Contract #${contract.id}</p>
                                  </div>

                                  <!-- Contract Information -->
                                  <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                                    <div style="flex: 1;">
                                      <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px;">CONTRACT DETAILS</h3>
                                      <p style="margin: 5px 0;"><strong>Booking ID:</strong> #${contract.id}</p>
                                      <p style="margin: 5px 0;"><strong>Customer:</strong> ${contract.user?.name || user?.name || 'N/A'}</p>
                                      <p style="margin: 5px 0;"><strong>Email:</strong> ${contract.user?.email || user?.email || 'N/A'}</p>
                                      <p style="margin: 5px 0;"><strong>Phone:</strong> ${contract.user?.phone || user?.phone || 'N/A'}</p>
                                      <p style="margin: 5px 0;"><strong>CCCD:</strong> ${contract.user?.cccd || 'N/A'}</p>
                                      <p style="margin: 5px 0;"><strong>Address:</strong> ${contract.user?.permanentAddress || 'N/A'}</p>
                                    </div>
                                    <div style="flex: 1; text-align: right;">
                                      <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px;">BOOKING DETAILS</h3>
                                      <p style="margin: 5px 0;"><strong>Check-in:</strong> ${contract.startDate}</p>
                                      <p style="margin: 5px 0;"><strong>Check-out:</strong> ${contract.endDate}</p>
                                      <p style="margin: 5px 0;"><strong>Room:</strong> ${contract.room?.roomNumber || contract.roomNumber || 'N/A'}</p>
                                      <p style="margin: 5px 0;"><strong>Room Type:</strong> ${contract.room?.type?.name || 'Standard'}</p>
                                      <p style="margin: 5px 0;"><strong>Max Guests:</strong> ${contract.room?.maxPeople || 'N/A'} people</p>
                                      <p style="margin: 5px 0;"><strong>Room Price:</strong> $${contract.roomPrice}/night</p>
                                      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${contract.status === 'confirmed' ? '#059669' : contract.status === 'pending' ? '#d97706' : '#dc2626'}; font-weight: bold; text-transform: uppercase;">${contract.status}</span></p>
                                    </div>
                                  </div>

                                  <!-- Room Total -->
                                  <div style="background-color: #f8fafc; padding: 15px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                      <div>
                                        <h4 style="margin: 0; color: #1f2937;">ROOM ACCOMMODATION</h4>
                                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                                          ${contract.room?.roomNumber || contract.roomNumber} - 
                                          ${(() => {
                                  const start = new Date(contract.startDate);
                                  const end = new Date(contract.endDate);
                                  const timeDiff = end.getTime() - start.getTime();
                                  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                  return numberOfNights;
                                })()} nights × $${contract.roomPrice}/night
                                        </p>
                                      </div>
                                      <div style="text-align: right;">
                                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #059669;">$${contract.totalPrice}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <!-- Services Table -->
                                  <div style="margin-bottom: 30px;">
                                    <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">ADDITIONAL SERVICES</h3>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                      <thead>
                                        <tr style="background-color: #f8fafc;">
                                          <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: bold;">Service Name</th>
                                          <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">Quantity</th>
                                          <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">Start Date</th>
                                          <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">End Date</th>
                                          <th style="padding: 12px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold;">Days</th>
                                          <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold;">Unit Price</th>
                                          <th style="padding: 12px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold;">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${contract.bookingServices?.filter(s => s.status === 'confirmed').map(s => {
                                  const start = new Date(s.startDate);
                                  const end = new Date(s.endDate);
                                  const timeDiff = end.getTime() - start.getTime();
                                  const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                  const serviceTotal = (s.quantity || 0) * parseFloat(s.price || 0) * numberOfDays;
                                  return `
                                            <tr>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0;">${s.service?.name || 'N/A'}</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${s.quantity}</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${s.startDate}</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${s.endDate}</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${numberOfDays}</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">$${s.price}/person/day</td>
                                              <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${serviceTotal.toFixed(2)}</td>
                                            </tr>
                                          `;
                                }).join('') || '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #9ca3af; border: 1px solid #e2e8f0;">No additional services</td></tr>'}
                                      </tbody>
                                      <tfoot>
                                        <tr style="background-color: #f1f5f9;">
                                          <td colspan="6" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px;">TOTAL SERVICE AMOUNT:</td>
                                          <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #059669;">$${totalServicePrice.toFixed(2)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>

                                  <!-- Summary Section -->
                                  <div style="background-color: #f8fafc; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px; text-align: center;">BOOKING SUMMARY</h3>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                      <span style="font-weight: 500;">Room Accommodation:</span>
                                      <span style="font-weight: bold;">$${contract.totalPrice}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                      <span style="font-weight: 500;">Additional Services:</span>
                                      <span style="font-weight: bold;">$${totalServicePrice.toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #2563eb; margin-top: 15px;">
                                      <span style="font-weight: bold; font-size: 18px; color: #1f2937;">GRAND TOTAL:</span>
                                      <span style="font-weight: bold; font-size: 20px; color: #059669;">$${(parseFloat(contract.totalPrice) + totalServicePrice).toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <!-- Footer -->
                                  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                      <div>
                                        <p style="margin: 0; font-size: 12px; color: #6b7280;">Generated on: ${currentDate}</p>
                                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">This is an official service appendix document</p>
                                      </div>
                                      <div style="text-align: right;">
                                        <p style="margin: 0; font-size: 12px; color: #6b7280;">Yasou Resort System</p>
                                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Customer Service: support@resort.com</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              `;

                              // Tạo cửa sổ in mới với nội dung cụ thể ở giữa màn hình
                              const screenWidth = window.screen.width;
                              const screenHeight = window.screen.height;
                              const windowWidth = 900;
                              const windowHeight = 700;
                              const left = (screenWidth - windowWidth) / 2;
                              const top = (screenHeight - windowHeight) / 2;

                              const printWindow = window.open('', '_blank', `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`);
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Contract Appendix - #${contract.id}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; margin: 20px; }
                                      table { border-collapse: collapse; width: 100%; }
                                      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                      th { background-color: #f2f2f2; }
                                    </style>
                                  </head>
                                  <body>
                                    ${printContent}
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.focus();
                              printWindow.print();
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded text-sm"
                          >
                            📎 View contract appendix
                          </button>
                        )}
                        {contract.contract && (
                          <div
                            className={`text-sm font-medium ${contract.contract.signedByUser ? 'text-green-600' : 'text-yellow-600'
                              }`}
                          >
                            {contract.contract.signedByUser
                              ? '✅ The contract has been signed by you'
                              : '🕐 Contract is waiting for you to sign'}
                          </div>
                        )}

                        {contract.contract ? (
                          !contract.contract.signedByUser && (
                            <>
                              <button
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                onClick={() => {
                                  setBookingToSign(contract);
                                  setOpenSignModal(true);
                                }}
                              >
                                ✍️ Sign the contract
                              </button>
                              <button
                                className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-sm"
                                onClick={() => {
                                  setBookingToCancel(contract);
                                  setIsOpenCancelBooking(true);
                                }}
                              >
                                🛑 Cancel contract
                              </button>
                            </>
                          )
                        ) : (
                          <button
                            className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-sm"
                            onClick={() => {
                              setBookingToCancel(contract);
                              setIsOpenCancelBooking(true);
                            }}
                          >
                            🛑 Cancel contract
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            }
          </div >
        )}
        <Modal
          title="View contract"
          open={isOpenPdfModal}
          onCancel={() => setOpenPdfModal(false)}
          footer={null}
          width={800}
        >
          <iframe src={pdfUrlToPreview} width="100%" height="600px" frameBorder="0" />
        </Modal>

        <Modal
          title="Cancel contract"
          open={isOpenCancelBooking}
          onCancel={() => setIsOpenCancelBooking(false)}
          footer={null}
          width={600}
        >
          <div className="mb-2">Are you sure you want to cancel the contract?</div>
          <div className="">
            <Button type="primary" onClick={handleCancelBooking}>
              Confirm
            </Button>
          </div>
        </Modal>

        <Modal title="Ký hợp đồng" open={isOpenSignModal} onCancel={handleCloseSignModal} width={600} footer={null}>
          <canvas ref={canvasRef} width={600} height={300} className="border rounded"></canvas>

          <div className="flex justify-between mt-4">
            <Button onClick={() => signaturePadRef.current.clear()}>Re-sign</Button>
            <Button type="primary" onClick={handleSignContract}>
              Send signature
            </Button>
          </div>
        </Modal>
        {/* show phụ lục hợp đồng */}
        <Modal
          title="Contract Appendix"
          open={isOpenAppendixModal}
          onCancel={() => {
            setIsOpenAppendixModal(false);
            setContractToViewAppendix(null);
          }}
          footer={null}
          width={800}
        >
          {console.log('Modal opened, isOpenAppendixModal:', isOpenAppendixModal, 'contractToViewAppendix:', contractToViewAppendix)}
          {(() => {
            console.log('All services:', contractToViewAppendix?.bookingServices);
            const confirmedServices = contractToViewAppendix?.bookingServices?.filter(s => {
              console.log('Checking service:', s.service?.name, 'Status:', s.status);
              return s.status === 'confirmed';
            });
            console.log('Confirmed services:', confirmedServices);
            return confirmedServices?.length > 0;
          })() ? (
            <div className="overflow-x-auto" ref={printRef}>
              {/* Chỉ hiển thị services có status confirmed trong bản in */}
              <table className="min-w-full text-sm border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">Service Name</th>
                    <th className="px-3 py-2 text-left">Number of People</th>
                    <th className="px-3 py-2 text-left">Start Date</th>
                    <th className="px-3 py-2 text-left">End Date</th>
                    <th className="px-3 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {contractToViewAppendix.bookingServices
                    .filter(s => {
                      console.log('Service status:', s.status, 'Service name:', s.service?.name);
                      return s.status === 'confirmed';
                    }) // Chỉ lấy services confirmed
                    .map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-3 py-2">{s.service?.name}</td>
                        <td className="px-3 py-2">{s.quantity}</td>
                        <td className="px-3 py-2">{s.startDate}</td>
                        <td className="px-3 py-2">{s.endDate}</td>
                        <td className="px-3 py-2">{formatCurrencyUSD(s.price)}/person/day</td>
                      </tr>
                    ))}

                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2" colSpan={4}>Total Service Price</td>
                    <td className="px-3 py-2">
                      {formatCurrencyUSD(
                        contractToViewAppendix.bookingServices
                          .filter(s => s.status === 'confirmed') // Chỉ tính tổng services confirmed
                          .reduce((total, s) => {
                            const quantity = s.quantity || 0;
                            const price = parseFloat(s.price || 0);

                            const start = new Date(s.startDate);
                            const end = new Date(s.endDate);
                            const timeDiff = end.getTime() - start.getTime();
                            const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Số ngày giữa 2 ngày
                            const serviceTotal = quantity * price * numberOfDays;
                            return total + serviceTotal;
                          }, 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* <table className="min-w-full text-sm border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left">Service Name</th>
                    <th className="px-3 py-2 text-left">Number of People</th>
                    <th className="px-3 py-2 text-left">Start Date</th>
                    <th className="px-3 py-2 text-left">End Date</th>
                    <th className="px-3 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {contractToViewAppendix.bookingServices.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{s.service?.name}</td>
                      <td className="px-3 py-2">{s.quantity}</td>
                      <td className="px-3 py-2">{s.startDate}</td>
                      <td className="px-3 py-2">{s.endDate}</td>
                      <td className="px-3 py-2">{formatCurrencyUSD(s.price)}</td>
                    </tr>
                  ))}


                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2" colSpan={4}>Total Service Price</td>
                    <td className="px-3 py-2">
                      {formatCurrencyUSD(
                        contractToViewAppendix.bookingServices.reduce((total, s) => {
                          const quantity = s.quantity || 0;
                          const price = parseFloat(s.price || 0);

                          const start = new Date(s.startDate);
                          const end = new Date(s.endDate);
                          const timeDiff = end.getTime() - start.getTime();
                          const numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Số ngày giữa 2 ngày
                          const serviceTotal = quantity * price * numberOfDays;
                          return total + serviceTotal;
                        }, 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table> */}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No services found in appendix.</div>
          )}
        </Modal>
      </div >
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div >
  );
}

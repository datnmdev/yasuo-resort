import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Modal,
} from "antd";
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import { formatCurrencyVND } from '@src/libs/utils';
import SignaturePad from "signature_pad";
import bookingApi from '@apis/booking';
import uploadApi from '@apis/upload';

export default function Contract() {
  const user = useSelector(userSelector.selectUser);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [pdfUrlToPreview, setPdfUrlToPreview] = useState(null);
  const [isOpenPdfModal, setOpenPdfModal] = useState(false);

  const [bookingToSign, setBookingToSign] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  const [isOpenSignModal, setOpenSignModal] = useState(false);

  const [isOpenCancelBooking, setIsOpenCancelBooking] = useState(false);

  const statusMap = {
    confirmed: {
      label: 'Đã xác nhận',
      className: 'bg-green-100 text-green-700',
    },
    pending: {
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-700',
    },
    cancelled: {
      label: 'Đã hủy',
      className: 'bg-red-100 text-red-700',
    },
  };

  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getBookings({ page: 1, limit: 100 });
      const bookings = res.data.data[0] || [];
      const userBookings = bookings.filter(b => b.userId === user?.id);
      setContracts(userBookings);
    } catch (err) {
      setError('Không thể tải hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchContracts();
  }, [user?.id]);

  useEffect(() => {
    if (isOpenSignModal && canvasRef.current) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        const parentWidth = canvas.parentElement?.getBoundingClientRect().width || 600;

        canvas.width = parentWidth;
        canvas.height = parentWidth / 2;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        signaturePadRef.current = new SignaturePad(canvas, {
          backgroundColor: "#fff",
        });
      }, 0); // delay 1 frame để DOM render xong
    }
  }, [isOpenSignModal]);
  
  

  const handleSignContract = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      return alert("Vui lòng ký trước khi gửi!");
    }
    const dataUrl = signaturePadRef.current.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "signature.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await uploadApi.uploadFile(formData);
      const signaturePath = uploadRes.data?.path?.replace(/\\/g, "/");
      
      await bookingApi.userSignTheContract({
        param: {
          bookingId: bookingToSign.id,
        },
        body: {
          signatureUrl: signaturePath,
        },
      });

      setOpenSignModal(false);
      setBookingToSign(null);
      const refreshed = await bookingApi.getBookings({ page: 1, limit: 100 });
      const refreshedBookings = refreshed.data.data[0] || [];
      setContracts(refreshedBookings.filter(b => b.userId === user?.id));
    } catch (err) {
      alert("Ký thất bại");
    }
  };
  const handleCloseSignModal = () => {
    setOpenSignModal(false);
    setTimeout(() => {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
        signaturePadRef.current.off(); // optional: remove events
      }
    }, 300); // đợi modal đóng hoàn toàn (đảm bảo DOM ổn định)
  };

  const handleCancelBooking = async () => {
    try {
      await bookingApi.cancelBooking({
        param: { bookingId: bookingToCancel.id },
      });
      setIsOpenCancelBooking(false);
      setBookingToCancel(null);
      await fetchContracts();
    } catch (err) {
      alert('a')
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Hợp đồng đặt phòng của bạn</h1>
        <p className="text-gray-600">Xem chi tiết các hợp đồng/đơn đặt phòng đã tạo.</p>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium">Lọc theo trạng thái:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : contracts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Bạn chưa có hợp đồng nào.</div>
      ) : (
        <div className="space-y-8">
          {contracts.filter(contract => {
              if (filterStatus === 'all') return true;
              return contract.status === filterStatus;
            }).map((contract) => (
            <div key={contract.id} className="bg-white p-6 rounded shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <div className="font-semibold text-lg text-teal-700">Mã Đặt phòng: #{contract.id}</div>
                  <div className="text-sm text-gray-500">Ngày tạo: {new Date(contract.createdAt).toLocaleDateString()}</div>
                </div>
                {/* status hợp đồng - span */}
                <div>
                  {(() => {
                    const status = contract.status;
                    const statusInfo = statusMap[status] || {
                      label: status,
                      className: 'bg-gray-200 text-gray-600',
                    };

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
                  <div className="font-medium mb-1">Khách hàng</div>
                  <div className="text-gray-700">{contract.user?.name}</div>
                  <div className="text-gray-500 text-sm">Email: {contract.user?.email}</div>
                  <div className="text-gray-500 text-sm">SĐT: {contract.user?.phone}</div>
                  <div className="text-gray-500 text-sm">CCCD: {contract.user?.cccd}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Phòng</div>
                  <div className="text-gray-700">{contract.room?.roomNumber} ({contract.room?.type?.name})</div>
                  <div className="text-gray-500 text-sm">Ngày nhận: {contract.startDate}</div>
                  <div className="text-gray-500 text-sm">Ngày trả: {contract.endDate}</div>
                  <div className="text-gray-500 text-sm">Giá phòng: {formatCurrencyVND(contract.roomPrice)}</div>
                  <div className="text-gray-500 text-sm">Tổng tiền: {formatCurrencyVND(contract.totalPrice)}</div>
                </div>
              </div>
              <div className="mb-2 font-medium">Dịch vụ kèm theo</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left">Tên dịch vụ</th>
                      <th className="px-3 py-2 text-left">Số người</th>
                      <th className="px-3 py-2 text-left">Ngày bắt đầu</th>
                      <th className="px-3 py-2 text-left">Ngày kết thúc</th>
                      <th className="px-3 py-2 text-left">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.bookingServices?.length > 0 ? contract.bookingServices.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-3 py-2">{s.service?.name}</td>
                        <td className="px-3 py-2">{s.quantity}</td>
                        <td className="px-3 py-2">{s.startDate}</td>
                        <td className="px-3 py-2">{s.endDate}</td>
                        <td className="px-3 py-2">{formatCurrencyVND(s.price)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-3 py-2 text-center text-gray-400">Không có dịch vụ nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-500">
                    Trạng thái hợp đồng: {contract.contract ? 'Đã tạo' : 'Chưa tạo'}
                  </div>

                  {contract.status === 'cancelled' ? (
                    <div className="text-sm font-medium text-red-600">
                      ❌ Hợp đồng đã bị hủy
                    </div>
                  ) : (
                    <>
                      {contract.contract?.contractUrl && (
                        <button
                          onClick={() => {
                            setPdfUrlToPreview(`${import.meta.env.VITE_API_BASE_URL}/${contract.contract.contractUrl}`);
                            setOpenPdfModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-sm"
                        >
                          Xem hợp đồng (PDF)
                        </button>
                      )}

                      {contract.contract && (
                        <div className={`text-sm font-medium ${contract.contract.signedByUser ? 'text-green-600' : 'text-yellow-600'}`}>
                          {contract.contract.signedByUser
                            ? '✅ Hợp đồng đã được ký bởi bạn'
                            : '🕐 Hợp đồng đang chờ bạn ký'}
                        </div>
                      )}

                      {contract.contract && !contract.contract.signedByUser && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            onClick={() => {
                              setBookingToSign(contract);
                              setOpenSignModal(true);
                            }}
                          >
                            ✍️ Ký hợp đồng
                          </button>
                          <button
                            className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-sm"
                            onClick={() => {
                              setBookingToCancel(contract);
                              setIsOpenCancelBooking(true);
                            }}
                          >
                            🛑 Hủy hợp đồng
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
          ))}
        </div>
      )}
      <Modal
        title="Xem Hợp Đồng"
        open={isOpenPdfModal}
        onCancel={() => setOpenPdfModal(false)}
        footer={null}
        width={800}
        >
        <iframe
          src={pdfUrlToPreview}
          width="100%"
          height="600px"
          frameBorder="0"
        />
      </Modal>

      <Modal
        title="Hủy hợp đồng"
        open={isOpenCancelBooking}
        onCancel={() => setIsOpenCancelBooking(false)}
        footer={null}
        width={600}
        >
        <div>Bạn có chắc muốn hủy hợp đồng</div>
        <div className="">
          <Button type="primary" onClick={handleCancelBooking}>xác nhận</Button>
        </div>
      </Modal>

      <Modal
        title="Ký hợp đồng"
        open={isOpenSignModal}
        onCancel={handleCloseSignModal}
        width={600}
        footer={null}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="border rounded"
        ></canvas>

        <div className="flex justify-between mt-4">
          <Button onClick={() => signaturePadRef.current.clear()}>Tái kí</Button>
          <Button type="primary" onClick={handleSignContract}>Gửi chữ kí</Button>
        </div>
      </Modal>
    </div>
  );
}
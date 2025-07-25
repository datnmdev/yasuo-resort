import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal } from 'antd';
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import { formatCurrencyUSD } from '@src/libs/utils';
import SignaturePad from 'signature_pad';
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
      const userBookings = bookings.filter((b) => b.userId === user?.id);
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

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        signaturePadRef.current = new SignaturePad(canvas, {
          backgroundColor: '#fff',
        });
      }, 0); // delay 1 frame để DOM render xong
    }
  }, [isOpenSignModal]);

  const handleSignContract = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      return alert('Vui lòng ký trước khi gửi!');
    }
    const dataUrl = signaturePadRef.current.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await uploadApi.uploadFile(formData);
      const signaturePath = uploadRes.data?.path?.replace(/\\/g, '/');

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
      setContracts(refreshedBookings.filter((b) => b.userId === user?.id));
    } catch (err) {
      alert('Ký thất bại');
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
      alert('a');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your booking contract</h1>
        <p className="text-gray-600">View details of created contracts/bookings.</p>
      </div>
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
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading data...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : contracts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">You don't have any contract yet</div>
      ) : (
        <div className="space-y-8">
          {contracts
            .filter((contract) => {
              if (filterStatus === 'all') return true;
              return contract.status === filterStatus;
            })
            .map((contract) => (
              <div key={contract.id} className="bg-white p-6 rounded shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                  <div>
                    <div className="font-semibold text-lg text-teal-700">Booking code: #{contract.id}</div>
                    <div className="text-sm text-gray-500">
                      Date created: {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
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
                        <th className="px-3 py-2 text-left">Service name</th>
                        <th className="px-3 py-2 text-left">Number of people</th>
                        <th className="px-3 py-2 text-left">Start date</th>
                        <th className="px-3 py-2 text-left">End Date</th>
                        <th className="px-3 py-2 text-left">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.bookingServices?.length > 0 ? (
                        contract.bookingServices.map((s) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{s.service?.name}</td>
                            <td className="px-3 py-2">{s.quantity}</td>
                            <td className="px-3 py-2">{s.startDate}</td>
                            <td className="px-3 py-2">{s.endDate}</td>
                            <td className="px-3 py-2">{formatCurrencyUSD(s.price)}</td>
                          </tr>
                        ))
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

                  {contract.status === 'cancelled' ? (
                    <div className="text-sm font-medium text-red-600">❌ The contract has been cancelled.</div>
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
                          View contract (PDF)
                        </button>
                      )}

                      {contract.contract && (
                        <div
                          className={`text-sm font-medium ${
                            contract.contract.signedByUser ? 'text-green-600' : 'text-yellow-600'
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
            ))}
        </div>
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
    </div>
  );
}

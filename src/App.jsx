import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function App() {
  const [formData, setFormData] = useState({
    plant: 'FCB',
    productName: '',
    productSize: '',
    lotNumber: '',
    department: '',
    quantity: '',
    rejectionReason: '',
    purpose: '',
    issues: '',
    requesterName: ''
  });

  const sigCanvas = useRef({});
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearSignature = () => sigCanvas.current.clear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sigCanvas.current.isEmpty && sigCanvas.current.isEmpty()) {
      alert('⚠️ กรุณาลงลายเซ็นผู้ร้องขอก่อนส่งเอกสารครับ');
      return;
    }
    setLoading(true);
    setTicketResult(null);

    const payload = {
      ...formData,
      requesterSignature: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
    };

    try {
      const BACKEND_URL = 'https://accept-lot-backend.onrender.com/api/concessions';
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.success) {
        setTicketResult(result);
        setFormData({ plant: 'FCB', productName: '', productSize: '', lotNumber: '', department: '', quantity: '', rejectionReason: '', purpose: '', issues: '', requesterName: '' });
        clearSignature();
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (err) {
      alert(`ไม่สามารถส่งข้อมูลได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* ฝัง CSS ไว้ใน Component โดยตรงเพื่อให้ก็อปปี้ไปวางแล้วสวยเลย */}
      <style>{`
        body {
          background-color: #f3f4f6;
          font-family: 'Segoe UI', 'Sarabun', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
        }
        .app-container {
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }
        .form-card {
          background: #ffffff;
          max-width: 700px;
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 40px;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h2 {
          color: #1e293b;
          font-size: 24px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .header p {
          color: #64748b;
          font-size: 15px;
          margin: 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .form-row .form-group {
          margin-bottom: 0;
          flex: 1;
        }
        label {
          display: block;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
          font-size: 14.5px;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 15px;
          color: #0f172a;
          transition: all 0.2s ease;
          box-sizing: border-box;
          background-color: #f8fafc;
        }
        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        textarea.input-field {
          resize: vertical;
          min-height: 80px;
        }
        /* Radio Button แบบการ์ด */
        .radio-group {
          display: flex;
          gap: 15px;
        }
        .radio-card {
          flex: 1;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          color: #64748b;
          background-color: #f8fafc;
        }
        .radio-card input {
          display: none;
        }
        .radio-card.active {
          border-color: #3b82f6;
          background-color: #eff6ff;
          color: #1d4ed8;
        }
        .radio-card:hover:not(.active) {
          border-color: #cbd5e1;
          background-color: #f1f5f9;
        }
        /* ลายเซ็น */
        .signature-section {
          background-color: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .signature-box {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 10px;
        }
        .btn-clear {
          margin-top: 12px;
          padding: 8px 16px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .btn-clear:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }
        /* ปุ่ม Submit */
        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }
        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        /* กล่องแจ้งเตือนสำเร็จ */
        .success-box {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin-bottom: 30px;
          animation: fadeIn 0.5s ease;
        }
        .success-box h3 {
          color: #166534;
          margin: 0 0 10px 0;
          font-size: 20px;
        }
        .doc-number {
          color: #15803d;
          font-size: 32px;
          font-weight: 900;
          margin: 10px 0 20px 0;
          letter-spacing: 1px;
        }
        .btn-download {
          display: inline-block;
          padding: 12px 24px;
          background-color: #ef4444;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
        }
        .btn-download:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .form-row { flex-direction: column; gap: 20px; }
          .form-card { padding: 20px; }
        }
      `}</style>

      <div className="form-card">
        <div className="header">
          <h2>📝 แบบขอยอมรับผลิตภัณฑ์แบบมีเงื่อนไข</h2>
          <p>Conditional Product Acceptance Request - Accept Lot</p>
        </div>

        {ticketResult && (
          <div className="success-box">
            <h3>🎉 บันทึกข้อมูลสำเร็จ!</h3>
            <p style={{ margin: 0, color: '#166534' }}>เลขที่เอกสารของคุณคือ:</p>
            <div className="doc-number">{ticketResult.documentNumber}</div>
            {ticketResult.pdfUrl && (
               <a href={ticketResult.pdfUrl} target="_blank" rel="noreferrer" className="btn-download">
                 📥 เปิดดูไฟล์ PDF พร้อมลายเซ็น
               </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>🏭 เลือกสายการผลิต (Plant): *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.plant === 'FCB' ? 'active' : ''}`}>
                <input type="radio" name="plant" value="FCB" checked={formData.plant === 'FCB'} onChange={handleChange} />
                🏭 FCB (แผ่นไฟเบอร์ซีเมนต์)
              </label>
              <label className={`radio-card ${formData.plant === 'CRT' ? 'active' : ''}`}>
                <input type="radio" name="plant" value="CRT" checked={formData.plant === 'CRT'} onChange={handleChange} />
                🏠 CRT (กระเบื้องหลังคา)
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>📦 ชื่อผลิตภัณฑ์: *</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="input-field" placeholder="ระบุชื่อผลิตภัณฑ์" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>📊 จำนวนที่ร้องขอ: *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="input-field" placeholder="ระบุจำนวน" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>🔢 Lot ผลิต: *</label>
              <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="input-field" placeholder="ระบุหมายเลข Lot" />
            </div>
            <div className="form-group">
              <label>🏢 หน่วยงานที่ร้องขอ: *</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required className="input-field" placeholder="ระบุหน่วยงาน" />
            </div>
          </div>

          <div className="form-group">
            <label>🚫 เหตุผลในการปฏิเสธลอต: *</label>
            <textarea name="rejectionReason" value={formData.rejectionReason} onChange={handleChange} required className="input-field" placeholder="ระบุเหตุผลที่ลอตนี้ถูกปฏิเสธ..."></textarea>
          </div>

          <div className="form-group">
            <label>📝 รายละเอียดในการร้องขอ (วัตถุประสงค์): *</label>
            <textarea name="purpose" value={formData.purpose} onChange={handleChange} required className="input-field" placeholder="เช่น เพื่อส่งกระบวนการถัดไป หรือ เพื่อส่งขาย..."></textarea>
          </div>

          <div className="form-group">
            <label>⚠️ หัวข้อในการร้องขอ (กด Enter เพื่อแยกข้อได้): *</label>
            <textarea name="issues" value={formData.issues} onChange={handleChange} required className="input-field" style={{ minHeight: '120px' }} placeholder="ตัวอย่าง:&#10;ความกว้างไม่ได้มาตรฐาน&#10;ความหนาบางจุดไม่ได้ขนาด"></textarea>
          </div>

          <div className="form-group">
            <label>👤 ชื่อ-นามสกุล ผู้ร้องขอ: *</label>
            <input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} required className="input-field" placeholder="ระบุชื่อ-นามสกุล" />
          </div>

          <div className="signature-section">
            <label>✍️ เซ็นชื่อผู้ร้องขอ (ใช้นิ้วหรือเมาส์เซ็นได้เลย): *</label>
            <div className="signature-box">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="#1e3a8a" 
                canvasProps={{ width: 600, height: 180, style: { width: '100%', height: '180px', touchAction: 'none' } }} 
              />
            </div>
            <button type="button" onClick={clearSignature} className="btn-clear">
              🧹 ล้างลายเซ็น
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? '⏳ กำลังสร้างเอกสาร PDF...' : '🚀 ยื่นคำขอยอมรับผลิตภัณฑ์'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

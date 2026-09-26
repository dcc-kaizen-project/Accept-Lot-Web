import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function App() {
  const [formData, setFormData] = useState({
    plant: 'FCB',
    productName: '',
    quantity: '',
    lotNumber: '',
    department: '',
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
      alert('⚠️ กรุณาลงลายเซ็นผู้ร้องขอก่อนส่งเอกสาร');
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
        setFormData({ plant: 'FCB', productName: '', quantity: '', lotNumber: '', department: '', rejectionReason: '', purpose: '', issues: '', requesterName: '' });
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
    <div className="app-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Prompt', sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: #e2e8f0;
          min-height: 100vh;
        }
        
        .app-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          padding: 40px;
          max-width: 800px;
          width: 100%;
          box-sizing: border-box;
        }

        .header {
          text-align: center;
          margin-bottom: 35px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 20px;
        }

        .header h1 {
          font-size: 28px;
          color: #fff;
          margin: 0 0 10px 0;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        label {
          font-size: 14px;
          font-weight: 500;
          color: #cbd5e1;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .input-control {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 14px 16px;
          border-radius: 10px;
          font-family: 'Prompt', sans-serif;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .input-control:focus {
          outline: none;
          border-color: #38bdf8;
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }

        .input-control::placeholder {
          color: #64748b;
        }

        textarea.input-control {
          resize: vertical;
          min-height: 80px;
        }

        .radio-container {
          display: flex;
          gap: 15px;
        }

        .radio-btn {
          flex: 1;
          position: relative;
        }

        .radio-btn input {
          display: none;
        }

        .radio-label {
          display: block;
          text-align: center;
          padding: 14px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .radio-btn input:checked + .radio-label {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
          box-shadow: inset 0 0 15px rgba(56, 189, 248, 0.1);
        }

        .signature-wrapper {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 5px;
          border: 2px solid transparent;
          transition: border-color 0.3s;
        }
        
        .signature-wrapper:hover {
          border-color: #38bdf8;
        }

        .btn-clear {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e2e8f0;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'Prompt', sans-serif;
          font-size: 13px;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }

        .btn-clear:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(to right, #0ea5e9, #2563eb);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          font-family: 'Prompt', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
          box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -10px rgba(37, 99, 235, 0.6);
        }

        .submit-btn:disabled {
          background: #475569;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .success-panel {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
          animation: slideDown 0.5s ease;
        }

        .success-panel h2 {
          color: #34d399;
          margin: 0 0 10px 0;
        }

        .doc-no {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          margin: 15px 0 25px 0;
          text-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
        }

        .download-btn {
          display: inline-block;
          padding: 12px 28px;
          background: #ef4444;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          background: #dc2626;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .form-row { flex-direction: column; gap: 0; }
          .glass-panel { padding: 25px 20px; }
        }
      `}</style>

      <div className="glass-panel">
        <div className="header">
          <h1>📝 แบบขอยอมรับผลิตภัณฑ์</h1>
          <p>Conditional Product Acceptance Request (Accept Lot)</p>
        </div>

        {ticketResult && (
          <div className="success-panel">
            <h2>✨ สร้างเอกสารสำเร็จ!</h2>
            <p style={{ color: '#cbd5e1' }}>เลขที่เอกสารอ้างอิงของคุณ</p>
            <div className="doc-no">{ticketResult.documentNumber}</div>
            {ticketResult.pdfUrl && (
               <a href={ticketResult.pdfUrl} target="_blank" rel="noreferrer" className="download-btn">
                 📥 ดาวน์โหลด PDF พร้อมลายเซ็น
               </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>🏭 สายการผลิต (Plant) *</label>
            <div className="radio-container">
              <div className="radio-btn">
                <input type="radio" id="plantFCB" name="plant" value="FCB" checked={formData.plant === 'FCB'} onChange={handleChange} />
                <label htmlFor="plantFCB" className="radio-label">🏭 FCB (ไฟเบอร์ซีเมนต์)</label>
              </div>
              <div className="radio-btn">
                <input type="radio" id="plantCRT" name="plant" value="CRT" checked={formData.plant === 'CRT'} onChange={handleChange} />
                <label htmlFor="plantCRT" className="radio-label">🏠 CRT (กระเบื้องหลังคา)</label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>📦 ชื่อผลิตภัณฑ์ *</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="input-control" placeholder="ระบุชื่อผลิตภัณฑ์" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>📊 จำนวน (แผ่น/ชิ้น) *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="input-control" placeholder="ระบุจำนวน" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>🔢 รหัสผลิต (Lot) *</label>
              <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="input-control" placeholder="ระบุหมายเลข Lot" />
            </div>
            <div className="form-group">
              <label>🏢 หน่วยงานที่ร้องขอ *</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required className="input-control" placeholder="ระบุหน่วยงาน" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>🚫 เหตุผลในการปฏิเสธลอต *</label>
            <textarea name="rejectionReason" value={formData.rejectionReason} onChange={handleChange} required className="input-control" placeholder="ระบุเหตุผลที่ QC หรือหน่วยงานปฏิเสธลอตนี้..."></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>🎯 รายละเอียดในการร้องขอ (วัตถุประสงค์) *</label>
            <textarea name="purpose" value={formData.purpose} onChange={handleChange} required className="input-control" placeholder="เช่น เพื่อส่งกระบวนการถัดไป หรือ เพื่อส่งขาย..."></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>⚠️ หัวข้อในการร้องขอ (กด Enter เพื่อขึ้นข้อใหม่) *</label>
            <textarea name="issues" value={formData.issues} onChange={handleChange} required className="input-control" style={{ minHeight: '120px' }} placeholder="ตัวอย่าง:&#10;ความกว้างไม่ได้มาตรฐาน&#10;ความหนาบางจุดไม่ได้ขนาด"></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label>👤 ชื่อ-นามสกุล ผู้ร้องขอ *</label>
            <input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} required className="input-control" placeholder="ระบุชื่อ-นามสกุล" />
          </div>

          <div className="form-group">
            <label>✍️ ลายเซ็นผู้ร้องขอ (เซ็นในกรอบสีขาวด้านล่าง) *</label>
            <div className="signature-wrapper">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="#0f172a" 
                canvasProps={{ width: 800, height: 200, style: { width: '100%', height: '200px', touchAction: 'none' } }} 
              />
            </div>
            <div>
              <button type="button" onClick={clearSignature} className="btn-clear">
                ↺ ล้างลายเซ็น
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'กำลังประมวลผลเอกสาร...' : 'ส่งคำขอยอมรับผลิตภัณฑ์'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

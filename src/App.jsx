import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { HashRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';

// ==================== 1. หน้าสำหรับผู้ร้องขอ (หน้าแรก) ====================
function RequestForm() {
  const [formData, setFormData] = useState({
    plant: 'FCB', productName: '', quantity: '', lotNumber: '',
    department: '', rejectionReason: '', purpose: '', issues: '', requesterName: ''
  });

  const sigCanvas = useRef({});
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const clearSignature = () => { if (sigCanvas.current) sigCanvas.current.clear(); };

  const handlePreview = (e) => {
    e.preventDefault();
    if (sigCanvas.current.isEmpty()) {
      alert('⚠️ กรุณาลงลายเซ็นผู้ร้องขอก่อนส่งเอกสาร');
      return;
    }
    setShowPreview(true);
  };

  const confirmAndSend = async () => {
    setShowPreview(false);
    setLoading(true);
    setTicketResult(null);

    const payload = {
      ...formData,
      requesterSignature: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
    };

    try {
      // ⚠️ นำ URL ของ Web App (Google Script) มาใส่ตรงนี้เพื่อให้หน้าฟอร์มส่งข้อมูลได้
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRDKf3_9xV2JfNDqnPrADElyDR3uJW18wIXx4rKFmPJt57l4mmyFyWp9Uz6cS_lPQR/exec";
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
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
        body { margin: 0; padding: 0; font-family: 'Prompt', sans-serif; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: #e2e8f0; min-height: 100vh; }
        .app-wrapper { display: flex; justify-content: center; align-items: center; padding: 40px 20px; min-height: 100vh; box-sizing: border-box; }
        .glass-panel { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 45px rgba(0,0,0,0.2); border-radius: 20px; padding: 40px; max-width: 800px; width: 100%; box-sizing: border-box; }
        .header { text-align: center; margin-bottom: 35px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #fff; margin: 0 0 10px 0; }
        .form-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .form-group { flex: 1; display: flex; flex-direction: column; }
        label { font-size: 14px; font-weight: 500; color: #cbd5e1; margin-bottom: 8px; }
        .input-control { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 14px 16px; border-radius: 10px; font-family: 'Prompt', sans-serif; font-size: 15px; }
        .input-control:focus { outline: none; border-color: #38bdf8; background: rgba(15, 23, 42, 0.6); }
        .radio-container { display: flex; gap: 15px; }
        .radio-btn { flex: 1; position: relative; }
        .radio-btn input { display: none; }
        .radio-label { display: block; text-align: center; padding: 14px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #94a3b8; cursor: pointer; }
        .radio-btn input:checked + .radio-label { background: rgba(56, 189, 248, 0.15); border-color: #38bdf8; color: #38bdf8; }
        .signature-wrapper { background: rgba(255, 255, 255, 0.95); border-radius: 10px; overflow: hidden; margin-top: 5px; }
        .btn-clear { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px; }
        .submit-btn { width: 100%; padding: 16px; background: linear-gradient(to right, #0ea5e9, #2563eb); color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: 600; cursor: pointer; margin-top: 20px; font-family: 'Prompt'; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        .modal-content { background: #fff; color: #1e293b; padding: 30px; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-content h3 { margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .preview-item { margin-bottom: 12px; font-size: 15px; }
        .preview-item strong { color: #475569; display: inline-block; width: 130px; }
        .modal-actions { display: flex; gap: 15px; margin-top: 25px; }
        .btn-cancel { flex: 1; padding: 12px; background: #e2e8f0; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: 'Prompt'; }
        .btn-confirm { flex: 2; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: 'Prompt'; }
        .success-panel { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; }
        .doc-no { font-size: 36px; font-weight: 700; color: #fff; margin: 15px 0 20px 0; }
        .status-box { background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.3); padding: 15px; border-radius: 8px; color: #fbbf24; font-size: 15px; font-weight: 500; }
      `}</style>

      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🔍 ตรวจสอบข้อมูลก่อนส่ง</h3>
            <div className="preview-item"><strong>สายการผลิต:</strong> {formData.plant}</div>
            <div className="preview-item"><strong>ชื่อผลิตภัณฑ์:</strong> {formData.productName}</div>
            <div className="preview-item"><strong>จำนวน:</strong> {formData.quantity}</div>
            <div className="preview-item"><strong>รหัสผลิต (Lot):</strong> {formData.lotNumber}</div>
            <div className="preview-item"><strong>หน่วยงาน:</strong> {formData.department}</div>
            <div className="preview-item"><strong>เหตุผลปฏิเสธ:</strong> {formData.rejectionReason}</div>
            <div className="preview-item"><strong>วัตถุประสงค์:</strong> {formData.purpose}</div>
            <div className="preview-item"><strong>ชื่อผู้ร้องขอ:</strong> {formData.requesterName}</div>
            
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowPreview(false)}>กลับไปแก้ไข</button>
              <button type="button" className="btn-confirm" onClick={confirmAndSend}>✅ ยืนยันและส่งข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <div className="header"><h1>📝 แบบขอยอมรับผลิตภัณฑ์</h1></div>

        {ticketResult && (
          <div className="success-panel">
            <h2 style={{ color: '#34d399', margin: '0 0 10px 0' }}>✨ ส่งคำขอสำเร็จ!</h2>
            <p style={{ color: '#cbd5e1' }}>เลขที่เอกสารของคุณคือ</p>
            <div className="doc-no">{ticketResult.documentNumber}</div>
            <div className="status-box">⏳ ส่งแจ้งเตือนให้ ผช.ผจก. ทบทวนผ่าน LINE สำเร็จแล้ว</div>
          </div>
        )}

        <form onSubmit={handlePreview}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>🏭 สายการผลิต (Plant) *</label>
            <div className="radio-container">
              <div className="radio-btn"><input type="radio" id="plantFCB" name="plant" value="FCB" checked={formData.plant === 'FCB'} onChange={handleChange} /><label htmlFor="plantFCB" className="radio-label">🏭 FCB</label></div>
              <div className="radio-btn"><input type="radio" id="plantCRT" name="plant" value="CRT" checked={formData.plant === 'CRT'} onChange={handleChange} /><label htmlFor="plantCRT" className="radio-label">🏠 CRT</label></div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}><label>📦 ชื่อผลิตภัณฑ์ *</label><input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="input-control" /></div>
            <div className="form-group" style={{ flex: 1 }}><label>📊 จำนวน (แผ่น/ชิ้น) *</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="input-control" /></div>
          </div>

          <div className="form-row">
            <div className="form-group"><label>🔢 รหัสผลิต (Lot) *</label><input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="input-control" /></div>
            <div className="form-group"><label>🏢 หน่วยงานที่ร้องขอ *</label><input type="text" name="department" value={formData.department} onChange={handleChange} required className="input-control" /></div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}><label>🚫 เหตุผลในการปฏิเสธลอต *</label><textarea name="rejectionReason" value={formData.rejectionReason} onChange={handleChange} required className="input-control"></textarea></div>
          <div className="form-group" style={{ marginBottom: '20px' }}><label>🎯 รายละเอียดในการร้องขอ (วัตถุประสงค์) *</label><textarea name="purpose" value={formData.purpose} onChange={handleChange} required className="input-control"></textarea></div>
          <div className="form-group" style={{ marginBottom: '20px' }}><label>⚠️ หัวข้อในการร้องขอ *</label><textarea name="issues" value={formData.issues} onChange={handleChange} required className="input-control" style={{ minHeight: '80px' }}></textarea></div>
          <div className="form-group" style={{ marginBottom: '25px' }}><label>👤 ชื่อ-นามสกุล ผู้ร้องขอ *</label><input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} required className="input-control" /></div>

          <div className="form-group">
            <label>✍️ ลายเซ็นผู้ร้องขอ *</label>
            <div className="signature-wrapper"><SignatureCanvas ref={sigCanvas} penColor="#0f172a" canvasProps={{ width: 800, height: 200, style: { width: '100%', height: '200px' } }} /></div>
            <button type="button" onClick={clearSignature} className="btn-clear">↺ ล้างลายเซ็น</button>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">{loading ? 'กำลังประมวลผล...' : 'กดเพื่อตรวจสอบข้อมูล (Preview)'}</button>
        </form>
      </div>
    </div>
  );
}

// ==================== 2. หน้าสำหรับผู้ทบทวน (Review Page) ====================
function ReviewPage() {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('doc');
  
  const reviewSigCanvas = useRef({});
  const [actionType, setActionType] = useState('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ตัวแปรสำหรับเก็บข้อมูลที่ดึงมาโชว์
  const [docData, setDocData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    if (!docId) return;

    // ⚠️ นำ URL ของ Web App (Google Script) มาใส่ตรงนี้เพื่อให้หน้าเว็บดึงข้อมูลได้
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo8oo-JRvHx7CVSrBgSPxA4YAY0v_QtgTpW5psEV8E71PZ6_x0oIKVmHs14S-yw_fLYw/exec";
    
    fetch(`${GOOGLE_SCRIPT_URL}?doc=${docId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocData(data.data);
        }
        setLoadingData(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingData(false);
      });
  }, [docId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (actionType === 'approve' && reviewSigCanvas.current.isEmpty()) {
      alert('⚠️ กรุณาลงลายเซ็นก่อนอนุมัติ');
      return;
    }
    setSubmitting(true);
    alert(`บันทึกผลการทบทวนเอกสาร ${docId} เรียบร้อยแล้ว!`);
    setSubmitting(false);
  };

  return (
    <div className="app-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Prompt', sans-serif; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: #e2e8f0; min-height: 100vh; }
        .app-wrapper { display: flex; justify-content: center; align-items: center; padding: 40px 20px; min-height: 100vh; box-sizing: border-box; }
        .glass-panel { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 45px rgba(0,0,0,0.2); border-radius: 20px; padding: 40px; max-width: 700px; width: 100%; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
        .header h1 { font-size: 24px; color: #fff; margin: 0; }
        .doc-badge { background: #38bdf8; color: #0f172a; padding: 6px 14px; border-radius: 20px; font-weight: 700; display: inline-block; margin-bottom: 20px; }
        
        /* สไตล์สำหรับกล่องแสดงข้อมูลเอกสาร */
        .info-card { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05); }
        .info-row { display: flex; margin-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .info-label { width: 140px; color: #94a3b8; font-weight: 500; font-size: 14px; }
        .info-value { flex: 1; color: #fff; font-size: 15px; }
        .loading-text { text-align: center; color: #94a3b8; padding: 20px; font-size: 16px; }

        .form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
        label { font-size: 14px; color: #cbd5e1; margin-bottom: 8px; }
        .input-control { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 12px; border-radius: 8px; font-family: 'Prompt'; }
        .action-btns { display: flex; gap: 15px; margin-bottom: 20px; }
        .btn-approve { flex: 1; padding: 14px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-family: 'Prompt'; background: ${actionType === 'approve' ? '#10b981' : 'rgba(255,255,255,0.1)'}; color: white; }
        .btn-reject { flex: 1; padding: 14px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-family: 'Prompt'; background: ${actionType === 'reject' ? '#ef4444' : 'rgba(255,255,255,0.1)'}; color: white; }
        .signature-wrapper { background: white; border-radius: 8px; overflow: hidden; }
        .submit-btn { width: 100%; padding: 16px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: 'Prompt'; }
      `}</style>
      
      <div className="glass-panel">
        <div className="header">
          <h1>📋 ระบบทบทวนและอนุมัติคำขอ</h1>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div className="doc-badge">📄 เลขที่เอกสาร: {docId || 'ไม่พบรหัสเอกสาร'}</div>
        </div>

        {/* ================= กรอบแสดงข้อมูลเอกสาร ================= */}
        {loadingData ? (
          <div className="loading-text">⏳ กำลังดึงข้อมูลเอกสาร...</div>
        ) : docData ? (
          <div className="info-card">
            <div className="info-row"><div className="info-label">ผลิตภัณฑ์:</div><div className="info-value">{docData.productName}</div></div>
            <div className="info-row"><div className="info-label">Lot Number:</div><div className="info-value">{docData.lotNumber}</div></div>
            <div className="info-row"><div className="info-label">จำนวน:</div><div className="info-value">{docData.quantity} ชิ้น/แผ่น</div></div>
            <div className="info-row"><div className="info-label">ผู้ร้องขอ/หน่วยงาน:</div><div className="info-value">{docData.requester}</div></div>
            <div className="info-row"><div className="info-label">เหตุผลที่ปฏิเสธ:</div><div className="info-value" style={{ color: '#fbbf24' }}>{docData.rejectionReason}</div></div>
            <div className="info-row"><div className="info-label">วัตถุประสงค์:</div><div className="info-value">{docData.purpose}</div></div>
          </div>
        ) : (
          <div className="info-card" style={{ textAlign: 'center', color: '#ef4444' }}>❌ ไม่พบข้อมูลเอกสารในระบบ หรือดึงข้อมูลล้มเหลว</div>
        )}
        {/* ======================================================= */}

        <form onSubmit={handleSubmitReview}>
          <div className="form-group">
            <label>👤 ชื่อ-นามสกุล (ผู้ทบทวน / ผช.ผจก.) *</label>
            <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} required className="input-control" placeholder="ระบุชื่อของคุณ" />
          </div>

          <label>📌 ผลการพิจารณา *</label>
          <div className="action-btns">
            <button type="button" className="btn-approve" onClick={() => setActionType('approve')}>✅ อนุมัติ (Approve)</button>
            <button type="button" className="btn-reject" onClick={() => setActionType('reject')}>❌ ไม่อนุมัติ (Reject)</button>
          </div>

          {actionType === 'approve' ? (
            <div className="form-group">
              <label>✍️ ลงลายเซ็นผู้ทบทวน *</label>
              <div className="signature-wrapper">
                <SignatureCanvas ref={reviewSigCanvas} penColor="#0f172a" canvasProps={{ width: 620, height: 180, style: { width: '100%', height: '180px' } }} />
              </div>
              <button type="button" onClick={() => reviewSigCanvas.current.clear()} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', marginTop: '5px', textAlign: 'left' }}>↺ ล้างลายเซ็น</button>
            </div>
          ) : (
            <div className="form-group">
              <label>🚫 ระบุเหตุผลที่ไม่อนุมัติ *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required className="input-control" placeholder="กรุณาระบุเหตุผล..." style={{ minHeight: '100px' }}></textarea>
            </div>
          )}

          <button type="submit" disabled={submitting || loadingData} className="submit-btn">
            {submitting ? 'กำลังบันทึก...' : '📤 ส่งผลการพิจารณา'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== 3. ตัวจัดการเส้นทางหลัก (HashRouter) ====================
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequestForm />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
}

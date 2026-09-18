import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function App() {
  const [formData, setFormData] = useState({
    plant: 'FCB',
    productName: '',
    productSize: '',
    lotNumber: '',
    department: '', // ฟิลด์ใหม่: หน่วยงาน
    quantity: '',
    rejectionReason: '', // ฟิลด์ใหม่: เหตุผลในการปฏิเสธลอต
    purpose: '',
    issues: '', // ฟิลด์ใหม่: หัวข้อในการร้องขอ
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
        alert(`🎉 ส่งขอยอมรับผลิตภัณฑ์สำเร็จ!\nเลขที่เอกสาร: ${result.documentNumber}`);
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
    <div style={{ maxWidth: '650px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '5px' }}>📝 แบบขอยอมรับผลิตภัณฑ์แบบมีเงื่อนไข</h2>
      
      {ticketResult && (
        <div style={{ padding: '20px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '8px', marginBottom: '25px', textAlign: 'center', border: '1px solid #cce8d6' }}>
          <strong>🎉 บันทึกข้อมูลสำเร็จ!</strong> 
          <h2 style={{ margin: '10px 0', color: '#1e8e3e' }}>{ticketResult.documentNumber}</h2>
          {ticketResult.pdfUrl && (
             <a href={ticketResult.pdfUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#ea4335', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
               📥 เปิดดูไฟล์ PDF พร้อมลายเซ็น
             </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', padding: '12px', backgroundColor: '#e8f0fe', borderRadius: '6px' }}>
          <label><strong>🏭 เลือกสายการผลิต: *</strong></label>
          <label><input type="radio" name="plant" value="FCB" checked={formData.plant === 'FCB'} onChange={handleChange} /> FCB</label>
          <label><input type="radio" name="plant" value="CRT" checked={formData.plant === 'CRT'} onChange={handleChange} /> CRT</label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 2 }}><label>📦 ชื่อผลิตภัณฑ์: *</label><input type="text" name="productName" value={formData.productName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ flex: 1 }}><label>📊 จำนวน: *</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}><label>🔢 Lot ผลิต: *</label><input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ flex: 1 }}><label>🏢 หน่วยงานที่ร้องขอ: *</label><input type="text" name="department" value={formData.department} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>🚫 เหตุผลในการปฏิเสธลอต: *</label>
          <textarea name="rejectionReason" value={formData.rejectionReason} onChange={handleChange} required rows="2" style={{ width: '100%', padding: '8px' }}></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>📝 รายละเอียดในการร้องขอ (วัตถุประสงค์): *</label>
          <textarea name="purpose" value={formData.purpose} onChange={handleChange} required rows="2" style={{ width: '100%', padding: '8px' }} placeholder="เช่น เพื่อส่งกระบวนการถัดไป..."></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>⚠️ หัวข้อในการร้องขอ (สามารถกด Enter พิมพ์แยกข้อได้): *</label>
          <textarea name="issues" value={formData.issues} onChange={handleChange} required rows="4" style={{ width: '100%', padding: '8px' }} placeholder="ตัวอย่าง:&#10;ผิวหน้ามีรอยขีดข่วน&#10;ขอบบิ่นมุมขวา"></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}><label>👤 ชื่อผู้ร้องขอ: *</label><input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px dashed #aaa' }}>
          <label>✍️ เซ็นชื่อผู้ร้องขอ:</label>
          <div style={{ border: '1px solid #999', marginTop: '10px', backgroundColor: '#fff' }}>
            <SignatureCanvas ref={sigCanvas} penColor="blue" canvasProps={{ width: 550, height: 160, style: { width: '100%', height: '160px' } }} />
          </div>
          <button type="button" onClick={clearSignature} style={{ marginTop: '10px', padding: '6px 12px' }}>🧹 ล้างลายเซ็น</button>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1a73e8', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          {loading ? '⏳ กำลังสร้างเอกสาร PDF...' : '🚀 ยื่นคำขอยอมรับผลิตภัณฑ์'}
        </button>
      </form>
    </div>
  );
}

export default App;

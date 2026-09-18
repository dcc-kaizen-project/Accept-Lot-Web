import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

function App() {
  const [formData, setFormData] = useState({
    plant: 'FCB',
    productName: '',
    productSize: '',
    lotNumber: '',
    quantity: '',
    purpose: '',
    requesterName: ''
  });

  const sigCanvas = useRef({});
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sigCanvas.current.isEmpty && sigCanvas.current.isEmpty()) {
      alert('⚠️ กรุณาลงลายเซ็นผู้ร้องขอก่อนส่งเอกสารครับ');
      return;
    }

    setLoading(true);
    setTicketResult(null);

    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const payload = {
      ...formData,
      requesterSignature: signatureData
    };

    try {
      // ⚠️ เปลี่ยน URL ตรงนี้เป็น URL ของ Render Backend ของคุณ
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
        
        setFormData({
          plant: 'FCB', productName: '', productSize: '', lotNumber: '', quantity: '', purpose: '', requesterName: ''
        });
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
      <p style={{ textAlign: 'center', color: '#666', marginTop: '0', marginBottom: '20px' }}>(Conditional Product Acceptance Request - Accept Lot)</p>
      
      {ticketResult && (
        <div style={{ padding: '20px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '8px', marginBottom: '25px', textAlign: 'center', border: '1px solid #cce8d6' }}>
          <strong>🎉 บันทึกข้อมูลสำเร็จ!</strong> 
          <p style={{ margin: '10px 0' }}>เลขที่เอกสารของคุณคือ:</p>
          <h2 style={{ margin: '0 0 15px 0', color: '#1e8e3e', fontSize: '28px' }}>{ticketResult.documentNumber}</h2>
          
          {ticketResult.pdfUrl && (
             <a href={ticketResult.pdfUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#ea4335', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
               📥 เปิดดูไฟล์ PDF พร้อมลายเซ็น
             </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#e8f0fe', borderRadius: '6px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}><strong>🏭 เลือกสายการผลิต (Plant): *</strong></label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ cursor: 'pointer', fontWeight: 'bold', color: formData.plant === 'FCB' ? '#1a73e8' : '#333' }}>
              <input type="radio" name="plant" value="FCB" checked={formData.plant === 'FCB'} onChange={handleChange} /> FCB (แผ่นไฟเบอร์ซีเมนต์)
            </label>
            <label style={{ cursor: 'pointer', fontWeight: 'bold', color: formData.plant === 'CRT' ? '#1a73e8' : '#333' }}>
              <input type="radio" name="plant" value="CRT" checked={formData.plant === 'CRT'} onChange={handleChange} /> CRT (กระเบื้องหลังคา)
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>📦 ชื่อผลิตภัณฑ์: *</strong></label>
          <input type="text" name="productName" value={formData.productName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label><strong>📐 ขนาด / สเปก:</strong></label>
            <input type="text" name="productSize" value={formData.productSize} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label><strong>🔢 Lot ผลิต: *</strong></label>
            <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>📊 จำนวนที่ร้องขอ: *</strong></label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>📝 วัตถุประสงค์ในการร้องขอ: *</strong></label>
          <textarea name="purpose" value={formData.purpose} onChange={handleChange} required rows="4" style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><strong>👤 ชื่อ-นามสกุล ผู้ร้องขอ: *</strong></label>
          <input type="text" name="requesterName" value={formData.requesterName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px dashed #aaa' }}>
          <label><strong>✍️ เซ็นชื่อผู้ร้องขอ (ใช้นิ้วเซ็นบนหน้าจอได้เลย): *</strong></label>
          <div style={{ border: '1px solid #999', marginTop: '10px', borderRadius: '4px', backgroundColor: '#fff', touchAction: 'none' }}>
            <SignatureCanvas 
              ref={sigCanvas} 
              penColor="blue" 
              canvasProps={{ width: 550, height: 160, className: 'sigCanvas', style: { width: '100%', height: '160px' } }} 
            />
          </div>
          <button type="button" onClick={clearSignature} style={{ marginTop: '10px', padding: '8px 16px', fontSize: '14px', backgroundColor: '#f1f3f4', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🧹 ล้าง ลายเซ็นใหม่
          </button>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#ccc' : '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ กำลังสร้างเอกสาร PDF...' : '🚀 ยื่นคำขอยอมรับผลิตภัณฑ์'}
        </button>
      </form>
    </div>
  );
}

export default App;


import React, { useState } from 'react';
import { PaymentMethod } from './types.ts'

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PricingPlan = '3days' | 'weekly' | 'monthly';

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  const planDetails = {
    '3days': { price: '10.000', label: '/ 3 hari', title: 'Paket Hemat' },
    weekly: { price: '19.000', label: '/ minggu', title: 'Paket Mingguan' },
    monthly: { price: '59.000', label: '/ bulan', title: 'Paket Bulanan' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Left: Info Side */}
        <div className="md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">BiblioAI Premium</h2>
            <p className="text-indigo-100 text-sm">Buka potensi riset Anda tanpa batasan harian.</p>
          </div>

          <div className="space-y-4 flex-grow">
            {[
              "Pencarian Tanpa Batas",
              "Hasil Parafrase Lebih Dalam",
              "Ekspor ke Mendeley/Zotero",
              "Akses Prioritas AI Terbaru"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-medium">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-1">Total Bayar ({planDetails[selectedPlan].title})</p>
            <p className="text-2xl font-bold">Rp {planDetails[selectedPlan].price} <span className="text-sm font-normal text-indigo-200">{planDetails[selectedPlan].label}</span></p>
          </div>
        </div>

        {/* Right: Payment Side */}
        <div className="md:w-7/12 p-8 overflow-y-auto max-h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Instruksi Pembayaran</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Step 1: Pilih Paket */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">1</div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Pilih Paket</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedPlan('3days')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlan === '3days' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <p className={`text-[9px] font-bold uppercase ${selectedPlan === '3days' ? 'text-indigo-600' : 'text-slate-400'}`}>3 Hari</p>
                    <p className="text-sm font-bold text-slate-800">Rp 10rb</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlan('weekly')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlan === 'weekly' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <p className={`text-[9px] font-bold uppercase ${selectedPlan === 'weekly' ? 'text-indigo-600' : 'text-slate-400'}`}>Mingguan</p>
                    <p className="text-sm font-bold text-slate-800">Rp 19rb</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlan === 'monthly' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`text-[9px] font-bold uppercase ${selectedPlan === 'monthly' ? 'text-indigo-600' : 'text-slate-400'}`}>Bulanan</p>
                      <span className="text-[7px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">BEST</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Rp 59rb</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Pilih Metode */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">2</div>
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Pilih Metode</p>
                <div className="flex flex-wrap gap-2">
                  {[PaymentMethod.QRIS, PaymentMethod.EWALLET, PaymentMethod.BANK_TRANSFER].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMethod(m)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        selectedMethod === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex gap-4 transition-opacity ${!selectedMethod ? 'opacity-30' : 'opacity-100'}`}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">3</div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Selesaikan Transfer</p>
                
                {selectedMethod === PaymentMethod.BANK_TRANSFER && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Bank Syariah Indonesia (BSI)</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-800 tracking-wider">7331854241</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText('7331854241')}
                        className="text-[10px] text-indigo-600 font-bold uppercase hover:underline"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">a.n Heni Ismawati</p>
                  </div>
                )}

                {(selectedMethod === PaymentMethod.QRIS || selectedMethod === PaymentMethod.EWALLET) && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Dana / OVO / ShopeePay</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-800 tracking-wider">081386861293</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText('081386861293')}
                        className="text-[10px] text-indigo-600 font-bold uppercase hover:underline"
                      >
                        Salin
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium italic">Silakan transfer Rp {planDetails[selectedPlan].price} ke nomor di atas.</p>
                    {selectedMethod === PaymentMethod.QRIS && (
                       <div className="mt-2 flex justify-center border-t border-slate-200 pt-3">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=BiblioAI_Premium_${selectedPlan}_081386861293`} alt="QR" className="w-24 h-24 rounded border border-white" />
                       </div>
                    )}
                  </div>
                )}

                {!selectedMethod && <p className="text-[10px] text-slate-400 italic">Silakan pilih metode pembayaran di langkah 2...</p>}
              </div>
            </div>

            {/* Step 4 */}
            <div className={`flex gap-4 transition-opacity ${!selectedMethod ? 'opacity-30' : 'opacity-100'}`}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">4</div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Konfirmasi Pembayaran</p>
                <button
                  disabled={!selectedMethod || isProcessing}
                  onClick={handlePayment}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-200 shadow-lg shadow-indigo-100 transition-all"
                >
                  {isProcessing ? 'Memverifikasi Transaksi...' : 'Konfirmasi Saya Sudah Bayar'}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-slate-400 leading-relaxed">
            Pembayaran akan diverifikasi secara otomatis dalam 1-5 menit. <br />
            Simpan bukti transfer Anda jika terjadi kendala.
          </p>
        </div>
      </div>
    </div>
  );
};

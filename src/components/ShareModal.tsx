import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { Share2, Send, CheckCircle, Copy, X, FileSpreadsheet, Download, RefreshCw, Smartphone } from 'lucide-react';

interface ShareModalProps {
  item: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ item, isOpen, onClose }: ShareModalProps) {
  const [retailerName, setRetailerName] = useState<string>('Radha Krishna Boutique');
  const [phone, setPhone] = useState<string>('');
  const [template, setTemplate] = useState<'english' | 'hindi' | 'gujarati'>('english');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compile specific templates incorporating wholesaler variables
  const getMessageText = (): string => {
    const greetingMap = {
      english: `*Trade Catalogue from ${item.branding.shopName}*\n\nDear *${retailerName}*,\nGreetings from Avadh Textile Market, Surat! 🙏\n\nWe are pleased to introduce our premium *${item.title}* collection.\n\n*Product Specifications:*\n- Fabric: ${item.material}\n- Design Detail: ${item.patternType}\n- SKU: *${item.branding.sku}*\n- Saree direct mill locations: ${item.fabricDetails.suratFactoryLoc}\n${item.branding.showWholesalePrice ? `- Wholesale Rate: *${item.branding.wholesalePrice}*\n` : ''}- MOQ: ${item.branding.customPromoText}\n\n👉 Let us know your preferred quantity sets immediately! Reply on WhatsApp.`,
      
      hindi: `*सूरत डायरेक्ट थोक कैटलॉग: ${item.branding.shopName}*\n\nप्रिय *${retailerName}* जी,\nसूरत कपड़ा मंडी से नमस्कार! 🙏\n\nहमारी नई प्रीमियम साड़ी *${item.title}* थोक खरीदारों के लिए उपलब्ध है।\n\n*विशेषताएं:*\n- कपड़ा: ${item.material}\n- काम: ${item.patternType}\n- SKU कोड: *${item.branding.sku}*\n${item.branding.showWholesalePrice ? `- थोक दर: *${item.branding.wholesalePrice}*\n` : ''}- मिनिमम आर्डर: ${item.branding.customPromoText}\n\n👉 कस्टमाइज़ आर्डर बुक करने के लिए कृपया हमें तुरंत रीप्लाई करें। धन्यवाद!`,
      
      gujarati: `*સુરત ડાયરેક્ટ હોલસેલ કેટલોગ: ${item.branding.shopName}*\n\nસ્નેહી *${retailerName}*,\nસુરત ટેક્સટાઇલ માર્કેટ તરફથી પ્રણામ! 🙏\n\nઅમારી નવી પ્રીમિયમ સાડી ડિઝાઈન *${item.title}* હોલસેલ ખરીદી માટે તૈયાર છે.\n\n*વિગતો:*\n- ફેબ્રિક: ${item.material}\n- વર્ક: ${item.patternType}\n- SKU કોડ: *${item.branding.sku}*\n${item.branding.showWholesalePrice ? `- હોલસેલ કિંમત: *${item.branding.wholesalePrice}*\n` : ''}\n\n👉 તમારી જરૂરિયાત મુજબ ઓર્ડર બુક કરાવવા માટે તરત જ અહીં રીપ્લાય કરો.`
    };

    return greetingMap[template];
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getMessageText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    const textEncoded = encodeURIComponent(getMessageText());
    // Parse pure phone format
    const cleanedPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanedPhone ? (cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`) : '';
    
    const whatsappUrl = finalPhone 
      ? `https://api.whatsapp.com/send?phone=${finalPhone}&text=${textEncoded}`
      : `https://api.whatsapp.com/send?text=${textEncoded}`;
      
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div id="share-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-2xl z-10 flex flex-col">
        {/* Header banner */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Share2 className="text-indigo-400" size={18} />
            <h3 className="font-bold text-sm tracking-tight m-0">Send Catalogue via WhatsApp</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-white/5 hover:bg-white/15 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <h4 className="text-slate-950 font-bold text-xs uppercase tracking-wider mb-2">Configure Retailer details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Retailer/Shop Name</label>
                <input
                  type="text"
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  placeholder="e.g. Balaji Saree Sringar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 flex items-center gap-1">
                  <Smartphone size={11} className="text-slate-400" />
                  <span>WhatsApp Number (Optional)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98250XXXXX (Without +91)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Template select tabs */}
          <div>
            <span className="block text-slate-500 text-xs mb-1.5 font-bold">Injected language templates</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'english', label: 'B2B Trade English' },
                { id: 'hindi', label: 'Surat Hindi (हिंदी)' },
                { id: 'gujarati', label: 'Gujarati (ગુજરાતી)' }
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplate(tpl.id as any)}
                  className={`py-1.5 rounded-lg border text-xs text-center font-bold transition-all ${
                    template === tpl.id 
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm' 
                      : 'bg-slate-50 text-slate-655 border-slate-202 hover:bg-slate-100'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <span className="block text-slate-500 text-xs mb-1 font-bold">Copy or dispatch preview:</span>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-serif text-slate-800 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap select-text">
              {getMessageText()}
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-white text-xs border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppSend}
            className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-lg shadow-md hover:shadow-emerald-600/10 transition-all flex items-center justify-center gap-2"
          >
            <Send size={14} />
            <span>Broadcast on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

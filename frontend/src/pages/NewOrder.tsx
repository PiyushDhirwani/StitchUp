import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ruler,
  Shirt,
  AlertTriangle,
  Check,
  Package,
  IndianRupee,
  Info,
  MessageSquare,
  Mic,
  MicOff,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { useNewOrder } from '@/hooks/useNewOrder';
import { StepIndicator } from '@/components/order/StepIndicator';
import { MeasurementForm, measurementLabels } from '@/components/order/MeasurementForm';
import { AddressForm } from '@/components/order/AddressForm';
import { DeliveryMethodSelector } from '@/components/order/DeliveryMethodSelector';
import { cn } from '@/lib/cn';
import { ORDER_CONFIG } from '@/config/order.config';
import type { Measurements } from '@/types/order.types';

export default function NewOrder() {
  const o = useNewOrder();

  const renderTemplateStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">What would you like to get stitched?</h2>
      <p className="text-sm text-gray-500 mb-2">Choose a template to get started</p>

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
        <Info size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">Stitching services are available <strong>only for adults (12+)</strong> on this platform.</p>
      </div>

      {o.loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-600" size={28} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {o.templates.map((t) => (
            <button
              key={t.template_type.id}
              type="button"
              onClick={() => o.setSelectedTemplate(t)}
              className={cn(
                'relative rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-md',
                o.selectedTemplate?.template_type.id === t.template_type.id ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {t.template_type.image_url ? (
                <img src={t.template_type.image_url} alt={t.template_type.type_name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package size={40} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{t.template_type.type_name}</h3>
                  {t.template_type.base_price != null && Number(t.template_type.base_price) > 0 ? (
                    <span className="flex items-center text-sm font-bold text-teal-700"><IndianRupee size={13} />{Number(t.template_type.base_price).toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Price TBD</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.template_type.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t.template_type.category}</span>
                  {t.template_type.estimated_hours && <span className="text-[10px] text-gray-400">~{t.template_type.estimated_hours}h</span>}
                </div>
              </div>
              {o.selectedTemplate?.template_type.id === t.template_type.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => {
    if (!o.selectedTemplate) return null;
    return (
      <div className="space-y-8">
        {/* Section 1: Measurements */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800">How should we get your measurements?</h2>
            <a href={ORDER_CONFIG.MEASUREMENT_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink size={12} /> Measurement Guide
            </a>
          </div>
          <p className="text-sm text-gray-500 mb-5">Choose the method that works best for you</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => { o.setMeasurementMethod('manual_measurements'); o.setReferenceConfirmed(false); }}
              className={cn('rounded-xl border-2 p-4 text-left transition-all', o.measurementMethod === 'manual_measurements' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300')}
            >
              <Ruler size={20} className={o.measurementMethod === 'manual_measurements' ? 'text-teal-600' : 'text-gray-400'} />
              <p className="font-medium text-sm mt-2">Enter Measurements</p>
              <p className="text-xs text-gray-500 mt-0.5">Provide your body measurements manually</p>
            </button>
            <button
              type="button"
              onClick={() => o.setMeasurementMethod('reference_clothing')}
              className={cn('rounded-xl border-2 p-4 text-left transition-all', o.measurementMethod === 'reference_clothing' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300')}
            >
              <Shirt size={20} className={o.measurementMethod === 'reference_clothing' ? 'text-amber-600' : 'text-gray-400'} />
              <p className="font-medium text-sm mt-2">Reference Clothing</p>
              <p className="text-xs text-gray-500 mt-0.5">Send similar existing clothes to the tailor</p>
            </button>
          </div>

          {o.measurementMethod === 'manual_measurements' && (
            <MeasurementForm
              measurements={o.measurements}
              setMeasure={o.setMeasure}
              isRecording={o.isRecording}
              audioBlob={o.audioBlob}
              audioUrl={o.audioUrl}
              uploadingAudio={o.uploadingAudio}
              setAudioBlob={o.setAudioBlob}
              setAudioUrl={o.setAudioUrl}
              setAudioCloudUrl={o.setAudioCloudUrl}
              startRecording={o.startRecording}
              stopRecording={o.stopRecording}
            />
          )}

          {o.measurementMethod === 'reference_clothing' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">Important — Please read carefully</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-amber-700">
                      <li>• You must have <strong>exactly similar clothes</strong> that match the style you're ordering.</li>
                      <li>• The tailor will measure directly from your reference clothing — any mismatch will cause incorrect sizing.</li>
                      <li>• For example, ordering a kurta? Send a kurta — <strong>not a shirt or t-shirt</strong>.</li>
                      <li>• You'll need to deliver the reference clothes to the tailor before stitching begins.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors', o.referenceConfirmed ? 'bg-teal-600 border-teal-600' : 'border-gray-300 group-hover:border-gray-400')}>
                  {o.referenceConfirmed && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-gray-700">I confirm that I have <strong>exactly similar clothes</strong> and will provide them to the tailor.</span>
                <input type="checkbox" className="hidden" checked={o.referenceConfirmed} onChange={(e) => o.setReferenceConfirmed(e.target.checked)} />
              </label>
            </div>
          )}
        </div>

        {/* Section 2: Special Requests */}
        {o.measurementDone() && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-800">Special Requests</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">Any additional instructions, design preferences, or notes for the tailor? Type below or record an audio note.</p>
            <textarea
              value={o.specialRequests}
              onChange={(e) => o.setSpecialRequests(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="e.g. Slightly loose fit around the waist, add a pocket on the left side, use matching buttons..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{o.specialRequests.length}/1000</p>

            {/* Audio recording for special instructions */}
            <div className="rounded-xl border border-gray-200 p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Mic size={16} className="text-teal-600" />
                <p className="text-sm font-medium text-gray-700">Record Audio Note (optional)</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">Prefer to speak your special instructions? Record an audio note (max {ORDER_CONFIG.AUDIO_MAX_DURATION_SECONDS / 60} min) — we'll share it with the tailor.</p>
              <div className="flex items-center gap-3">
                {!o.siIsRecording && !o.siAudioBlob && (
                  <button type="button" onClick={o.startSiRecording} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
                    <Mic size={14} /> Start Recording
                  </button>
                )}
                {o.siIsRecording && (
                  <button type="button" onClick={o.stopSiRecording} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium animate-pulse">
                    <MicOff size={14} /> Stop Recording
                  </button>
                )}
                {o.siAudioUrl && !o.siIsRecording && (
                  <div className="flex items-center gap-3 flex-1">
                    <audio src={o.siAudioUrl} controls className="h-9 flex-1" />
                    <button type="button" onClick={() => { o.setSiAudioBlob(null); o.setSiAudioUrl(null); o.setSiAudioCloudUrl(''); }} className="text-xs text-red-600 hover:text-red-800 font-medium">Remove</button>
                  </div>
                )}
              </div>
              {o.siUploadingAudio && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading audio...</p>}
            </div>
          </div>
        )}

        {/* Section 3: Delivery Address */}
        {o.measurementDone() && (
          <div className="border-t border-gray-200 pt-6">
            <AddressForm
              address={o.address}
              setAddr={o.setAddr}
              contactPhone={o.contactPhone}
              setContactPhone={o.setContactPhone}
              contactEmail={o.contactEmail}
              setContactEmail={o.setContactEmail}
              pincodeLoading={o.pincodeLoading}
              pincodeDistrict={o.pincodeDistrict}
              reverseGeoLoading={o.reverseGeoLoading}
              geoStatus={o.geo.status}
              geoLocation={o.geo.location}
              onRequestLocation={o.geo.requestLocation}
            />
          </div>
        )}

        {/* Section 4: Delivery Method */}
        {o.measurementDone() && o.addressDone() && (
          <div className="border-t border-gray-200 pt-6">
            <DeliveryMethodSelector deliveryMethod={o.deliveryMethod} setDeliveryMethod={o.setDeliveryMethod} />
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Review your order</h2>
      <p className="text-sm text-gray-500 mb-5">Confirm everything looks correct before paying</p>

      {o.payError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
          <AlertTriangle size={16} /> {o.payError}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Template</p>
          <div className="flex items-center gap-3">
            {o.selectedTemplate?.template_type.image_url && <img src={o.selectedTemplate.template_type.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{o.selectedTemplate?.template_type.type_name}</p>
              <p className="text-xs text-gray-500">{o.selectedTemplate?.template_type.category}</p>
            </div>
            <span className="flex items-center text-lg font-bold text-teal-700"><IndianRupee size={15} />{Number(o.templatePrice).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Measurement Method</p>
          {o.measurementMethod === 'manual_measurements' ? (
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Ruler size={14} className="text-teal-600" /> Manual Measurements</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(Object.keys(o.measurements) as (keyof Measurements)[]).filter((k) => o.measurements[k]).map((k) => (
                  <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5">
                    <p className="text-[10px] text-gray-400">{measurementLabels[k]}</p>
                    <p className="text-sm font-mono text-gray-700">{o.measurements[k]}</p>
                  </div>
                ))}
              </div>
              {o.audioUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <Mic size={12} className="text-teal-600" />
                  <span className="text-xs text-gray-500">Audio note attached</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-amber-700 flex items-center gap-1.5"><Shirt size={14} className="text-amber-600" /> Reference Clothing<span className="text-xs text-gray-400 ml-1">— tailor will measure from your clothes</span></p>
          )}
        </div>

        {(o.specialRequests || o.siAudioUrl) && (
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase font-medium text-gray-400 mb-2">Special Requests</p>
            {o.specialRequests && <p className="text-sm text-gray-700 whitespace-pre-wrap">{o.specialRequests}</p>}
            {o.siAudioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <Mic size={12} className="text-teal-600" />
                <span className="text-xs text-gray-500">Audio note attached</span>
                <audio src={o.siAudioUrl} controls className="h-8 ml-2" />
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Delivery Address</p>
          <p className="text-sm text-gray-700">{o.address.flat_number}, {o.address.address_line1}</p>
          <p className="text-sm text-gray-500">{o.address.city}, {o.address.state} — {o.address.postal_code}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Phone size={10} /> {o.contactPhone}</span>
            <span className="flex items-center gap-1"><Mail size={10} /> {o.contactEmail}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Material Delivery</p>
          {o.deliveryMethod === 'pickup' ? (
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <span className="text-teal-600">⬆</span> Pickup by our delivery — ₹{ORDER_CONFIG.PICKUP_FEE}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <span className="text-teal-600">📦</span> Self Parcel — within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days
            </p>
          )}
        </div>

        <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stitching ({o.selectedTemplate?.template_type.type_name})</span>
              <span className="text-gray-800 font-medium flex items-center"><IndianRupee size={12} />{Number(o.templatePrice).toLocaleString('en-IN')}</span>
            </div>
            {o.pickupFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pickup fee</span>
                <span className="text-gray-800 font-medium flex items-center"><IndianRupee size={12} />{o.pickupFee}</span>
              </div>
            )}
            <div className="border-t border-teal-200 pt-1.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Total</p>
              <span className="flex items-center text-xl font-bold text-teal-700"><IndianRupee size={17} />{o.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Fixed price. No hidden charges.</p>
        </div>
      </div>
    </div>
  );

  const renderConfirmedStep = () => (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-2">Your payment was successful and your order has been placed.</p>
      {o.confirmedOrderId && (
        <p className="text-sm text-teal-700 font-medium mb-6">Order ID: <span className="font-mono font-bold">#{o.confirmedOrderId}</span></p>
      )}

      <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5 w-full max-w-sm mb-6">
        <p className="text-sm text-teal-800 font-medium mb-1">What happens next?</p>
        <ul className="text-xs text-teal-700 space-y-1.5 text-left">
          {o.deliveryMethod === 'self_parcel' ? (
            <>
              <li>• Send your material/reference clothes within {ORDER_CONFIG.PARCEL_DEADLINE_DAYS} days</li>
              <li>• Once received, a tailor will be assigned</li>
              <li>• Track progress in your order history</li>
            </>
          ) : (
            <>
              <li>• Our delivery partner will pick up your material</li>
              <li>• Once collected, a tailor will be assigned</li>
              <li>• Track progress in your order history</li>
            </>
          )}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => {
          if (o.confirmedOrderId) {
            o.navigate(`/orders/${o.confirmedOrderId}`);
          } else {
            o.navigate('/dashboard', { state: { orderSuccess: true } });
          }
        }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
      >
        <ClipboardList size={16} /> Check Order Status
      </button>

      <button type="button" onClick={() => o.navigate('/dashboard')} className="mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {o.step !== 'confirmed' ? (
            <button type="button" onClick={() => (o.step === 'template' ? o.navigate('/dashboard') : o.goBack())} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <ChevronLeft size={18} /> {o.step === 'template' ? 'Dashboard' : 'Back'}
            </button>
          ) : <div className="w-16" />}
          <p className="text-sm font-medium text-gray-700">{o.STEPS[o.stepIndex >= 0 ? o.stepIndex : 0].label}</p>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {o.step !== 'confirmed' && <StepIndicator stepIndex={o.stepIndex} />}

        {o.step === 'template' && renderTemplateStep()}
        {o.step === 'details' && renderDetailsStep()}
        {o.step === 'review' && renderReviewStep()}
        {o.step === 'confirmed' && renderConfirmedStep()}
      </div>

      {o.step !== 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => (o.step === 'template' ? o.navigate('/dashboard') : o.goBack())} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronLeft size={16} /> {o.step === 'template' ? 'Dashboard' : 'Back'}
            </button>

            <span className="text-xs text-gray-400 hidden sm:block">Step {o.stepIndex + 1} of {o.STEPS.length}</span>

            {o.step === 'review' ? (
              <button type="button" disabled={o.placing} onClick={o.handlePlaceOrder} className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:bg-teal-400">
                {o.placing ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={14} />}
                {o.placing ? 'Processing...' : `Pay ₹${o.totalAmount.toLocaleString('en-IN')}`}
              </button>
            ) : (
              <button type="button" disabled={!o.canNext()} onClick={o.goNext} className={cn('flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium text-sm transition-all', o.canNext() ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

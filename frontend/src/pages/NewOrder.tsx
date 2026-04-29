import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ruler,
  Shirt,
  AlertTriangle,
  Check,
  Package,
} from 'lucide-react';
import { templateService, type Template, type SubType } from '@/services/templates';
import { cn } from '@/lib/cn';

type Step = 'template' | 'subtypes' | 'review';

const STEPS: { key: Step; label: string }[] = [
  { key: 'template', label: 'Choose Template' },
  { key: 'subtypes', label: 'Parts & Measurements' },
  { key: 'review', label: 'Review' },
];

type MeasurementMethod = 'manual_measurements' | 'reference_clothing';

interface Measurements {
  height_cm: string;
  weight_kg: string;
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  shoulder_width_cm: string;
  arm_length_cm: string;
  inseam_cm: string;
  neck_cm: string;
  back_length_cm: string;
}

const emptyMeasurements: Measurements = {
  height_cm: '',
  weight_kg: '',
  chest_cm: '',
  waist_cm: '',
  hips_cm: '',
  shoulder_width_cm: '',
  arm_length_cm: '',
  inseam_cm: '',
  neck_cm: '',
  back_length_cm: '',
};

const measurementLabels: Record<keyof Measurements, string> = {
  height_cm: 'Height (cm)',
  weight_kg: 'Weight (kg)',
  chest_cm: 'Chest (cm)',
  waist_cm: 'Waist (cm)',
  hips_cm: 'Hips (cm)',
  shoulder_width_cm: 'Shoulder Width (cm)',
  arm_length_cm: 'Arm Length (cm)',
  inseam_cm: 'Inseam (cm)',
  neck_cm: 'Neck (cm)',
  back_length_cm: 'Back Length (cm)',
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('template');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Selections
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedSubTypes, setSelectedSubTypes] = useState<SubType[]>([]);
  const [measurementMethod, setMeasurementMethod] = useState<MeasurementMethod>('manual_measurements');
  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements);
  const [referenceConfirmed, setReferenceConfirmed] = useState(false);

  useEffect(() => {
    templateService
      .getAll()
      .then((res) => setTemplates(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const canNext = (): boolean => {
    if (step === 'template') return !!selectedTemplate;
    if (step === 'subtypes') {
      if (selectedSubTypes.length === 0) return false;
      if (measurementMethod === 'reference_clothing') return referenceConfirmed;
      const required: (keyof Measurements)[] = ['chest_cm', 'waist_cm', 'shoulder_width_cm'];
      return required.every((k) => measurements[k].trim() !== '');
    }
    return true;
  };

  const goNext = () => {
    const idx = stepIndex;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };
  const goBack = () => {
    const idx = stepIndex;
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const toggleSubType = (st: SubType) => {
    setSelectedSubTypes((prev) =>
      prev.find((s) => s.id === st.id)
        ? prev.filter((s) => s.id !== st.id)
        : [...prev, st],
    );
  };

  const setMeasure = (key: keyof Measurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value.replace(/[^\d.]/g, '') }));
  };

  // ─── Renderers ───────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
              i < stepIndex
                ? 'bg-teal-600 text-white'
                : i === stepIndex
                  ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500'
                  : 'bg-gray-100 text-gray-400',
            )}
          >
            {i < stepIndex ? <Check size={14} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'w-10 h-0.5 mx-1',
                i < stepIndex ? 'bg-teal-500' : 'bg-gray-200',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderTemplateStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">What would you like to get stitched?</h2>
      <p className="text-sm text-gray-500 mb-5">Choose a template to get started</p>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-teal-600" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.template_type.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(t);
                setSelectedSubTypes([]);
              }}
              className={cn(
                'relative rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-md',
                selectedTemplate?.template_type.id === t.template_type.id
                  ? 'border-teal-500 ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {t.template_type.image_url ? (
                <img
                  src={t.template_type.image_url}
                  alt={t.template_type.type_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package size={40} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{t.template_type.type_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.template_type.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {t.template_type.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{t.sub_types.length} parts</span>
                </div>
              </div>
              {selectedTemplate?.template_type.id === t.template_type.id && (
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

  const renderSubTypesStep = () => {
    if (!selectedTemplate) return null;
    return (
      <div className="space-y-8">
        {/* ─── Part 1: Select Parts ─────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Select parts of {selectedTemplate.template_type.type_name}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose which pieces you need stitched — you can pick individual parts or all of them
          </p>

          {/* Select all toggle */}
          <button
            type="button"
            onClick={() =>
              setSelectedSubTypes(
                selectedSubTypes.length === selectedTemplate.sub_types.length
                  ? []
                  : [...selectedTemplate.sub_types],
              )
            }
            className="text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors mb-4"
          >
            {selectedSubTypes.length === selectedTemplate.sub_types.length ? 'Deselect All' : 'Select All Parts'}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedTemplate.sub_types.map((st) => {
              const selected = selectedSubTypes.some((s) => s.id === st.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleSubType(st)}
                  className={cn(
                    'relative rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-md',
                    selected
                      ? 'border-teal-500 ring-2 ring-teal-200'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  {st.image_url ? (
                    <img
                      src={st.image_url}
                      alt={st.sub_type_name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Shirt size={32} className="text-gray-300" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 text-sm">{st.sub_type_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{st.description}</p>
                  </div>
                  {selected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Part 2: Measurements (shown after selecting at least one subtype) ── */}
        {selectedSubTypes.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">How should we get your measurements?</h2>
            <p className="text-sm text-gray-500 mb-5">Choose the method that works best for you</p>

            {/* Method toggle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMeasurementMethod('manual_measurements');
                  setReferenceConfirmed(false);
                }}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  measurementMethod === 'manual_measurements'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              >
                <Ruler size={20} className={measurementMethod === 'manual_measurements' ? 'text-teal-600' : 'text-gray-400'} />
                <p className="font-medium text-sm mt-2">Enter Measurements</p>
                <p className="text-xs text-gray-500 mt-0.5">Provide your body measurements manually</p>
              </button>

              <button
                type="button"
                onClick={() => setMeasurementMethod('reference_clothing')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  measurementMethod === 'reference_clothing'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              >
                <Shirt size={20} className={measurementMethod === 'reference_clothing' ? 'text-amber-600' : 'text-gray-400'} />
                <p className="font-medium text-sm mt-2">Reference Clothing</p>
                <p className="text-xs text-gray-500 mt-0.5">Send similar existing clothes to the tailor</p>
              </button>
            </div>

            {/* Manual measurements form */}
            {measurementMethod === 'manual_measurements' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Fields marked * are required</p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(measurementLabels) as (keyof Measurements)[]).map((key) => {
                    const required = ['chest_cm', 'waist_cm', 'shoulder_width_cm'].includes(key);
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {measurementLabels[key]} {required && <span className="text-red-400">*</span>}
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={measurements[key]}
                          onChange={(e) => setMeasure(key, e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reference clothing option */}
            {measurementMethod === 'reference_clothing' && (
              <div className="space-y-4">
                {/* Warning banner */}
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-amber-800">Important — Please read carefully</p>
                      <ul className="mt-2 space-y-1.5 text-xs text-amber-700">
                        <li>• You must have <strong>exactly similar clothes</strong> that match the style you're ordering.</li>
                        <li>• The tailor will measure directly from your reference clothing — any mismatch in style will result in incorrect sizing.</li>
                        <li>• For example, if you're ordering a kurta, send a kurta that fits you well — <strong>not a shirt or t-shirt</strong>.</li>
                        <li>• You'll need to deliver the reference clothes to the tailor before stitching begins.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      referenceConfirmed
                        ? 'bg-teal-600 border-teal-600'
                        : 'border-gray-300 group-hover:border-gray-400',
                    )}
                  >
                    {referenceConfirmed && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">
                    I confirm that I have <strong>exactly similar clothes</strong> matching the selected template and will provide them to the tailor for measurements.
                  </span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={referenceConfirmed}
                    onChange={(e) => setReferenceConfirmed(e.target.checked)}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Review your order</h2>
      <p className="text-sm text-gray-500 mb-5">Confirm everything looks correct before placing</p>

      <div className="space-y-4">
        {/* Template */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Template</p>
          <div className="flex items-center gap-3">
            {selectedTemplate?.template_type.image_url && (
              <img
                src={selectedTemplate.template_type.image_url}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-800">{selectedTemplate?.template_type.type_name}</p>
              <p className="text-xs text-gray-500">{selectedTemplate?.template_type.category}</p>
            </div>
          </div>
        </div>

        {/* Subtypes */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Selected Parts</p>
          <div className="space-y-2">
            {selectedSubTypes.map((st) => (
              <div key={st.id} className="flex items-center gap-3">
                {st.image_url && (
                  <img src={st.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">{st.sub_type_name}</p>
                  <p className="text-xs text-gray-400">{st.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Measurement method */}
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase font-medium text-gray-400 mb-2">Measurement Method</p>
          {measurementMethod === 'manual_measurements' ? (
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Ruler size={14} className="text-teal-600" /> Manual Measurements
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(Object.keys(measurements) as (keyof Measurements)[])
                  .filter((k) => measurements[k])
                  .map((k) => (
                    <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <p className="text-[10px] text-gray-400">{measurementLabels[k]}</p>
                      <p className="text-sm font-mono text-gray-700">{measurements[k]}</p>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
              <Shirt size={14} className="text-amber-600" /> Reference Clothing
              <span className="text-xs text-gray-400 ml-1">— tailor will measure from your clothes</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 'template' ? navigate('/dashboard') : goBack())}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> {step === 'template' ? 'Dashboard' : 'Back'}
          </button>
          <p className="text-sm font-medium text-gray-700">
            {STEPS[stepIndex].label}
          </p>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {renderStepIndicator()}

        {step === 'template' && renderTemplateStep()}
        {step === 'subtypes' && renderSubTypesStep()}
        {step === 'review' && renderReviewStep()}
      </div>

      {/* ─── Floating bottom navigation bar ──────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => (step === 'template' ? navigate('/dashboard') : goBack())}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 'template' ? 'Dashboard' : 'Back'}
          </button>

          {/* Step indicator */}
          <span className="text-xs text-gray-400 hidden sm:block">
            Step {stepIndex + 1} of {STEPS.length}
          </span>

          {/* Continue / Place Order */}
          {step === 'review' ? (
            <button
              type="button"
              onClick={() => {
                // TODO: integrate with order API once auth flow is ready
                alert('Order flow preview — full API integration coming next!');
              }}
              className="flex items-center gap-1 px-6 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              Place Order
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext()}
              onClick={goNext}
              className={cn(
                'flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                canNext()
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              Continue <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

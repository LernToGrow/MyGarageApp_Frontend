import { useEffect, useState } from 'react';
import { garageApi } from '../../api/garage.api';
import { useT } from '../../hooks/useT';

const STATUS_STEPS = ['received', 'inspecting', 'estimated', 'in_progress', 'done', 'paid'];
const STEP_LABELS  = ['Received', 'Inspect', 'Estimated', 'Working', 'Done', 'Paid'];

const STATUS_ORDER = { received: 0, inspecting: 1, estimated: 2, in_progress: 3, done: 4, paid: 5 };

const PAYMENT_STATUS_COLORS = { paid: '#2d6a4f', partial: '#E85D04', pending: '#c62828' };
const PAYMENT_STATUS_BG     = { paid: '#f0faf4', partial: '#FFF4EE', pending: '#fff5f5' };

function fmt(n) {
  if (n == null) return '—';
  return `₹${Number(n).toLocaleString()}`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function Row({ label, value, valueStyle }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right ml-4" style={valueStyle}>{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-4 pt-4 pb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
        </div>
      )}
      <div className="px-4 pb-2">{children}</div>
    </div>
  );
}

export default function JobDetailPanel({ jobId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    garageApi.getJob(jobId).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [jobId]);

  const job     = data?.job;
  const invoice = data?.invoice;
  const currentStep = STATUS_ORDER[job?.status] ?? 0;

  const paymentLabel =
    job?.payment_status === 'paid'    ? 'Paid' :
    job?.payment_status === 'partial' ? 'Partial Payment' : 'Pending';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Slide-over panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{ width: 460, background: '#f6f6f6', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold text-gray-900">Job Detail</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#E85D04', borderTopColor: 'transparent' }} />
            </div>
          ) : !job ? (
            <p className="text-sm text-gray-400 text-center py-10">Job not found</p>
          ) : (
            <>
              {/* Job number + status badge */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xl font-extrabold text-gray-900">#{job.job_number}</span>
                {job.payment_status && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: PAYMENT_STATUS_BG[job.payment_status],
                      color: PAYMENT_STATUS_COLORS[job.payment_status],
                    }}
                  >
                    {paymentLabel}
                  </span>
                )}
              </div>

              {/* Status timeline */}
              <Section>
                <div className="flex items-center justify-between py-3">
                  {STATUS_STEPS.map((step, i) => {
                    const done    = i < currentStep;
                    const active  = i === currentStep;
                    const pending = i > currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                        {/* Connector line + circle row */}
                        <div className="flex items-center w-full">
                          {/* left line */}
                          <div className="flex-1 h-0.5" style={{ background: i === 0 ? 'transparent' : (done || active ? '#E85D04' : '#e0e0e0') }} />
                          {/* circle */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2"
                            style={{
                              borderColor: done || active ? '#E85D04' : '#d0d0d0',
                              background: done ? '#E85D04' : active ? '#fff' : '#fff',
                            }}
                          >
                            {done ? (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : active ? (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#E85D04' }} />
                            ) : null}
                          </div>
                          {/* right line */}
                          <div className="flex-1 h-0.5" style={{ background: i === STATUS_STEPS.length - 1 ? 'transparent' : (done ? '#E85D04' : '#e0e0e0') }} />
                        </div>
                        <span className="text-xs text-center" style={{ color: done || active ? '#E85D04' : '#aaa', fontSize: 10 }}>
                          {STEP_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Customer */}
              <Section title="Customer">
                <Row label="Name"  value={job.customer_id?.name} />
                <Row label="Phone" value={job.customer_id?.phone} />
              </Section>

              {/* Bike */}
              <Section title="Bike">
                <Row label="Make / Model" value={[job.bike_id?.make, job.bike_id?.model].filter(Boolean).join(' ') || '—'} />
                <Row label="Plate"        value={job.bike_id?.plate_number} />
                {job.bike_id?.year      && <Row label="Year"     value={job.bike_id.year} />}
                {job.bike_id?.fuel_type && <Row label="Fuel"     value={job.bike_id.fuel_type} />}
                {job.odometer_in != null && <Row label="Odometer" value={`${job.odometer_in} km`} />}
              </Section>

              {/* Timeline */}
              <Section title="Timeline">
                <Row label="Created"   value={fmtDate(job.created_at)} />
                {job.inspection_done_at && <Row label="Inspected" value={fmtDate(job.inspection_done_at)} />}
                {job.estimated_ready_at && <Row label="Ready by"  value={fmtDate(job.estimated_ready_at)} />}
                {job.start_time         && <Row label="Started"   value={fmtDate(job.start_time)} />}
                {job.end_time           && <Row label="Completed" value={fmtDate(job.end_time)} />}
              </Section>

              {/* Inspection notes */}
              {job.inspection_notes && (
                <Section title="Inspection Notes">
                  <p className="text-sm text-gray-800 py-2">{job.inspection_notes}</p>
                </Section>
              )}

              {/* Mechanic notes */}
              {job.mechanic_notes && (
                <Section title="Mechanic Notes">
                  <p className="text-sm text-gray-800 py-2">{job.mechanic_notes}</p>
                </Section>
              )}

              {/* Services */}
              {job.services?.length > 0 && (
                <Section title="Services">
                  {job.services.map((svc, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: svc.is_done ? '#2d6a4f' : '#aaa' }} />
                        <span className="text-sm text-gray-800">{svc.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{fmt(svc.labour_charge)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Parts used */}
              {job.parts_used?.length > 0 && (
                <Section title="Parts Used">
                  {job.parts_used.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-800">{p.name} × {p.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900">{fmt(p.total_price)}</span>
                    </div>
                  ))}
                </Section>
              )}

              {/* Invoice */}
              {invoice && (
                <Section title="Invoice">
                  <Row label="Subtotal"           value={fmt(invoice.subtotal)} />
                  <Row label={`GST (${invoice.gst_rate ?? 18}%)`} value={fmt(invoice.gst_amount)} />
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-sm font-extrabold" style={{ color: '#E85D04' }}>{fmt(invoice.total_amount)}</span>
                  </div>
                </Section>
              )}

              {/* Payment */}
              <Section title="Payment">
                {job.payment_mode && <Row label="Mode"        value={job.payment_mode} />}
                <Row label="Paid"         value={fmt(job.amount_paid)} valueStyle={{ color: '#2d6a4f' }} />
                <Row label="Balance Due"  value={fmt(job.balance_due)}
                  valueStyle={{ color: job.balance_due > 0 ? '#c62828' : '#2d6a4f' }} />
                {job.payment_status && (
                  <div className="py-3">
                    <div
                      className="w-full py-2.5 rounded-xl text-center text-sm font-bold"
                      style={{
                        background: PAYMENT_STATUS_BG[job.payment_status],
                        color: PAYMENT_STATUS_COLORS[job.payment_status],
                      }}
                    >
                      {paymentLabel}
                    </div>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'RipoDoc — controlled evidence delivery for MSP client reports';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: '#081126', color: 'white', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '64px 72px', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', position: 'absolute', left: 74, top: 0, height: '100%', width: 1, background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ display: 'flex', position: 'absolute', right: 110, top: 0, height: '100%', width: 1, background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ display: 'flex', position: 'absolute', right: -120, top: -120, width: 440, height: 440, borderRadius: 999, background: 'rgba(37,208,191,0.14)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a8f6ed' }}><span style={{ display: 'flex', width: 11, height: 11, background: '#25d0bf' }} />Controlled evidence delivery</div>
      <div style={{ display: 'flex', marginTop: 42, maxWidth: 900, flexDirection: 'column', fontSize: 76, fontWeight: 800, lineHeight: 0.98, letterSpacing: -4 }}>Make every report claim<br /><span style={{ color: '#25d0bf' }}>able to answer back.</span></div>
      <div style={{ display: 'flex', marginTop: 34, maxWidth: 720, color: '#c8d2e5', fontSize: 27, lineHeight: 1.35 }}>The controlled evidence-delivery layer for MSP client reports.</div>
      <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 26 }}><div style={{ display: 'flex', fontSize: 29, fontWeight: 800, letterSpacing: -1 }}>Ripo<span style={{ color: '#25d0bf' }}>Doc</span></div><div style={{ display: 'flex', gap: 18, color: '#b7c5db', fontSize: 18 }}><span>Approved proof</span><span style={{ color: '#25d0bf' }}>•</span><span>Reader-scoped</span><span style={{ color: '#25d0bf' }}>•</span><span>Auditable</span></div></div>
    </div>,
    size,
  );
}

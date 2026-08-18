import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'RipoDoc — controlled evidence delivery for MSP client reports';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: '#E8442E', color: '#FFF9EF', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '64px 72px', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', position: 'absolute', left: 74, top: 0, height: '100%', width: 1, background: 'rgba(255,249,239,0.38)' }} />
      <div style={{ display: 'flex', position: 'absolute', right: 110, top: 0, height: '100%', width: 1, background: 'rgba(255,249,239,0.25)' }} />
      <div style={{ display: 'flex', position: 'absolute', right: -130, top: -125, width: 460, height: 460, borderRadius: 999, border: '2px solid rgba(255,249,239,0.42)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#FFB2A3' }}><span style={{ display: 'flex', width: 11, height: 11, background: '#141111' }} />Controlled evidence delivery for MSP client reports</div>
      <div style={{ display: 'flex', marginTop: 42, maxWidth: 930, flexDirection: 'column', fontSize: 74, fontWeight: 800, lineHeight: 0.98, letterSpacing: -4, color: '#FFF9EF' }}>When a client asks where a report figure came from,<br /><span style={{ color: '#141111' }}>give them proof—not a data chase.</span></div>
      <div style={{ display: 'flex', marginTop: 32, maxWidth: 760, color: 'rgba(255,249,239,0.88)', fontSize: 26, lineHeight: 1.35 }}>RipoDoc keeps the executive report concise while making an approved claim answerable in context.</div>
      <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,249,239,0.35)', paddingTop: 26 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800, letterSpacing: -1 }}><span style={{ display: 'flex', width: 24, height: 24, background: '#141111', border: '2px solid #FFF9EF' }} /><span>RipoDoc</span></div><div style={{ display: 'flex', gap: 18, color: 'rgba(255,249,239,0.88)', fontSize: 18 }}><span>Approved source</span><span style={{ color: '#141111' }}>•</span><span>Bounded detail</span><span style={{ color: '#141111' }}>•</span><span>Deliberate reader</span></div></div>
    </div>,
    size,
  );
}

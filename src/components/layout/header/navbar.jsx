
import colorPattern from '../../../styles/colorPattern';

const Navbar = () => (
  <nav style={{ background: colorPattern.background, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 'bold', color: colorPattern.primary }}>Exclusive</div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <button style={{ color: colorPattern.text, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }} onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>Home</button>
      <button style={{ color: colorPattern.text, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }} onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>Contact</button>
      <button style={{ color: colorPattern.text, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }} onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>About</button>
      <button style={{ color: colorPattern.text, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }} onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>Sign Up</button>
      <input type="text" placeholder="What are you looking for?" style={{ border: `1px solid ${colorPattern.border}`, padding: 4, borderRadius: 4, color: colorPattern.text, background: colorPattern.inputBg }} />
    </div>
  </nav>
);

export default Navbar;
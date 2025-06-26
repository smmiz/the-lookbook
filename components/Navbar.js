// components/Navbar.js
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        IZACCES
      </Link>
      <div className="navbar-links">
        {/* Los enlaces que querías */}
        <Link href="/about">Sobre Nosotros</Link>
        <Link href="/contact">Contacto</Link>
      </div>
    </nav>
  );
};

export default Navbar;

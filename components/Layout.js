// components/Layout.js
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isHomePage }) => {
  // ARREGLO: Elegimos la clase del contenedor principal
  // dependiendo si estamos en la página de inicio o en otra.
  const containerClass = isHomePage ? 'home-container' : 'main-container';

  return (
    <>
      <Navbar />
      <main className={containerClass}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;

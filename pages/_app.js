// pages/_app.js

import Layout from '@/components/Layout';
import '@/styles/globals.css';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  // Verificamos si la ruta actual es la página de inicio ('/').
  const isHomePage = router.pathname === '/';

  return (
    // Pasamos esa información al componente Layout para que sepa cómo actuar.
    <Layout isHomePage={isHomePage}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;

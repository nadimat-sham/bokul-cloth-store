import { useEffect } from "react";
import { useLocation } from "react-router";
import { Layout } from "./components/Layout.tsx";
import { AppRoutes } from "./routes.tsx";
import { useReveal } from "./lib/useReveal.ts";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function App() {
  useReveal();
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return <AppRoutes />;
  return (
    <Layout>
      <ScrollManager />
      <AppRoutes />
    </Layout>
  );
}

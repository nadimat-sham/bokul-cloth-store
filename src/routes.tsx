import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { HomePage } from "./pages/Home.tsx";
import { ShopPage } from "./pages/Shop.tsx";
import { ProductPage } from "./pages/Product.tsx";
import { CartPage } from "./pages/Cart.tsx";
import { CheckoutPage } from "./pages/Checkout.tsx";
import { OrderPage } from "./pages/Order.tsx";
import { AboutPage } from "./pages/About.tsx";
import { ContactPage } from "./pages/Contact.tsx";
import { FaqPage } from "./pages/Faq.tsx";
import { DeliveryPage } from "./pages/Delivery.tsx";
import { SizeGuidePage } from "./pages/SizeGuide.tsx";
import { TermsPage } from "./pages/Terms.tsx";
import { PrivacyPage } from "./pages/Privacy.tsx";
import { NotFoundPage } from "./pages/NotFound.tsx";
import { AdminShell } from "./pages/admin/AdminShell.tsx";
import { CATEGORIES_KEY, FEATURED_KEY, ALL_PRODUCTS_KEY, productsKey, productKey, orderKey, shopParams } from "./lib/queries.ts";

// The admin area is split into its own chunk so shoppers never download it.
const AdminApp = lazy(() => import("./pages/admin/AdminApp.tsx"));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:category" element={<ShopPage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order/:orderNumber" element={<OrderPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/delivery-returns" element={<DeliveryPage />} />
      <Route path="/size-guide" element={<SizeGuidePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route
        path="/admin"
        element={
          <AdminShell>
            <Suspense fallback={<p className="admin-loading">Loading admin…</p>}>
              <AdminApp />
            </Suspense>
          </AdminShell>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/** API paths the server must prefetch so a page renders complete HTML. */
export function dataKeys(pathname: string, search: string): string[] {
  const keys = [CATEGORIES_KEY];
  const q = new URLSearchParams(search);
  let m: RegExpExecArray | null;
  if (pathname === "/") keys.push(FEATURED_KEY);
  else if (pathname === "/shop") keys.push(productsKey(shopParams(q)));
  else if ((m = /^\/shop\/([a-z0-9-]+)$/.exec(pathname))) keys.push(productsKey(shopParams(q, m[1])));
  else if ((m = /^\/product\/([a-z0-9-]+)$/.exec(pathname))) keys.push(productKey(m[1]));
  else if (pathname === "/cart" || pathname === "/checkout") keys.push(ALL_PRODUCTS_KEY);
  else if ((m = /^\/order\/([A-Za-z0-9-]+)$/.exec(pathname)) && q.get("token")) keys.push(orderKey(m[1], q.get("token")!));
  return keys;
}

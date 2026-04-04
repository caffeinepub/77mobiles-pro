import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import AppShell from "./components/AppShell";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import CreateListing from "./pages/CreateListing";
import DiagnosticTest from "./pages/DiagnosticTest";
import ListingDetail from "./pages/ListingDetail";
import MarketDemandPage from "./pages/MarketDemandPage";
import MarketTrendsPage from "./pages/MarketTrendsPage";
import PaymentCheckout from "./pages/PaymentCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PendingVerificationPage from "./pages/PendingVerificationPage";
import SellCategoryScreen from "./pages/SellCategoryScreen";
import SellChoiceScreen from "./pages/SellChoiceScreen";
import SendOfferScreen from "./pages/SendOfferScreen";
import USBDiagnostic from "./pages/USBDiagnostic";
import { isPhoneApproved } from "./utils/portalSettings";

/** Check all approval signals — mirrors the logic in PendingVerificationPage */
function resolveUserPhone(): string {
  try {
    const session = JSON.parse(
      localStorage.getItem("77m_phone_session") || "null",
    );
    if (session?.phone)
      return String(session.phone).replace(/^\+91/, "").replace(/^0+/, "");
    const subs: { phone?: string; status?: string }[] = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    );
    const pending = subs.find((k) => k.status === "pending");
    if (pending?.phone)
      return String(pending.phone).replace(/^\+91/, "").replace(/^0+/, "");
  } catch {}
  return "";
}

function isUserVerified(): boolean {
  // Direct verified flag
  if (localStorage.getItem("77m_is_verified") === "true") return true;

  // Per-phone approval
  const phone = resolveUserPhone();
  if (phone && isPhoneApproved(phone)) {
    // Sync the flag so subsequent checks are instant
    localStorage.setItem("77m_is_verified", "true");
    localStorage.setItem("77m_verification_status", "verified");
    return true;
  }

  // KYC submission status
  try {
    const subs: { phone?: string; status?: string }[] = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    );
    const myPhone = phone;
    const myEntry = myPhone
      ? subs.find(
          (k) => k.phone?.replace(/^\+91/, "").replace(/^0+/, "") === myPhone,
        )
      : null;
    if (
      myEntry?.status === "Approved" ||
      myEntry?.status === "approved" ||
      myEntry?.status === "verified"
    ) {
      localStorage.setItem("77m_is_verified", "true");
      localStorage.setItem("77m_verification_status", "verified");
      return true;
    }
  } catch {}

  return false;
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppProvider>
        <div style={{ background: "#F8FAFC", minHeight: "100dvh" }}>
          <Outlet />
        </div>
      </AppProvider>
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AuthPage,
});

const pendingVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pending-verification",
  // If the user is already verified, skip this screen and go straight to /app
  beforeLoad: () => {
    if (isUserVerified()) {
      throw redirect({ to: "/app" });
    }
  },
  component: PendingVerificationPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  beforeLoad: () => {
    const status = localStorage.getItem("77m_verification_status");
    // Only block if explicitly in pending state AND not verified through any channel
    if (status === "pending" && !isUserVerified()) {
      throw redirect({ to: "/pending-verification" });
    }
  },
  component: AppShell,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const sellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller",
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});

const buyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buyer",
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});

const listingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ListingDetail,
});

const sellChoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell-choice",
  component: SellChoiceScreen,
});

const sellCategoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell-category",
  component: SellCategoryScreen,
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: CreateListing,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) ?? "manual",
    scrap: (search.scrap as string) ?? "false",
    prefillBrand: (search.prefillBrand as string) ?? "",
    prefillModel: (search.prefillModel as string) ?? "",
    category: (search.category as string) ?? "",
  }),
});

const usbDiagnosticRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/usb-diagnostic",
  component: USBDiagnostic,
});

const doctorTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/doctor-test",
  component: DiagnosticTest,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: PaymentCheckout,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const sendOfferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/send-offer",
  component: SendOfferScreen,
});

const marketDemandRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/market-demand",
  component: MarketDemandPage,
});

const marketTrendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/market-trends",
  component: MarketTrendsPage,
});

const myAdsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-ads",
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chats",
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pendingVerificationRoute,
  appRoute,
  adminRoute,
  sellerRoute,
  buyerRoute,
  listingRoute,
  sellChoiceRoute,
  sellCategoryRoute,
  sellRoute,
  usbDiagnosticRoute,
  doctorTestRoute,
  checkoutRoute,
  paymentSuccessRoute,
  sendOfferRoute,
  marketTrendsRoute,
  marketDemandRoute,
  myAdsRoute,
  accountRoute,
  chatsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

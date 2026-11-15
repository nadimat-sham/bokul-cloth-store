// Frequently asked questions. Answers are built from the policy constants in
// shared/store.ts so they never drift from checkout, emails or other pages.
import { EXCHANGE_DAYS, FREE_SHIPPING_FROM, SHIPPING, STORE, formatMoney } from "../../shared/store.ts";

export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

const inside = SHIPPING.inside_dhaka;
const outside = SHIPPING.outside_dhaka;

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "ordering",
    title: "Ordering & payment",
    items: [
      {
        q: "How do I place an order at Bokul Cloth Store?",
        a: "Open any product, choose your size and quantity, then tap “Add to bag”. When you are ready, open your bag, press “Checkout”, enter your name, mobile number, email and delivery address, and confirm. You will see your order number straight away and receive a confirmation email.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We currently accept cash on delivery only. You pay the courier in cash when your parcel arrives — there is nothing to pay online and we never ask for card or mobile-banking details on this website.",
      },
      {
        q: "Will someone confirm my order?",
        a: "Yes. After you order, our team calls the mobile number you entered to confirm your items, size and address before the parcel is dispatched. Please keep your phone nearby.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Yes, as long as it has not been dispatched. Reply to your order confirmation email or use the contact page with your order number and we will update or cancel it for you.",
      },
      {
        q: "How can I check my order status?",
        a: "Your confirmation email contains a private link to your order page, which shows its current status — received, confirmed, shipped or delivered. We also email you whenever the status changes.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        q: "Do you deliver all over Bangladesh?",
        a: `Yes. We deliver to every district in ${STORE.country}. Delivery inside Dhaka city costs ${formatMoney(inside.fee)} and usually takes ${inside.days}; delivery outside Dhaka costs ${formatMoney(outside.fee)} and usually takes ${outside.days} after your order is confirmed.`,
      },
      {
        q: "Is delivery ever free?",
        a: `Yes — delivery is free on every order of ${formatMoney(FREE_SHIPPING_FROM)} or more, anywhere in ${STORE.country}.`,
      },
    ],
  },
  {
    id: "returns",
    title: "Returns, exchanges & sizing",
    items: [
      {
        q: "Can I return or exchange an item?",
        a: `Yes. Unworn, unwashed items with their tags attached can be returned or exchanged within ${EXCHANGE_DAYS} days of delivery. If the item is faulty or we sent the wrong one, we cover the delivery both ways; otherwise the return delivery charge is yours. See the Delivery & returns page for the full policy.`,
      },
      {
        q: "How do I find my size?",
        a: "Every product lists its available sizes. Our size guide gives body measurements in inches for women's, men's and kids' clothing — measure a garment that fits you well and compare. If you are between sizes, choose the larger one or message us for advice.",
      },
      {
        q: "Will the colour look exactly like the picture?",
        a: "We work to show each design accurately, but screens display colour differently and hand block prints and handloom weaves vary slightly from piece to piece — that variation is part of their character.",
      },
    ],
  },
  {
    id: "contact",
    title: "About the store",
    items: [
      {
        q: "What does Bokul Cloth Store sell?",
        a: "We sell everyday and festive clothing for the whole family: cotton and georgette sarees, three-pieces, kurtis and tunics for women; panjabis, shirts, polos and chinos for men; frocks, panjabi sets and tees for kids; plus ornas and gamchas.",
      },
      {
        q: "How can I contact Bokul Cloth Store?",
        a: "Use the form on our contact page or email us — we reply within one working day. For an existing order, please include your order number so we can help faster.",
      },
    ],
  },
];

export const ALL_FAQS: FaqItem[] = FAQ_GROUPS.flatMap((g) => g.items);
export const HOME_FAQS: FaqItem[] = [ALL_FAQS[1], ALL_FAQS[5], ALL_FAQS[7], ALL_FAQS[8], ALL_FAQS[2], ALL_FAQS[11]];

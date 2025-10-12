// Types aligned with the latest OpenAPI spec provided by backend,
// with additional optional fields preserved to keep current UI working.

export type ListResponse<T> = T[];

/* Schemas */

// Banner (unchanged)
export type Banner = {
  id: number;
  title: string;
  text: string;
  banner: string; // uri
  image: string; // uri
  url: string | null;
};

// Category
export type Category = {
  id: number;
  categoryName: string;
  categoryPhoto: string; // readOnly uri
  categoryPhotoSmall: string; // readOnly uri
  sections: number[];
};

// Product (spec lists a minimal set; UI relies on extra fields - keep them optional)
export type Product = {
  id: number; // readOnly
  productName: string;
  weight: number;
  productPhoto: string; // readOnly

  // Non-spec but used by UI or may appear in payloads
  productPrice?: string | number;
  productPhotoSmall?: string;
  productPhotoLarge?: string;
  productDescription?: string | null;
  modificators?: Array<{
    id: number;
    name?: string;
    price?: number | string;
  }>;
  category?: {
    id: number;
    categoryName: string;
  };
};

// OrderProduct (readOnly in OrderList)
export type OrderProduct = {
  product: Product; // readOnly in OrderList
  count: number;
  price: string; // decimal as string
  modificator: number | null;
};

// OrderList (response)
export type OrderList = {
  id: number;
  totalPrice: string; // decimal as string
  status: 0 | 1 | 2 | 3 | 4 | 7;
  createdAt: string; // date-time
  serviceMode: 1 | 2 | 3;
  address: string | null;
  comment: string | null;
  phone: string;
  orderProducts: OrderProduct[]; // readOnly
  tableNum: string;
  statusText: string;
};

// OrderProductCreate (request item)
export type OrderProductCreate = {
  product: number;
  count: number;
  modificator?: number | null;
};

// OrderCreate (request/response union type)
// Backend marks some fields as writeOnly/readOnly; we keep as optional to fit both directions.
export type OrderCreate = {
  // readOnly in responses
  id?: number;
  paymentUrl?: string;
  phoneVerificationHash?: string;

  // writeOnly/request fields
  phone?: string;
  comment?: string | null;
  serviceMode?: 1 | 2 | 3;
  address?: string | null;
  servicePrice?: string; // decimal as string
  tipsPrice?: number;
  bonus?: number;
  spot?: number | null;
  table?: number | null;
  isTgBot?: boolean;
  tgRedirectUrl?: string | null;
  orderProducts?: OrderProductCreate[];
  code?: string | null;
  hash?: string | null;
  useBonus?: boolean;
};

// Client (simplified to relevant fields from spec)
export type Client = {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  patronymic?: string | null;
  email?: string | null;
};

// PatchedClient (partial update shape)
export type PatchedClient = Partial<Client> & {
  id?: number; // still present as readOnly in responses
};

// PosterWebhook (request)
export type PosterWebhook = {
  account: string;
  accountNumber: string;
  object: string;
  objectId: number;
  action: string;
  time: number;
  verify: string;
  data?: string;
};

// Spot (spec has wifiText and wifiUrl as nullable)
export type Spot = {
  id: number;
  name: string;
  address: string | null;
  wifiText?: string | null;
  wifiUrl?: string | null;
};

// WorkSchedule
export type WorkSchedule = {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dayName: string; // readOnly
  workStart: string; // time
  workEnd: string; // time
  isDayOff: boolean;
  is24h: boolean;
};

// Venue (kept with fields used by UI; aligns with spec enums and properties)
export type Venue = {
  colorTheme:
    | "#008B68"
    | "#FFB200"
    | "#F80101"
    | "#FF4800"
    | "#00BBFF"
    | "#0717FF"
    | "#AF00A3"
    | "#000000"
    | "#00BFB2"
    | ""; // enum
  companyName: string;
  slug: string;
  logo: string | null; // uri
  schedules: WorkSchedule[];
  deliveryServiceFeePercent: number;
  takeoutServiceFeePercent: number;
  dineinServiceFeePercent: number;
  defaultDeliverySpot: number | null;
  spots: Spot[];
  isDeliveryAvailable: boolean;
  isTakeoutAvailable: boolean;
  isDineinAvailable: boolean;
  deliveryFixedFee: string; // decimal
  deliveryFreeFrom: string | null; // decimal or null
  terms: string | null;
  description: string | null;

  // Non-spec fields sometimes present in older payloads; kept optional for compatibility
  // serviceFeePercent?: number;
};

/* Main Buttons (typed by provided sample shape) */
export type MainButtonCategory = {
  id: number;
  categoryName: string;
  slug: string;
  categoryPhoto: string | null;
  categoryPhotoSmall: string | null;
  sections: number[]; // section ids
};

export type MainButtonSectionRef = {
  id: number;
};

export type MainButton = {
  id: number;
  buttonType: 'section' | 'category' | string;
  section: MainButtonSectionRef | null;
  category: MainButtonCategory | null;
  order: number;
  name: string | null;
  photo: string | null;
  categories: MainButtonCategory[] | null;
};

// Two rows: first with 2 items, second with 3 (per description), but type stays generic
export type MainButtonsResponse = [MainButton[], MainButton[]];

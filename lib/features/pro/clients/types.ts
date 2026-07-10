export type ProClientType = "individual" | "company";

export type ProClient = {
  id: string;
  user_id: string;
  name: string;
  type: ProClientType;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProClientFormInput = {
  name: string;
  type: ProClientType;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  notes: string;
};

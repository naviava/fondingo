import {
  DollarSign,
  Euro,
  IndianRupee,
  JapaneseYen,
  PoundSterling,
  SwissFranc,
} from "lucide-react";

export const currencyIconMap = {
  USD: {
    name: "US Dollar",
    icon: DollarSign,
    code: "USD",
  },
  INR: {
    name: "Indian Rupee",
    icon: IndianRupee,
    code: "INR",
  },
  GBP: {
    name: "British Pound",
    icon: PoundSterling,
    code: "GBP",
  },
  EUR: {
    name: "Euro",
    icon: Euro,
    code: "EUR",
  },
  JPY: {
    name: "Japanese Yen",
    icon: JapaneseYen,
    code: "JPY",
  },
  CHF: {
    name: "Swiss Franc",
    icon: SwissFranc,
    code: "CHF",
  },
} as const;

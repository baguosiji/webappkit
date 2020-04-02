import { Dictionary } from "lodash";

export interface FieldState {
  name?: string;
  active?: boolean; // focusing
  changed?: boolean; // value updates
  touched?: boolean; // blured
  visited?: boolean; // focused
  error?: string;
  validate?: (v: any) => string | undefined;
}

export interface FormState<TFormValues = any> {
  id: string;
  fields: Dictionary<FieldState>;
  initials: TFormValues;
  values: TFormValues;
  submitting?: boolean;
}

export type FormErrors = Dictionary<string>;

export type Validate = (value: any) => string | undefined;

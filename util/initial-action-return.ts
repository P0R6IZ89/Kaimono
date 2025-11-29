export type ActionResult = {
  ok: boolean;
  message?: string;
};

export const initialState: ActionResult = { ok: false, message: "" };

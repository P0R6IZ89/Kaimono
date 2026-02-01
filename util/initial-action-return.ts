export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | {
      ok: false;
      message: string;
      errorKey?: string;
      errorParams?: Record<string, unknown>;
      code?: string;
    };

export const initialState: ActionResult = { ok: true };

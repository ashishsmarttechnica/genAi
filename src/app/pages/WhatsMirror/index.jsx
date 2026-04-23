/**
 * @file WhatsMirror.jsx
 * @description WhatsMirror Dual Chat Access – public page to delete an account
 *              by phone number. No authentication required.
 *              On submit, calls DELETE /api/account with the full phone number (+91XXXXXXXXXX).
 *
 * Input UX:
 *  - "+91" is a fixed, non-editable prefix shown inside the input wrapper.
 *  - User types only the 10-digit mobile number.
 *  - Copy-paste is supported; non-digit chars are stripped automatically.
 *  - Final value sent to API: "+91" + 10 digits = 13 chars total.
 */

// Import Dependencies
import { useState } from "react";
import { PhoneIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { clsx } from "clsx";

// Local Imports
import { Button, Card } from "components/ui";
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------

/** Base API URL – adjust via env (stripped trailing slash to prevent double slash) */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/** Fixed country code prefix (non-editable) */
const COUNTRY_CODE = "+91";

/**
 * Validates the 10-digit subscriber number (no country code – that is fixed).
 * Returns an error string or null if valid.
 * @param {string} digits - raw 10-digit string entered by the user
 * @returns {string|null}
 */
function validateDigits(digits) {
  if (!digits || digits.trim() === "") return "Phone number is required.";
  if (!/^\d+$/.test(digits))            return "Only digits (0–9) are allowed.";
  if (digits.length < 10)               return `Enter ${10 - digits.length} more digit${10 - digits.length > 1 ? "s" : ""}.`;
  if (digits.length > 10)               return "Phone number must be exactly 10 digits.";
  return null;
}

// ----------------------------------------------------------------------

export default function WhatsMirror() {
  // Stores only the 10-digit subscriber number (country code is fixed as +91)
  const [digits, setDigits]             = useState("");
  const [error, setError]               = useState(null);
  const [touched, setTouched]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [deleted, setDeleted]           = useState(false);
  const [deletedPhone, setDeletedPhone] = useState("");

  // Full E.164 number assembled for API calls
  const fullPhone = `${COUNTRY_CODE}${digits}`;

  // ----------------------------------------------------------------------
  // Helpers

  /**
   * Extracts only digits from a raw string and clamps to 10 chars.
   * Used by both handleChange and handlePaste.
   */
  const extractDigits = (raw) => raw.replace(/\D/g, "").slice(0, 10);

  // ----------------------------------------------------------------------
  // Event Handlers

  /** Handles keyboard input – only digits allowed */
  const handleChange = (e) => {
    const sanitized = extractDigits(e.target.value);
    setDigits(sanitized);
    if (touched) setError(validateDigits(sanitized));
  };

  /**
   * Handles paste events.
   * Strips non-digit chars (and any leading country code like 91 / +91)
   * from the pasted text and places the first 10 digits into the field.
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text") || "";

    // Remove leading country code variations: +91, 91, 0091
    const stripped = pasted
      .replace(/^\+91/, "")   // +91XXXXXXXXXX
      .replace(/^0091/, "")   // 0091XXXXXXXXXX
      .replace(/^91(?=\d{10}$)/, ""); // 91XXXXXXXXXX (only if exactly 12 digits)

    const sanitized = extractDigits(stripped);
    setDigits(sanitized);
    setTouched(true);
    setError(validateDigits(sanitized));
  };

  /** Blocks non-digit key input at keyboard level (second layer defense) */
  const handleKeyDown = (e) => {
    const navigationKeys = [
      "Backspace", "Delete", "Tab", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End",
    ];
    if (navigationKeys.includes(e.key)) return;
    // Allow Ctrl/Cmd shortcuts (copy, paste, select all, etc.)
    if (e.ctrlKey || e.metaKey) return;
    // Allow digits only
    if (/^\d$/.test(e.key)) return;
    // Block everything else
    e.preventDefault();
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateDigits(digits));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const validationError = validateDigits(digits);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/thirdParty/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY
         },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      const data = await response.json();

      if (data?.success) {
        setDeleted(true);
        setDeletedPhone(data.phoneNumber || fullPhone);
        setDigits("");
        setTouched(false);
        toast.success(data.message || "Account deleted successfully.", {
          duration: 6000,
        });
      } else {
        toast.error(data?.message || "Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("[WhatsMirror] API error:", err);
      toast.error("Network error. Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDeleted(false);
    setDeletedPhone("");
    setDigits("");
    setError(null);
    setTouched(false);
  };

  const isValid = !validateDigits(digits);

  // ----------------------------------------------------------------------

  return (
    <Page title="WhatsMirror – Dual Chat Access">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
        <div className="w-full max-w-114 p-4 sm:px-5">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-4" />

            <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-dark-50">
              WhatsMirror
            </h1>
            <p className="mt-1 text-base font-medium text-green-600 dark:text-green-400">
              Dual Chat Access
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-dark-300">
              Enter a registered phone number to permanently remove the associated account.
            </p>
          </div>

          {/* ── Card ────────────────────────────────────────────────── */}
          <Card className="rounded-2xl p-6 shadow-xl shadow-gray-200/60 dark:shadow-black/30 lg:p-8">

            {deleted ? (
              /* ── Success State ─────────────────────────────────── */
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon className="size-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                    Account Deleted
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    The account linked to
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                    {deletedPhone}
                  </span>
                  <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                    has been permanently removed.
                  </p>
                </div>
                <Button
                  type="button"
                  color="primary"
                  className="mt-2 w-full"
                  onClick={handleReset}
                >
                  Delete Another Account
                </Button>
              </div>
            ) : (
              /* ── Form State ────────────────────────────────────── */
              <form onSubmit={handleSubmit} noValidate>

                {/* Phone number field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="wm-phone-input"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-100"
                  >
                    Phone Number
                    <span className="ml-1 text-error">*</span>
                  </label>

                  {/* Input wrapper: fixed +91 prefix + 10-digit input */}
                  <div
                    className={clsx(
                      "flex overflow-hidden rounded-lg border transition-all duration-200",
                      error
                        ? "border-error dark:border-error-lighter ring-1 ring-error/30"
                        : isValid && touched
                        ? "border-green-400 dark:border-green-600 ring-1 ring-green-400/30"
                        : "border-gray-300 dark:border-dark-450 focus-within:border-black/20 dark:focus-within:border-white/20 hover:border-gray-400 dark:hover:border-dark-400",
                      loading && "opacity-60",
                    )}
                  >
                    {/* Fixed +91 prefix badge */}
                    <span
                      className={clsx(
                        "flex shrink-0 items-center gap-1.5 border-r px-3 text-sm font-semibold select-none",
                        "bg-gray-50 dark:bg-dark-700",
                        error
                          ? "border-error text-error dark:border-error-lighter dark:text-error-light"
                          : isValid && touched
                          ? "border-green-400 text-green-600 dark:border-green-600 dark:text-green-400"
                          : "border-gray-300 text-gray-500 dark:border-dark-450 dark:text-dark-300",
                      )}
                    >
                      <PhoneIcon className="size-4 shrink-0" strokeWidth={1.5} />
                      +91
                    </span>

                    {/* 10-digit input */}
                    <input
                      id="wm-phone-input"
                      type="tel"
                      name="phoneNumber"
                      autoComplete="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={digits}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      onBlur={handleBlur}
                      disabled={loading}
                      className={clsx(
                        "form-input-base min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none ring-0",
                        "placeholder:text-gray-300 dark:placeholder:text-dark-500",
                        loading && "cursor-not-allowed",
                      )}
                      aria-describedby={error ? "wm-phone-error" : "wm-phone-hint"}
                      aria-invalid={!!error}
                    />

                    {/* Right status icon */}
                    {touched && digits.length > 0 && (
                      <span className="flex shrink-0 items-center pr-3">
                        {error ? (
                          <XCircleIcon className="size-5 text-error dark:text-error-light" />
                        ) : (
                          <CheckCircleIcon className="size-5 text-green-500" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Character counter */}
                  <p className="text-right text-xs text-gray-400 dark:text-dark-400">
                    {digits.length} / 10
                  </p>

                  {/* Error message */}
                  {error && touched && (
                    <p
                      id="wm-phone-error"
                      role="alert"
                      className="flex items-start gap-1.5 text-xs text-error dark:text-error-light"
                    >
                      <XCircleIcon className="mt-0.5 size-3.5 shrink-0" />
                      {error}
                    </p>
                  )}

                  {/* Hint */}
                  {!error && (
                    <p id="wm-phone-hint" className="text-xs text-gray-400 dark:text-dark-300">
                      Enter 10-digit mobile number &nbsp;·&nbsp;&nbsp;
                      <code className="rounded bg-gray-100 px-1 dark:bg-dark-600">
                        +91{digits || "XXXXXXXXXX"}
                      </code>
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-gray-100 dark:bg-dark-600" />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  color="error"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting Account…
                    </>
                  ) : (
                    <>
                      <TrashIcon className="size-4" strokeWidth={2} />
                      Delete Account
                    </>
                  )}
                </Button>

                {/* Footer note */}
                <p className="mt-4 text-center text-xs text-gray-400 dark:text-dark-400">
                  By proceeding, you confirm the permanent deletion of this account.
                </p>
              </form>
            )}
          </Card>
        </div>
      </main>
    </Page>
  );
}

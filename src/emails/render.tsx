import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import VerifyEmail from "./verify-email";
import OTPEmail from "./otp";
import ResetPasswordEmail from "./password-reset";

export function renderVerifyEmail(verificationUrl: string): string {
  return renderToStaticMarkup(
    <VerifyEmail verificationUrl={verificationUrl} />,
  );
}

export function renderOtpEmail(otp: string): string {
  return renderToStaticMarkup(<OTPEmail otp={otp} />);
}

export function renderResetPasswordEmail(resetUrl: string): string {
  return renderToStaticMarkup(<ResetPasswordEmail resetUrl={resetUrl} />);
}

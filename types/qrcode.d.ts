declare module "qrcode" {
  type ToDataUrlOptions = {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    width?: number;
  };

  export function toDataURL(
    text: string,
    options?: ToDataUrlOptions,
  ): Promise<string>;
}

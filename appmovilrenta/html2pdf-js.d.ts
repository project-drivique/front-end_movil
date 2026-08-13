declare module "html2pdf.js" {
  interface Html2PdfWorker {
    set(options: Record<string, unknown>): Html2PdfWorker;
    from(source: string | HTMLElement): Html2PdfWorker;
    outputPdf(type: "datauristring"): Promise<string>;
  }

  export default function html2pdf(): Html2PdfWorker;
}

"""FinFlow — PDF Service (stub for dev)."""
import logging
logger = logging.getLogger(__name__)

class PDFService:
    async def generate_invoice_pdf(self, invoice_data: dict) -> bytes:
        """Generate invoice PDF. Returns empty bytes in dev stub."""
        logger.info(f"[PDF STUB] Generating invoice PDF for {invoice_data.get('invoice_number', 'unknown')}")
        return b""

    async def generate_report_pdf(self, report_data: dict) -> bytes:
        logger.info("[PDF STUB] Generating report PDF")
        return b""

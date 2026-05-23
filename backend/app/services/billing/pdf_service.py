"""FinFlow — PDF Invoice Generator using ReportLab."""
import logging
from io import BytesIO
from datetime import date

logger = logging.getLogger("finflow.pdf")


class PDFService:
    async def generate(self, invoice) -> bytes:
        """Generate a professional GST invoice PDF."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.lib.units import mm
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buf = BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=15*mm, bottomMargin=15*mm,
                                    leftMargin=15*mm, rightMargin=15*mm)
            styles = getSampleStyleSheet()
            story = []

            # Header
            title_style = ParagraphStyle("title", fontSize=20, fontName="Helvetica-Bold",
                                         textColor=colors.HexColor("#1a56db"))
            story.append(Paragraph("TAX INVOICE", title_style))
            story.append(Spacer(1, 5*mm))

            # Invoice meta table
            meta = [
                ["Invoice No:", invoice.invoice_number, "Date:", str(invoice.invoice_date)],
                ["Due Date:", str(invoice.due_date or ""), "Status:", str(invoice.status).upper()],
            ]
            meta_table = Table(meta, colWidths=[35*mm, 65*mm, 25*mm, 50*mm])
            meta_table.setStyle(TableStyle([
                ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
                ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
                ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
                ("FONTSIZE", (0,0), (-1,-1), 9),
                ("TEXTCOLOR", (0,0), (0,-1), colors.HexColor("#374151")),
                ("TEXTCOLOR", (2,0), (2,-1), colors.HexColor("#374151")),
            ]))
            story.append(meta_table)
            story.append(Spacer(1, 5*mm))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
            story.append(Spacer(1, 3*mm))

            # Bill to
            bill_style = ParagraphStyle("bill", fontSize=9, fontName="Helvetica")
            bold_style = ParagraphStyle("bold", fontSize=9, fontName="Helvetica-Bold")
            story.append(Paragraph("Bill To:", bold_style))
            story.append(Paragraph(getattr(invoice, "customer_name", "") or "Customer", bill_style))
            story.append(Spacer(1, 5*mm))

            # Line items table
            headers = ["#", "Description", "HSN/SAC", "Qty", "Rate (₹)", "GST%", "Amount (₹)"]
            rows = [headers]
            items = getattr(invoice, "line_items", [])
            for i, item in enumerate(items, 1):
                rows.append([
                    str(i),
                    str(item.description),
                    str(item.hsn_sac_code or ""),
                    str(item.quantity),
                    f"{float(item.rate):,.2f}",
                    f"{float(item.gst_rate)}%",
                    f"{float(item.total_amount):,.2f}",
                ])

            col_w = [10*mm, 65*mm, 20*mm, 15*mm, 25*mm, 15*mm, 25*mm]
            tbl = Table(rows, colWidths=col_w, repeatRows=1)
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1a56db")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE", (0,0), (-1,-1), 8),
                ("ALIGN", (3,1), (-1,-1), "RIGHT"),
                ("ALIGN", (0,0), (-1,0), "CENTER"),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f9fafb")]),
                ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
                ("TOPPADDING", (0,0), (-1,-1), 4),
                ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 5*mm))

            # Totals
            totals_data = [
                ["Subtotal", f"₹{float(invoice.subtotal):,.2f}"],
                ["Discount", f"- ₹{float(invoice.discount_amount):,.2f}"],
                ["Taxable Amount", f"₹{float(invoice.taxable_amount):,.2f}"],
            ]
            if float(invoice.igst_amount or 0) > 0:
                totals_data.append(["IGST", f"₹{float(invoice.igst_amount):,.2f}"])
            else:
                totals_data.append(["CGST", f"₹{float(invoice.cgst_amount or 0):,.2f}"])
                totals_data.append(["SGST", f"₹{float(invoice.sgst_amount or 0):,.2f}"])
            totals_data.append(["Total Amount", f"₹{float(invoice.total_amount):,.2f}"])
            totals_data.append(["Paid", f"₹{float(invoice.paid_amount or 0):,.2f}"])
            totals_data.append(["Balance Due", f"₹{float(invoice.balance_due or 0):,.2f}"])

            tot_tbl = Table(totals_data, colWidths=[120*mm, 55*mm])
            tot_tbl.setStyle(TableStyle([
                ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
                ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),
                ("FONTSIZE", (0,0), (-1,-1), 9),
                ("ALIGN", (1,0), (1,-1), "RIGHT"),
                ("LINEABOVE", (0,-3), (-1,-3), 1, colors.HexColor("#e5e7eb")),
                ("LINEABOVE", (0,-1), (-1,-1), 1.5, colors.HexColor("#1a56db")),
                ("TEXTCOLOR", (0,-1), (-1,-1), colors.HexColor("#1a56db")),
                ("TOPPADDING", (0,0), (-1,-1), 3),
            ]))
            story.append(tot_tbl)

            if invoice.notes:
                story.append(Spacer(1, 5*mm))
                story.append(Paragraph("Notes:", bold_style))
                story.append(Paragraph(invoice.notes, bill_style))

            story.append(Spacer(1, 10*mm))
            story.append(Paragraph("Thank you for your business!", bill_style))

            doc.build(story)
            return buf.getvalue()

        except ImportError:
            logger.warning("ReportLab not installed — returning empty PDF bytes")
            return b""
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            return b""

    async def generate_invoice_pdf(self, invoice_data: dict) -> bytes:
        """Legacy stub signature — returns empty bytes."""
        return b""

    async def generate_report_pdf(self, report_data: dict) -> bytes:
        return b""

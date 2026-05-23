"""
FinFlow — GST Calculation Engine
India-first tax engine with CGST/SGST/IGST/CESS support.
Designed to be extended for international tax systems.
"""
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass
from typing import List, Optional


# ── GST Slab Rates (India 2024) ──────────────────────────────
GST_SLABS = {0, 5, 12, 18, 28}

# Common HSN codes with GST rates (partial list)
HSN_GST_MAP = {
    # Food & Agriculture
    "0101": 0, "0201": 0, "0401": 5, "0901": 5,
    # Textiles
    "5201": 5, "6101": 5, "6201": 12,
    # Electronics
    "8471": 18, "8517": 18, "8528": 28,
    # Automobiles
    "8703": 28, "8711": 28,
    # Services (SAC)
    "9983": 18, "9984": 18, "9985": 18, "9997": 18,
}

# CESS rates for luxury/sin goods (in addition to 28% GST)
CESS_RATES = {
    "2402": Decimal("5"),    # Cigarettes
    "2207": Decimal("15"),   # Alcohol
    "8703": Decimal("1"),    # Small cars
}


@dataclass
class LineItemTax:
    """Tax breakdown for a single line item."""
    taxable_amount: Decimal
    gst_rate: Decimal
    cgst_rate: Decimal
    sgst_rate: Decimal
    igst_rate: Decimal
    cess_rate: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    cess_amount: Decimal
    total_tax: Decimal
    total_amount: Decimal


@dataclass
class InvoiceTax:
    """Complete tax summary for an invoice."""
    subtotal: Decimal
    discount_amount: Decimal
    taxable_amount: Decimal
    cgst: Decimal
    sgst: Decimal
    igst: Decimal
    cess: Decimal
    total_tax: Decimal
    total_amount: Decimal
    round_off: Decimal
    is_igst: bool
    line_items: List[LineItemTax]


class GSTEngine:
    """
    Core GST calculation engine.

    Rules:
    - Intra-state supply → CGST + SGST (each = GST rate / 2)
    - Inter-state supply → IGST (= full GST rate)
    - Composition scheme → No GST on invoice
    """

    def __init__(
        self,
        business_state: str,
        customer_state: Optional[str] = None,
        is_composition: bool = False,
        is_export: bool = False,
    ):
        self.business_state = business_state
        self.customer_state = customer_state
        self.is_composition = is_composition
        self.is_export = is_export

        # Determine supply type
        self.is_igst = (
            customer_state is not None
            and customer_state != business_state
        ) or is_export

    def calculate_line_item(
        self,
        rate: Decimal,
        quantity: Decimal,
        gst_rate: Decimal,
        discount_percent: Decimal = Decimal("0"),
        discount_amount: Decimal = Decimal("0"),
        hsn_sac: Optional[str] = None,
        tax_inclusive: bool = False,
    ) -> LineItemTax:
        """Calculate tax for a single invoice line item."""

        # Get CESS rate from HSN if not provided
        cess_rate = Decimal("0")
        if hsn_sac:
            hsn_prefix = hsn_sac[:4]
            cess_rate = CESS_RATES.get(hsn_prefix, Decimal("0"))

        # Gross amount
        gross = (rate * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Apply discount
        if discount_percent > 0:
            discount_amount = (gross * discount_percent / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        amount_after_discount = gross - discount_amount

        # Handle tax-inclusive pricing
        if tax_inclusive and gst_rate > 0:
            total_rate = 100 + gst_rate
            taxable_amount = (amount_after_discount * 100 / total_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            taxable_amount = amount_after_discount

        # Skip if composition scheme
        if self.is_composition:
            return LineItemTax(
                taxable_amount=taxable_amount,
                gst_rate=Decimal("0"),
                cgst_rate=Decimal("0"),
                sgst_rate=Decimal("0"),
                igst_rate=Decimal("0"),
                cess_rate=Decimal("0"),
                cgst_amount=Decimal("0"),
                sgst_amount=Decimal("0"),
                igst_amount=Decimal("0"),
                cess_amount=Decimal("0"),
                total_tax=Decimal("0"),
                total_amount=taxable_amount,
            )

        # Calculate tax
        if self.is_igst:
            igst_rate = gst_rate
            cgst_rate = Decimal("0")
            sgst_rate = Decimal("0")
            igst_amount = (taxable_amount * igst_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            cgst_amount = Decimal("0")
            sgst_amount = Decimal("0")
        else:
            igst_rate = Decimal("0")
            cgst_rate = (gst_rate / 2).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            sgst_rate = cgst_rate
            cgst_amount = (taxable_amount * cgst_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            sgst_amount = cgst_amount
            igst_amount = Decimal("0")

        cess_amount = (taxable_amount * cess_rate / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_tax = cgst_amount + sgst_amount + igst_amount + cess_amount
        total_amount = taxable_amount + total_tax

        return LineItemTax(
            taxable_amount=taxable_amount,
            gst_rate=gst_rate,
            cgst_rate=cgst_rate,
            sgst_rate=sgst_rate,
            igst_rate=igst_rate,
            cess_rate=cess_rate,
            cgst_amount=cgst_amount,
            sgst_amount=sgst_amount,
            igst_amount=igst_amount,
            cess_amount=cess_amount,
            total_tax=total_tax,
            total_amount=total_amount,
        )

    def calculate_invoice(self, line_items_data: List[dict]) -> InvoiceTax:
        """Calculate complete tax for an invoice."""
        calculated_items = []

        totals = {
            "subtotal": Decimal("0"),
            "discount": Decimal("0"),
            "taxable": Decimal("0"),
            "cgst": Decimal("0"),
            "sgst": Decimal("0"),
            "igst": Decimal("0"),
            "cess": Decimal("0"),
        }

        for item in line_items_data:
            line = self.calculate_line_item(
                rate=Decimal(str(item["rate"])),
                quantity=Decimal(str(item["quantity"])),
                gst_rate=Decimal(str(item.get("gst_rate", 0))),
                discount_percent=Decimal(str(item.get("discount_percent", 0))),
                discount_amount=Decimal(str(item.get("discount_amount", 0))),
                hsn_sac=item.get("hsn_sac_code"),
                tax_inclusive=item.get("tax_inclusive", False),
            )
            calculated_items.append(line)

            gross = Decimal(str(item["rate"])) * Decimal(str(item["quantity"]))
            totals["subtotal"] += gross.quantize(Decimal("0.01"))
            totals["discount"] += line.taxable_amount - (gross - Decimal("0"))  # simplified
            totals["taxable"] += line.taxable_amount
            totals["cgst"] += line.cgst_amount
            totals["sgst"] += line.sgst_amount
            totals["igst"] += line.igst_amount
            totals["cess"] += line.cess_amount

        total_tax = totals["cgst"] + totals["sgst"] + totals["igst"] + totals["cess"]
        total_before_round = totals["taxable"] + total_tax

        # Round off to nearest rupee
        rounded_total = total_before_round.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        round_off = rounded_total - total_before_round

        return InvoiceTax(
            subtotal=totals["subtotal"],
            discount_amount=totals["discount"],
            taxable_amount=totals["taxable"],
            cgst=totals["cgst"],
            sgst=totals["sgst"],
            igst=totals["igst"],
            cess=totals["cess"],
            total_tax=total_tax,
            total_amount=rounded_total,
            round_off=round_off,
            is_igst=self.is_igst,
            line_items=calculated_items,
        )

    @staticmethod
    def get_gst_rate_from_hsn(hsn_code: str) -> Optional[Decimal]:
        """Look up GST rate from HSN/SAC code."""
        # Check exact match first
        if hsn_code in HSN_GST_MAP:
            return Decimal(str(HSN_GST_MAP[hsn_code]))
        # Try prefix match
        for prefix_len in [6, 4, 2]:
            prefix = hsn_code[:prefix_len]
            if prefix in HSN_GST_MAP:
                return Decimal(str(HSN_GST_MAP[prefix]))
        return None

    @staticmethod
    def validate_gstin(gstin: str) -> bool:
        """
        Validate Indian GSTIN format.
        Format: 2-digit state code + 10-char PAN + 1-digit entity + Z + 1-char checksum
        """
        import re
        pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
        return bool(re.match(pattern, gstin.upper()))

    @staticmethod
    def get_state_from_gstin(gstin: str) -> Optional[str]:
        """Extract state from GSTIN state code."""
        STATE_CODES = {
            "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
            "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
            "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
            "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
            "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
            "16": "Tripura", "17": "Meghalaya", "18": "Assam",
            "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
            "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
            "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
            "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
            "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
            "35": "Andaman & Nicobar", "36": "Telangana", "37": "Andhra Pradesh (New)",
        }
        if len(gstin) >= 2:
            return STATE_CODES.get(gstin[:2])
        return None

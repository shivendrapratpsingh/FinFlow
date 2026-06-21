import { NextResponse } from "next/server";

const MONTHLY = [
  { month:"Apr 2025", output_gst:84200,  input_gst:31400,  net:52800,  filed:true  },
  { month:"May 2025", output_gst:91500,  input_gst:34200,  net:57300,  filed:true  },
  { month:"Jun 2025", output_gst:78900,  input_gst:29100,  net:49800,  filed:true  },
  { month:"Jul 2025", output_gst:102300, input_gst:38700,  net:63600,  filed:true  },
  { month:"Aug 2025", output_gst:96700,  input_gst:36200,  net:60500,  filed:true  },
  { month:"Sep 2025", output_gst:88400,  input_gst:33100,  net:55300,  filed:true  },
  { month:"Oct 2025", output_gst:115600, input_gst:41280,  net:94320,  filed:false },
  { month:"Nov 2025", output_gst:0,      input_gst:0,      net:0,      filed:false },
  { month:"Dec 2025", output_gst:0,      input_gst:0,      net:0,      filed:false },
  { month:"Jan 2026", output_gst:0,      input_gst:0,      net:0,      filed:false },
  { month:"Feb 2026", output_gst:0,      input_gst:0,      net:0,      filed:false },
  { month:"Mar 2026", output_gst:0,      input_gst:0,      net:0,      filed:false },
];

export async function GET() {
  return NextResponse.json({
    output_gst: 115600,
    input_gst:  41280,
    net_payable: 94320,
    fy: "2025-26",
    next_due: "20 November 2025",
    monthly_breakdown: MONTHLY,
  });
}

export function InvoiceTemplate({ data }) {
  return (
    <div className="p-6 bg-white text-black w-[800px]">
      <h1 className="text-2xl font-bold mb-4">Invoice</h1>

      <div className="flex justify-between mb-6">
        <div>
          <p className="font-semibold">Your Gym Name</p>
          <p className="text-sm">Nashik, India</p>
        </div>

        <div className="text-right">
          <p>Invoice #: {data.id}</p>
          <p>Date: {data.date}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-medium">Billed To:</p>
        <p>{data.customer}</p>
      </div>

      <table className="w-full border mt-4">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Pro Plan (Monthly)</td>
            <td className="p-2 text-right">₹999</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right mt-6 space-y-1">
        <p>Subtotal: ₹999</p>
        <p>GST (18%): ₹179</p>
        <p className="font-bold">Total: ₹1178</p>
      </div>

      <p className="text-xs mt-6 text-muted-foreground">
        This is a system-generated invoice.
      </p>
    </div>
  );
}
import { useGymStore } from "@/store/gymStore"

export default function RecentPayments() {

  const payments = useGymStore((state) => state.payments)

  const latest = [...payments].slice(-5).reverse()

  return (
    <div className="bg-card rounded-xl p-4 border">

      <h3 className="font-semibold mb-4">
        Recent Payments
      </h3>

      {latest.map((p, i) => (
        <div
          key={i}
          className="flex justify-between py-2 text-sm"
        >
          <span>{p.name}</span>
          <span>₹{p.amount}</span>
        </div>
      ))}

    </div>
  )
}
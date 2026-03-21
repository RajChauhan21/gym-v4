import { useGymStore } from "@/store/gymStore"

export default function ExpiringMembers() {

  const members = useGymStore((state) => state.members)

  const expiringSoon = members.filter(member => {

    const expiry = new Date(member.expiryDate)
    const today = new Date()

    const diff =
      (expiry - today) / (1000 * 60 * 60 * 24)

    return diff <= 7 && diff > 0
  })

  return (
    <div className="bg-card rounded-xl p-4 border">

      <h3 className="font-semibold mb-4">
        Expiring Memberships
      </h3>

      {expiringSoon.map((m, i) => (
        <div
          key={i}
          className="flex justify-between py-2 text-sm"
        >
          <span>{m.name}</span>
          <span>{m.expiryDate}</span>
        </div>
      ))}

    </div>
  )
}
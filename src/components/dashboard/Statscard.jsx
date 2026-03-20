import { Card, CardContent } from "@/components/ui/card"

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 m-2">
      <Card className="rounded-2xl shadow-md hover:shadow-xl transition p-4 md:p-5">
        <CardContent className="p-5">
          <p className="text-gray-500">Total Members</p>
          <h2 className="text-2xl font-bold">320</h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition p-4 md:p-5">
        <CardContent className="p-5">
          <p className="text-gray-500">Active Plans</p>
          <h2 className="text-2xl font-bold">210</h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition p-4 md:p-5">
        <CardContent className="p-5">
          <p className="text-gray-500">Monthly Revenue</p>
          <h2 className="text-2xl font-bold">₹45,000</h2>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition p-4 md:p-5">
        <CardContent className="p-5">
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="text-2xl font-bold">₹12,000</h2>
        </CardContent>
      </Card>
    </div>
  )
}
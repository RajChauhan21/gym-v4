import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toaster, toast } from "sonner"
import AddPlanModal from "@/components/dashboard/AddPlanModal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
export default function Plans() {
  const [plans, setPlans] = useState([
    { name: "Gold", duration: 3, price: 1500 },
    { name: "Silver", duration: 1, price: 500 },
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [editPlan, setEditPlan] = useState(null)

  // Delete confirmation
  const handleDelete = (idx) => {
    if (confirm(`Are you sure you want to delete the "${plans[idx].name}" plan?`)) {
      const newPlans = plans.filter((_, i) => i !== idx)
      setPlans(newPlans)
      toast.success("Plan deleted successfully")
    }
  }

  // Edit button
  const handleEdit = (plan, idx) => {
    setEditPlan({ ...plan, index: idx })
    setModalOpen(true)
  }

  return (
    <div className="p-3">
      <Toaster position="top-center" />
      {/* Header + Add Plan Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Plans</h2>
        <AddPlanModal className="dark:bg-white"
          open={modalOpen}
          setOpen={setModalOpen}
          plans={plans}
          setPlans={setPlans}
          editPlan={editPlan}
          setEditPlan={setEditPlan}
        />
      </div>

      {/* ShadCN Table */}
      {/* <div className="overflow-x-auto rounded-2xl p-6 bg-white border dark:border-gray-700 dark:bg-white-900"> */}
      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-6 md:p-8">

        <Table className="min-w-[800px]">
          <TableHeader className="bg-white dark:bg-white">
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500">Plan Name</TableHead>
              <TableHead className="dark:text-gray-500">Duration (months)</TableHead>
              <TableHead className="dark:text-gray-500">Price</TableHead>
              <TableHead className="dark:text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan, idx) => (
              <TableRow key={idx} className="hover:bg-yellow-50 dark:hover:bg-red-50">
                <TableCell className={cn(
                  "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card w-[70px] min-w-[70px] max-w-[70px]"
                )}>{plan.name}</TableCell>
                <TableCell>{plan.duration}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell className="space-x-2">
                  <Button className="rounded-2xl" size="sm" variant="outline" onClick={() => handleEdit(plan, idx)}>
                    Edit
                  </Button>
                  <Button className="rounded-2xl" size="sm" variant="destructive" onClick={() => handleDelete(idx)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
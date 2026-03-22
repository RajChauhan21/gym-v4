import { useGymStore } from "@/store/gymStore";
import { CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function RecentPayments() {
  const payments = useGymStore((state) => state.payments);
  const navigate = useNavigate();

  const latest = [...payments].slice(-5).reverse();

  return (
    <div className="bg-card rounded-xl p-4 border">
      <h3 className="font-semibold mb-4">Recent Payments</h3>

      {latest.map((p, i) => (
        <div key={i} className="flex justify-between py-2 text-sm">
          <span>{p.name}</span>
          <span>₹{p.amount}</span>
        </div>
      ))}

      <CardFooter className="pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/payments")}
        >
          View All Payments
        </Button>
      </CardFooter>
    </div>
  );
}

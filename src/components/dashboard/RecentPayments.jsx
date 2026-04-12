import { useGymStore } from "@/store/gymStore";
import { CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { getRecentPaymentByMember } from "../../apis/backend_apis";
import { useProfile } from "../../contexts/ProfileContext";
import { useEffect, useState } from "react";
import { Skeleton } from "../../components/ui/skeleton";

export default function RecentPayments() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecentPayments = async () => {
    setLoading(true);
    try {
      const response = await getRecentPaymentByMember(profile?.ownerId);
      setLatest(response.data);
      console.log(latest);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecentPayments();
    setLatest([]);
  }, [profile?.ownerId]);
  return (
    <div className="bg-card rounded-xl p-4 border flex flex-col h-full shadow-lg">
      <h3 className="font-semibold mb-4">Recent Payments</h3>

      {/* <div className="space-y-1">
        {latest.length > 0 ? (
          latest.map((p, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span>{p.memberName}</span>
              <span>₹{p.amount}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No recent payments found.
          </p>
        )}
      </div> */}

      <div className="space-y-1">
        {loading ? (
          // Render 3 skeletons to match the expected list height
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-slate-800" />
            </div>
          ))
        ) : latest.length > 0 ? (
          latest.map((p, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span>{p.memberName}</span>
              <span>₹{p.amount}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No recent payments found.
          </p>
        )}
      </div>

      <CardFooter className="pt-4 mt-auto">
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

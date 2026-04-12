import { useGymStore } from "@/store/gymStore";
import { CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { getLatestMemberExpiry } from "../../apis/backend_apis";
import { useProfile } from "../../contexts/ProfileContext";
import { useEffect, useState } from "react";
import { Skeleton } from "../../components/ui/skeleton";

export default function ExpiringMembers() {
  const [member, setMember] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useProfile();

  const getExpiringMembers = async () => {
    setLoading(true);
    try {
      const response = await getLatestMemberExpiry(profile?.ownerId);
      setMember(response.data ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpiringMembers();
  }, [profile?.ownerId]);

  return (
    <div className="bg-card rounded-xl p-4 border flex flex-col h-full shadow-lg">
      <h3 className="font-semibold mb-4">Expiring Memberships</h3>

      <div className="space-y-1">
        {loading ? (
          // Render 3 skeletons to match the expected list height
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-slate-800" />
            </div>
          ))
        ) : member.length > 0 ? (
          member.map((m, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span>{m.name}</span>
              <span>{m.expiry}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No expiring memberships found.
          </p>
        )}
      </div>

      <CardFooter className="pt-4 mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/members")}
        >
          View All Members
        </Button>
      </CardFooter>
    </div>
  );
}

import { useGymStore } from "@/store/gymStore";
import {CardFooter } from "../../components/ui/card"
import {Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom";

export default function ExpiringMembers() {
  const members = useGymStore((state) => state.members);
  const navigate = useNavigate();
  const expiringSoon = members
    .filter((member) => {
      const expiry = new Date(member.expiry);
      const today = new Date();

      const diff = (expiry - today) / (1000 * 60 * 60 * 24);

      return diff <= 7 && diff > 0;
    })
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl p-4 border">
      <h3 className="font-semibold mb-4">Expiring Memberships</h3>

      {expiringSoon.map((m, i) => (
        <div key={i} className="flex justify-between py-2 text-sm">
          <span>{m.name}</span>
          <span>{m.expiry}</span>
        </div>
      ))}

      <CardFooter className="pt-4">
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

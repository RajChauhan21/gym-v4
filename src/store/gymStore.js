import { create } from "zustand";
import { getAllMembers, getAllPayments, getAllPlans } from "../apis/backend_apis";

export const useGymStore = create((set) => ({
  // DATA
 members: [],
  payments: [
    // --- MARCH 2026 ---
    {
      name: "Shiva Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-23",
      time: "10:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Shiva Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-22",
      time: "10:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Shiva Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-21",
      time: "10:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Rahul Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-20",
      time: "10:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-20",
      time: "6:00 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Neha Gupta",
      amount: 2000,
      plan: "Platinum",
      date: "2026-03-19",
      time: "8:45 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Karan Mehta",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-19",
      time: "7:10 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Arjun Patel",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-18",
      time: "9:20 AM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Priya Singh",
      amount: 2000,
      plan: "Platinum",
      date: "2026-03-18",
      time: "6:10 PM",
      status: "Failed",
      method: "UPI",
    },
    {
      name: "Vikas Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-17",
      time: "8:15 AM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Sneha Kapoor",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-17",
      time: "5:40 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Rohit Yadav",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-16",
      time: "6:30 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Anjali Desai",
      amount: 2000,
      plan: "Platinum",
      date: "2026-03-15",
      time: "10:10 AM",
      status: "Success",
      method: "Cash",
    },

    // --- FEBRUARY 2026 ---
    {
      name: "Deepak Kumar",
      amount: 1500,
      plan: "Gold",
      date: "2026-02-28",
      time: "7:30 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Harsh Jain",
      amount: 1200,
      plan: "Silver",
      date: "2026-02-27",
      time: "9:10 AM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Nikita Sharma",
      amount: 2000,
      plan: "Platinum",
      date: "2026-02-27",
      time: "5:30 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Aditya Rao",
      amount: 1500,
      plan: "Gold",
      date: "2026-02-26",
      time: "6:00 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Ritika Malhotra",
      amount: 2000,
      plan: "Platinum",
      date: "2026-02-25",
      time: "8:00 AM",
      status: "Failed",
      method: "Cash",
    },
    {
      name: "Manish Tiwari",
      amount: 1200,
      plan: "Silver",
      date: "2026-02-25",
      time: "6:20 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Pooja Agarwal",
      amount: 1500,
      plan: "Gold",
      date: "2026-02-24",
      time: "7:15 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Suresh Nair",
      amount: 1200,
      plan: "Silver",
      date: "2026-02-23",
      time: "8:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Kunal Shah",
      amount: 2000,
      plan: "Platinum",
      date: "2026-02-22",
      time: "6:50 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Meera Joshi",
      amount: 800,
      plan: "Gold",
      date: "2026-02-21",
      time: "5:45 PM",
      status: "Success",
      method: "Cash",
    },

    // --- JANUARY 2026 ---
    {
      name: "Rajesh Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-01-30",
      time: "9:30 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Simran Kaur",
      amount: 2000,
      plan: "Platinum",
      date: "2026-01-29",
      time: "6:10 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Ankit Jain",
      amount: 1500,
      plan: "Gold",
      date: "2026-01-28",
      time: "7:25 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Rahul Das",
      amount: 1200,
      plan: "Silver",
      date: "2026-01-27",
      time: "8:50 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Kriti Malhotra",
      amount: 2000,
      plan: "Platinum",
      date: "2026-01-26",
      time: "5:10 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Mohit Bansal",
      amount: 1500,
      plan: "Gold",
      date: "2026-01-25",
      time: "7:45 PM",
      status: "Failed",
      method: "UPI",
    },
    {
      name: "Nitin Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-01-24",
      time: "6:30 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Sonal Gupta",
      amount: 1200,
      plan: "Silver",
      date: "2026-01-23",
      time: "9:00 AM",
      status: "Success",
      method: "Cash",
    },

    // --- DECEMBER 2025 ---
    {
      name: "Abhishek Roy",
      amount: 2000,
      plan: "Platinum",
      date: "2025-12-30",
      time: "8:20 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Tarun Khanna",
      amount: 1500,
      plan: "Gold",
      date: "2025-12-29",
      time: "7:10 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Ananya Iyer",
      amount: 1200,
      plan: "Silver",
      date: "2025-12-28",
      time: "6:40 PM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Varun Kapoor",
      amount: 2000,
      plan: "Platinum",
      date: "2025-12-27",
      time: "8:00 AM",
      status: "Success",
      method: "UPI",
    },
    {
      name: "Rakesh Singh",
      amount: 1500,
      plan: "Gold",
      date: "2025-12-26",
      time: "7:25 PM",
      status: "Success",
      method: "Cash",
    },
    {
      name: "Divya Patel",
      amount: 1200,
      plan: "Silver",
      date: "2025-12-24",
      time: "9:30 AM",
      status: "Failed",
      method: "UPI",
    },
    {
      name: "Siddharth Mehta",
      amount: 2000,
      plan: "Platinum",
      date: "2025-12-23",
      time: "5:50 PM",
      status: "Success",
      method: "UPI",
    },
  ],

  plans: [
    { name: "Gold", duration: 3, price: 1500 },
    { name: "Silver", duration: 1, price: 500 },
    { name: "Platinum", duration: 6, price: 4500 },
    { name: "Diamond", duration: 12, price: 500 },
  ],

  fetchMembers: async (ownerId) => {
    try {
      const data = await getAllMembers(ownerId);
      // Use Array.isArray to be 100% safe before updating state
      set({ members: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ members: [] }); // Reset to empty array on failure
    }
  },

  fetchPlans: async () => {
    try {
      const data = await getAllPlans(); // Your API utility
      set({ plans: data });
    } catch (error) {
      console.error("Failed to fetch:", error);
      set({ plans: [] });
    }
  },

  fetchPayments: async (ownerId) => {
    try {
      const data = await getAllPayments(ownerId); // Your API utility
      set({ payments: data });
    } catch (error) {
      console.error("Failed to fetch:", error);
      set({ payments: [] });
    }
  },

  // ACTIONS
  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
    })),

  addPlan: (plan) =>
    set((state) => ({
      plans: [...state.plans, plan],
    })),

  setMembers: (members) => set({ members }),
  setPayments: (payments) => set({ payments }),
  setPlans: (plans) => set({ plans }),
}));

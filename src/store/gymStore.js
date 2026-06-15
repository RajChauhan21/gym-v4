import { create } from "zustand";
import {
  getAllMembers,
  getAllPayments,
  getAllPlans,
} from "../apis/backend_apis";

export const useGymStore = create((set) => ({
  // DATA
  members: [],
  payments: [],
  plans: [],

  fetchMembers: async (ownerId) => {
    try {
      const data = await getAllMembers(ownerId);
      // Use Array.isArray to be 100% safe before updating state
      set({
        members: Array.isArray(data.data.content) ? data.data.content : [],
      });
    } catch (error) {
      set({ members: [] }); // Reset to empty array on failure
    }
  },

  fetchPlans: async (gymId) => {
    try {
      const response = await getAllPlans(gymId); // Your API utility

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        set({ plans: response.data });
      } else if (response.status === 404) {
        // toast.error(
        //   "Something went wrong while fetching plans. Please try again later.",
        // );
        set({ plans: [] });
      } else if (response.status === 429) {
        // toast.Error(
        //   "You are performing actions too quickly. Please wait a few seconds and try again.",
        // );
        set({ plans: [] });
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      set({ plans: [] });
    }
  },

  fetchPayments: async (ownerId) => {
    try {
      const data = await getAllPayments(ownerId); // Your API utility

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        set({ payments: data });
      } else if (response.status === 404) {
        // toast.error(
        //   "Something went wrong while fetching payments. Please try again later.",
        // );
        set({ payments: [] });
      } else if (response.status === 429) {
        // toast.Error(
        //   "You are performing actions too quickly. Please wait a few seconds and try again.",
        // );
        set({ payments: [] });
      }
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

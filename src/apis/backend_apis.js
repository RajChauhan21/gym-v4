import constant from "./constant";

export function getAllOwners() {
  constant
    .get("/gym/findAll", {
      withCredentials: true,
    })
    .then((response) => {
      console.log(response.data);
    });
}

export async function login(email, password) {
  return await constant.post(
    "/owner/login",
    {
      email: email,
      password: password,
    },
    {
      withCredentials: true,
    },
  );
}

export async function getMe() {
  return await constant.get("/owner/me").then((r) => {
    console.log("Profile Data:", r);
    return r;
  });
}

export async function signup(form) {
  return await constant.post(
    "/owner/signup",
    {
      name: form.name,
      email: form.email,
      password: form.password,
    },
    {
      withCredentials: true,
    },
  );
}

export function loginByGoogle() {
  window.location.href = "http://localhost:8180/oauth2/authorization/google";
}

export async function saveGymDetails(gymData) {
  try {
    // Await the post request directly
    const response = await constant.post("/gym/save", gymData);
    console.log("Gym Data Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error("API Error in saveGymDetails:", error.response || error);
    return error.response;
  }
}

export async function renewMemberShip(form) {
  try {
    // Await the post request directly
    const response = await constant.post("/member/renew-membership", form);
    console.log("Renew Data Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error("API Error in renew response:", error.response || error);
    return error.response;
  }
}

export async function saveOwnerDetails(ownerData) {
  try {
    // Await the post request directly
    const response = await constant.put("/owner/update", ownerData);
    console.log("Owner Data Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error("API Error in saveOwnerDetails:", error.response || error);
    return error.response;
  }
}

export async function getAllMembers(
  ownerId,
  page = 0,
  size = 10, // Matching your typical page size
  sortBy = "expiry",
  direction = "desc",
  filters = {},
) {
  // Clean filters: Remove keys with empty strings or null values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  try {
    const response = await constant.get("/owner/getAllMembersOfOwner", {
      params: {
        q: ownerId,
        page: page,
        size: size,
        sort: `${sortBy},${direction}`,
        ...cleanFilters, // Spreads name, dueAmount, joinedFrom, etc.
      },
    });
    return response;
  } catch (error) {
    console.error("API Error in getAllMembers:", error.response || error);
    return error.response;
  }
}

export async function getAllMembersCountByFilters(ownerId, filters = {}) {
  // Clean filters: Remove keys with empty strings or null values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  try {
    const response = await constant.get("/owner/getMembersCountOfOwner", {
      params: {
        q: ownerId,
        ...cleanFilters, // Spreads name, dueAmount, joinedFrom, etc.
      },
    });
    return response;
  } catch (error) {
    console.error("API Error in getAllMembersCount:", error.response || error);
    return error.response;
  }
}

export async function getAllPaymentsCountByFilters(ownerId, filters = {}) {
  // Clean filters: Remove keys with empty strings or null values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  try {
    const response = await constant.get("/pay/getFilteredCountOfPayments", {
      params: {
        q: ownerId,
        ...cleanFilters, // Spreads name, dueAmount, joinedFrom, etc.
      },
    });
    return response;
  } catch (error) {
    console.error("API Error in getAllPaymentsCount:", error.response || error);
    return error.response;
  }
}

export async function addMember(member) {
  try {
    const response = await constant.post("/member/update", member);
    console.log("Add member Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in addMember:", error.response || error);
    return error.response;
  }
}

export async function addPlan(plan) {
  try {
    const response = await constant.post("/member-ship/update", plan);
    console.log("Add plan Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in addPlan:", error.response || error);
    return error.response;
  }
}

export async function getAllPlans(gymId) {
  try {
    console.log("gymId", gymId);
    const response = await constant.get("/member-ship/getAll", {
      params: {
        q: gymId,
      },
    });
    console.log("Get all plans Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in Get all plans:", error.response || error);
    return error.response;
  }
}

export async function getActiveSubscriptionOfOwner(ownerId) {
  try {
    const response = await constant.get("/owner/active-subscription", {
      params: {
        q: ownerId,
      },
    });
    console.log("Get active subscription Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in active subscription:", error.response || error);
    return error.response;
  }
}

export async function changeMemberActiveStatus(action, memberId, ownerId) {
  try {
    const response = await constant.get("/member/makeMemberActiveOrInactive", {
      params: {
        a: action,
        q: memberId,
        o: ownerId,
      },
    });
    console.log("Get active subscription Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in active subscription:", error.response || error);
    return error.response;
  }
}

export async function getAllDuesOfMembers(ownerId) {
  try {
    const response = await constant.get("/owner/getDuesOfMembers", {
      params: {
        q: ownerId,
      },
    });
    console.log("Get dues Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in dues:", error.response || error);
    return error.response;
  }
}

export async function getAllMembersCount(ownerId) {
  try {
    const response = await constant.get("/owner/getAllMembersCount", {
      params: {
        q: ownerId,
      },
    });
    console.log("Get member count Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in member count:", error.response || error);
    return error.response;
  }
}

export async function getRevenue(ownerId) {
  try {
    const response = await constant.get("/pay/getRevenue", {
      params: {
        q: ownerId,
      },
    });
    console.log("Get revenue Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in revenue:", error.response || error);
    return error.response;
  }
}

export async function getRevenueOverview(ownerId, days) {
  try {
    const response = await constant.get("/pay/getRevenueChartDetails", {
      params: {
        q: ownerId,
        d: days,
      },
    });
    console.log("Get revenue chart Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in revenue chart:", error.response || error);
    return error.response;
  }
}

export async function getActiveMembers(ownerId, isActive) {
  try {
    const response = await constant.get("/member/getActiveMembers", {
      params: {
        o: ownerId,
        a: isActive,
      },
    });
    console.log("Get active member Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in active member:", error.response || error);
    return error;
  }
}

export async function getMembersJoinedCurrentMonth(ownerId) {
  try {
    const response = await constant.get("/member/getMembersJoined", {
      params: {
        o: ownerId,
      },
    });
    console.log("Get members joined this month Response:", response);
    return response.data;
  } catch (error) {
    console.error(
      "API Error in members joined this month:",
      error.response || error,
    );
    return error.response;
  }
}

export async function getMembersOnMemberShipId(memberShipId, gymId, ownerId) {
  try {
    const response = await constant.get("/member/findByMemberShipId", {
      params: {
        m: memberShipId,
        g: gymId,
        o: ownerId,
      },
    });
    console.log("Get members count by membership id:", response);
    return response;
  } catch (error) {
    console.error(
      "API Error in Get members count by membership id:",
      error.response || error,
    );
    return error.response;
  }
}

export async function getMembersExpiringSoon(ownerId) {
  try {
    const response = await constant.get("/member/getMembersExpiringSoon", {
      params: {
        o: ownerId,
      },
    });
    console.log("Get members expiring soon Response:", response);
    return response.data;
  } catch (error) {
    console.error(
      "API Error in members expiring soon:",
      error.response || error,
    );
    return error.response;
  }
}
//getAllStatsOfMember

export async function getStatsOfMember(ownerId) {
  try {
    const response = await constant.get("/member/getAllStatsOfMember", {
      params: {
        o: ownerId,
      },
    });
    console.log("Get all stats of member Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in all stats of member:", error.response || error);
    return error.response;
  }
}

export async function getLatestMemberExpiry(ownerId) {
  try {
    const response = await constant.get("/member/getLatestMemberExpiry", {
      params: {
        o: ownerId,
      },
    });
    console.log("Get latest member expiry Response:", response);
    return response;
  } catch (error) {
    console.error("API Error latest member expiry:", error.response || error);
    return error.response;
  }
}

export async function getRecentPaymentByMember(ownerId) {
  try {
    const response = await constant.get("/pay/getRecentPayments", {
      params: {
        q: ownerId,
      },
    });
    console.log("Get recent payment Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in  recent payment:", error.response || error);
    return error.response;
  }
}

export async function searchMembers(ownerId, query) {
  try {
    const response = await constant.get("/member/searchMembers", {
      params: {
        o: ownerId,
        q: query,
      },
    });
    console.log("Get search member Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in search member:", error.response || error);
    return error.response;
  }
}

export async function getTotalPaymentAmount() {
  try {
    const response = await constant.get("/pay/getTotalAmount");
    console.log("Get total amount Response:", response);
    return response.data;
  } catch (error) {
    console.error("API Error in total amount:", error.response || error);
    return error.response;
  }
}

export async function deletePlanById(id) {
  try {
    const response = await constant.delete("/member-ship/deleteById", {
      params: {
        q: id,
      },
    });
    console.log("Delete plan Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in delete plans:", error.response || error);
    return error.response;
  }
}

export async function deleteMemberById(id) {
  try {
    const response = await constant.delete("/member/deleteById", {
      params: {
        q: id,
      },
    });
    console.log("Delete member Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in delete member:", error.response || error);
    return error.response;
  }
}

export async function deletePaymentById(id) {
  try {
    const response = await constant.delete("/pay/deleteById", {
      params: {
        q: id,
      },
    });
    console.log("Delete payment Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in delete payment:", error.response || error);
    return error.response;
  }
}

export async function savePayment(payment) {
  try {
    const response = await constant.post("/pay/update", payment);
    console.log(" Save Payment Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in delete member:", error.response || error);
    return error.response;
  }
}

export async function getAllPayments(
  ownerId,
  page = 0,
  size = 20,
  sortBy = "paymentDate",
  direction = "desc",
  filters = {},
) {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );
    const response = await constant.get(
      "/pay/getAllPaymentsOfMembersByOwnerId",
      {
        params: {
          q: ownerId,
          page: page,
          size: size,
          sort: `${sortBy},${direction}`,
          ...cleanFilters,
        },
      },
    );
    console.log(" get all Payment Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in get all payments:", error.response || error);
    return error.response;
  }
}

export async function getAllSubscriptionPlans() {
  try {
    const response = await constant.get("/plan/findAll");
    console.log("Get all plans Response:", response);
    return response;
  } catch (error) {
    console.error("API Error in all plans:", error.response || error);
    return error.response;
  }
}

export async function verifySubscriptionPayment(paymentDetails) {
  try {
    const response = await constant.post(
      "/razorpay/verify-subscription-payment",
      paymentDetails,
    );
    console.log("Verify razorpay subscription Response:", response);
    return response;
  } catch (error) {
    console.error(
      "API Error in razorpay subscription:",
      error.response || error,
    );
    return error.response;
  }
}

export async function createRazorpaySubscription(ownerId, planId) {
  try {
    const response = await constant.post(
      "/razorpay/create-subscription",
      null,
      {
        params: {
          o: ownerId,
          p: planId,
        },
      },
    );
    console.log("Get razorpay subscription Response:", response);
    return response;
  } catch (error) {
    console.error(
      "API Error in razorpay subscription:",
      error.response || error,
    );
    return error.response;
  }
}

export async function getAllPaymentsOfOwner(
  ownerId,
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc",
  filters = {},
) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
  try {
    const response = await constant.get("/owner/getAllPaymentsOwner", {
      params: {
        q: ownerId,
        page,
        size,
        sort: `${sortBy},${sortDir}`,
        ...cleanFilters,
      },
    });
    console.log("Get owner payment history Response:", response);
    return response;
  } catch (error) {
    console.error(
      "API Error in owner payment history:",
      error.response || error,
    );
    return error.response;
  }
}

export async function sendOtp(email) {
  try {
    const response = await constant.get("/owner/sendOtp", {
      params: {
        q: email,
      },
    });
    console.log("send otp response:", response);
    return response;
  } catch (error) {
    console.error("send otp error response:", error.response || error);
    return error.response;
  }
}

export async function verifyOtp(email, otp) {
  try {
    const response = await constant.get("/owner/verifyOtp", {
      params: {
        e: email,
        q: otp,
      },
    });
    console.log("verify otp response:", response);
    return response;
  } catch (error) {
    console.error("verify otp error response:", error.response || error);
    return error.response;
  }
}

export async function resetPassword(ownerId, password) {
  try {
    const response = await constant.get("/owner/resetPassword", {
      params: {
        q: ownerId,
        p: password,
      },
    });
    console.log("reset password response:", response);
    return response;
  } catch (error) {
    console.error("reset password error response:", error.response || error);
    return error.response;
  }
}

export async function uploadImageForOwner(id, file) {
  try {
    // Create FormData to hold the file and the ID
    const formData = new FormData();
    formData.append("q", id);
    formData.append("t", "owner");
    formData.append("file", file);

    const response = await constant.post("owner/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("owner upload image response:", response);
    return response;
  } catch (error) {
    console.error(
      "owner upload image error response:",
      error.response || error,
    );
    return error.response;
  }
}

export async function uploadImageForGym(id, file) {
  try {
    // Create FormData to hold the file and the ID
    const formData = new FormData();
    formData.append("g", id);
    formData.append("t", "gym");
    formData.append("file", file);

    const response = await constant.post("gym/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("gym upload image response:", response);
    return response;
  } catch (error) {
    console.error("gym upload image error response:", error.response || error);
    return error.response;
  }
}

export async function cancelSubscription(ownerId) {
  try {
    const response = await constant.get("/razorpay/cancel-subscription", {
      params: {
        o: ownerId,
      },
    });
    console.log("cancel subscription response:", response);
    return response;
  } catch (error) {
    error.response || error;
  }
}

export const exportMembers = async (ownerId, filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
  try {
    const response = await constant.get("owner/export-members", {
      params: {
        q: ownerId,
        ...cleanFilters,
      },
      responseType: "blob",
    });
    return response;
  } catch (errror) {
    throw errror;
  }
};

export const exportPayments = async (ownerId, filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
  try {
    const response = await constant.get("owner/export-payments", {
      params: {
        q: ownerId,
        ...cleanFilters,
      },
      responseType: "blob",
    });
    return response;
  } catch (errror) {
    throw errror;
  }
};

export const exportSubcriptions = async (ownerId, filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
  try {
    const response = await constant.get("owner/export-subscription", {
      params: {
        q: ownerId,
        ...cleanFilters,
      },
      responseType: "blob",
    });
    return response;
  } catch (errror) {
    return errror;
  }
};

export async function getPaymentHistory(ownerId, filters = {}) {
  // Clean filters: Remove keys with empty strings or null values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  try {
    const response = await constant.get(
      "/owner/getPaymentHistoryCountByOwner",
      {
        params: {
          q: ownerId,
          ...cleanFilters, // Spreads name, dueAmount, joinedFrom, etc.
        },
      },
    );
    return response;
  } catch (error) {
    console.error("API Error in getAllMembersCount:", error.response || error);
    return error.response;
  }
}

export async function getAllSources(ownerId) {
  try {
    const response = await constant.get("/member-source/getAll", {
      params: {
        q: ownerId,
      },
    });
    console.log("get all sources response:", response);
    return response;
  } catch (error) {
    error.response || error;
  }
}

export async function getMembersCount(sourceId) {
  try {
    const response = await constant.get("/member-source/count-member-source", {
      params: {
        q: sourceId,
      },
    });
    console.log("get members count by source id response:", response);
    return response;
  } catch (error) {
    error.response || error;
  }
}

export async function saveSourceDetails(source) {
  try {
    // Await the post request directly
    const response = await constant.post("/member-source/save", source);
    console.log("Source Data Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error("API Error in saveSourceDetails:", error.response || error);
    return error.response;
  }
}

export async function updateSourceDetails(source) {
  try {
    // Await the post request directly
    const response = await constant.post("/member-source/update", source);
    console.log("Update Source Data Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error("API Error in updateSourceDetails:", error.response || error);
    return error.response;
  }
}

export async function deleteSource(sourceId) {
  try {
    const response = await constant.get("/member-source/delete", {
      params: {
        q: sourceId,
      },
    });
    console.log("delete source response:", response);
    return response;
  } catch (error) {
    error.response || error;
  }
}

export async function getSourceAnalytics(ownerId) {
  try {
    const response = await constant.get("/member-source/get-source-analytics", {
      params: {
        q: ownerId,
      },
    });
    console.log("get source analytics response:", response);
    return response;
  } catch (error) {
    error.response || error;
  }
}

export async function downloadInvoice(paymentId, ownerId) {
  try {
    const response = await constant.get("/member/invoice/pdf", {
      params: {
        p: paymentId,
        o: ownerId,
      },
      responseType: "blob", // CRITICAL: This tells the request library to handle raw binary data
    });
    console.log("download member invoice response:", response);
    return response;
  } catch (error) {
    throw error.response || error;
  }
}

export async function previewTemplate(templateName) {
  try {
    const response = await constant.get(
      "/invoice/template-preview/" + templateName,
    );
    console.log("template preview response:", response);
    return response;
  } catch (error) {
    throw error.response || error;
  }
}

export async function getAllTemplates(ownerId) {
  try {
    const response = await constant.get(
      "/invoice/template-preview/preview-all",
      {
        params: {
          o: ownerId,
        },
      },
    );
    console.log("all template preview response:", response);
    return response;
  } catch (error) {
    throw error.response || error;
  }
}

export async function selectTemplate(ownerId, templateId) {
  try {
    const response = await constant.get("/owner/select-template", {
      params: {
        o: ownerId,
        t: templateId,
      },
    });
    console.log("select template response:", response);
    return response;
  } catch (error) {
    throw error.response || error;
  }
}

export const importMembers = async (file, ownerId) => {
  const formData = new FormData();

  formData.append("file", file);

  // Appended ownerId as a query parameter '?o=' to match the backend @RequestParam("o")
  const response = await constant.post(
    `/owner/members/import?o=${ownerId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    },
  );

  return response;
};

export const downloadMemberImportTemplate = async () => {
  try {
    const response = await constant.get("/owner/download-template", {
      responseType: "blob",
    });
    console.log("download sample excel response:", response);
    return response;
  } catch (error) {
    console.error("Failed to download member import template:", error);
    throw error; // Changed from 'return error' to correctly trigger catch blocks upstream
  }
};

export async function saveMemberShipAdjustment(payload) {
  try {
    // Await the post request directly
    const response = await constant.post("/member-ship-adjust/save", payload);
    console.log("Save Membership Adjust Response:", response);
    return response;
  } catch (error) {
    // Re-throw the error so your handleSave catch block can handle the UI toast
    console.error(
      "API Error in saveMemberShipAdjustment:",
      error.response || error,
    );
    throw error;
  }
}

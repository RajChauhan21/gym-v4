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

export async function getAllPlans() {
  try {
    const response = await constant.get("/member-ship/getAll");
    console.log("Get all plans Response:", response);
    return response.data;
  } catch (error) {
    console.error("API Error in Get all plans:", error.response || error);
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
    return response.data;
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("API Error in revenue:", error.response || error);
    return error.response;
  }
}

export async function searchMembers(ownerId,query) {
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
          ...cleanFilters
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

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

export async function getAllMembers(ownerId) {
  try {
    const response = await constant.get("/owner/getAllMembersOfOwner", {
      params: { q: ownerId },
    });
    // Ensure you are returning the array inside response.data
    return response.data;
  } catch (error) {
    console.error("API Error in getAllMembers:", error.response || error);
    // CRITICAL: Return an empty array so .filter() doesn't crash the UI
    return [];
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

export async function getAllPayments(ownerId, page = 0, size = 20, sortBy = 'paymentDate', direction = 'desc') {
  try {
    const response = await constant.get(
      "/pay/getAllPaymentsOfMembersByOwnerId",
      {
        params: {
          q: ownerId,
          page: page,
          size: size,
          sort: `${sortBy},${direction}`,
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

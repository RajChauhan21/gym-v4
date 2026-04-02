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
  })
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

// export function saveGym() {
//   constant
//     .post(
//       "/gym/save",
//       {
//         name: "Elite Fitness Gym",
//         website: "http://www.elitefitnessgym.com",
//         location: "new panvel, navi mumbai",
//         googleMapUrl: "https://www.google.com/",
//       },
//       {
//         withCredentials: true,
//       },
//     )
//     .then((r) => {
//       console.log(r.data);
//     });
// }

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
    // We pass 'null' for data and use the 'params' config for query strings
    const response = await constant.post("/owner/getAllMembersOfOwner", null, {
      params: {
        q: ownerId // This appends ?q=ownerId to the URL
      }
    });
    console.log("members:", response);
    return response.data;
  } catch (error) {
    console.error("API Error in getAllMembers:", error.response || error);
    // Re-throwing so the caller's catch block can trigger UI notifications
    return error;
  }
}


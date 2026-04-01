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

export function saveGym() {
  constant
    .post(
      "/gym/save",
      {
        name: "Elite Fitness Gym",
        website: "http://www.elitefitnessgym.com",
        location: "new panvel, navi mumbai",
        googleMapUrl: "https://www.google.com/",
      },
      {
        withCredentials: true,
      },
    )
    .then((r) => {
      console.log(r.data);
    });
}

export function loginByGoogle() {
  window.location.href = "http://localhost:8180/oauth2/authorization/google";
}

export function saveGymDetails(gymData) {
  constant.post("/gym/save", gymData).then((r) => {
    console.log("Gym Data:", r);
    return r;
  })
}

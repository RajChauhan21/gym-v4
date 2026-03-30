import axios from "axios";
import constant from "./constant";

export function getAllOwners() {
  constant.get('/gym/findAll', {
    withCredentials: true
  }).then((response) => {
    console.log(response.data)
  })
}

export function login() {
  constant.post("/owner/login",
    {
      email: "manoj@gmail.com",
      password: "12345"
    },
    {
      withCredentials: true
    }
  );
}

export function saveGym() {
  constant.post("/gym/save",
    {
      name: "Elite Fitness Gym",
      website: "http://www.elitefitnessgym.com",
      location: "new panvel, navi mumbai",
      googleMapUrl: "https://www.google.com/"
    },
    {
      withCredentials: true
    }
  ).then((r) => {
    console.log(r.data)
  })
}

export function loginByGoogle() {
  window.location.href = "http://localhost:8180/oauth2/authorization/google";
}
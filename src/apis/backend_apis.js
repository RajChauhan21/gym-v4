import axios from "axios"

export function getAllOwners(){
axios.get('http://localhost:8080/gym/findAll',{
    withCredentials:true
}).then((response) => {
    console.log(response.data)
})
}

export function login(){
    axios.post(
  "http://localhost:8080/owner/login",
  {
    email: "craj47577@gmail.com",
    password: "12345"
  },
  {
    withCredentials:true
  }
);
}
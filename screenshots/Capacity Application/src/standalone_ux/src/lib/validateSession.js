function validateSession(debug) {
  let now = new Date();
  let expire = localStorage.getItem("tokenExpires");
  let token = localStorage.getItem("token");
  if(expire) expire = new Date(expire);

  if(debug) {
    console.debug("token:",token);
    console.debug("tokenExpires:",expire);
  }

  if(token && expire && expire>now) {
    return {
      token:{
        headers: {
          Authorization: "Bearer " + token
        }
      },
      uid:localStorage.getItem("uid")
    };
  }

  return null;
}

export default validateSession;

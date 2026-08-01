import { Link } from "react-router-dom";

const Unauthorized=()=>{

return(

<div className="min-h-screen flex flex-col justify-center items-center">

<h1 className="text-5xl font-bold">

401

</h1>

<p className="mt-3">

Unauthorized Access

</p>

<Link

to="/login"

className="text-blue-600 mt-5"

>

Login

</Link>

</div>

)

}

export default Unauthorized;
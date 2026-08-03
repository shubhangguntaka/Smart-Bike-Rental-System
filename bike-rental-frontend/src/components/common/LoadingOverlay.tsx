import Spinner from "./Spinner";

interface Props{

loading:boolean;

}

const LoadingOverlay=({

loading

}:Props)=>{

if(!loading){

return null;

}

return(

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

<div className="rounded-xl bg-card border border-border p-8 shadow-xl text-center text-foreground">

<Spinner/>

<p className="mt-4">

Please Wait...

</p>

</div>

</div>

)

}

export default LoadingOverlay;
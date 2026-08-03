import { ShieldAlertIcon } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-6">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-lg">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 animate-bounce">
                    <ShieldAlertIcon className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-destructive">
                    404
                </h1>
                <h2 className="text-lg font-bold text-foreground">
                    Page Not Found
                </h2>
                <div className="pt-2">
                    <Link to="/"
                        className="inline-block px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl cursor-pointer shadow-sm active:scale-95">
                        Go Home
                    </Link>
                </div>
            </div>
        </div >
    )

}

export default NotFound;
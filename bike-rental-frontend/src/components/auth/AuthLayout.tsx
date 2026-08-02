// import React from "react";

// interface Props {
//   title: string;
//   subtitle: string;
//   children: React.ReactNode;
// }

// const AuthLayout: React.FC<Props> = ({
//   title,
//   subtitle,
//   children,
// }) => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">

//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

//         <div className="mb-8 text-center">

//           <h1 className="text-3xl font-bold text-blue-600">
//             Bike Rental
//           </h1>

//           <h2 className="mt-4 text-2xl font-semibold">
//             {title}
//           </h2>

//           <p className="mt-2 text-gray-500">
//             {subtitle}
//           </p>

//         </div>

//         {children}

//       </div>

//     </div>
//   );
// };

// export default AuthLayout;

// import React from "react";

// interface Props {
//   title: string;
//   subtitle: string;
//   children: React.ReactNode;
// }

// const AuthLayout: React.FC<Props> = ({
//   title,
//   subtitle,
//   children,
// }) => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">

//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

//         <div className="mb-8 text-center">

//           <h1 className="text-3xl font-bold text-blue-600">
//             Bike Rental
//           </h1>

//           <h2 className="mt-4 text-2xl font-semibold">
//             {title}
//           </h2>

//           <p className="mt-2 text-gray-500">
//             {subtitle}
//           </p>

//         </div>

//         {children}

//       </div>

//     </div>
//   );
// };

// export default AuthLayout;



import React from "react";
import BikeImage from "../../assets/images/bike.jpeg";

interface Props {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({
    title,
    subtitle,
    children,
}) => {

    return (

        <div className="h-screen w-full bg-white flex items-center justify-center">

            <div className="relative w-[96%] max-w-[1600px] h-[92vh] overflow-hidden rounded-[30px] bg-white shadow-[0_35px_80px_rgba(0,0,0,0.25)]">

                <div className="relative grid h-full min-h-0 grid-cols-1 lg:grid-cols-[52%_48%]">

                    <div className="relative hidden min-h-0 overflow-hidden md:block bg-[#90939B]">

                        <img
                            src={BikeImage}
                            alt="Premium sports bike"
                            className="absolute inset-0 h-full w-full object-contain object-bottom mix-blend-multiply"
                        />

                        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">

                            <div>

                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">

                                    🏍️ Bike Rental System

                                </span>

                            </div>

                            <div className="max-w-[21rem]">

                                <h1 className="text-[3.2rem] font-black leading-[0.95] tracking-[-0.04em] text-white">

                                    Ride.
                                    <br />
                                    Rent.
                                    <br />
                                    Explore.

                                </h1>

                                <p className="mt-6 text-lg leading-8 text-slate-100">

                                    Find nearby bikes,
                                    book instantly,
                                    travel comfortably
                                    and enjoy secure rentals
                                    from verified bike owners.

                                </p>

                                <div className="mt-10 space-y-4 text-sm text-white">

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                            ✓
                                        </span>
                                        <span>Instant Bike Booking</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                            ✓
                                        </span>
                                        <span>Verified Bike Owners</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                            ✓
                                        </span>
                                        <span>Secure Online Payments</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                            ✓
                                        </span>
                                        <span>Live Location Tracking</span>
                                    </div>

                                </div>

                            </div>

                            <p className="text-sm text-slate-200">

                                © 2026 Bike Rental Management System

                            </p>

                        </div>

                    </div>

                    <div className="relative min-h-0 flex items-center justify-center bg-white px-0">

                        <div className="relative z-30 w-full max-w-[520px] rounded-none bg-white px-8 py-8 shadow-none">

                            <div className="mx-auto w-full max-w-[430px]">

                                <div className="mb-4 text-center">

                                    <h2 className="text-[38px] font-bold tracking-[-0.03em] text-slate-950">

                                        {title}

                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">

                                        {subtitle}

                                    </p>

                                </div>

                                {children}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default AuthLayout;
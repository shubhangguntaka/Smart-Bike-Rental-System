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

        <div className="h-screen w-full bg-[#060c19] flex items-center justify-center px-4 py-3">

            <div className="relative w-full max-w-[1600px] h-[92vh] overflow-hidden rounded-[30px] shadow-[0_35px_80px_rgba(0,0,0,0.35)]">

                <img
                    src={BikeImage}
                    alt="Premium sports bike"
                    className="absolute inset-0 h-full w-full object-cover object-[45%_18%]"
                />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,12,25,0.72),rgba(6,12,25,0.55))]" />

                <div className="relative z-10 grid h-full min-h-0 grid-cols-1 lg:grid-cols-[48%_52%]">

                    <div className="relative flex items-center px-5 py-6 md:px-7 md:py-7">

                        <div className="max-w-md text-white">

                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">

                                Bike Rental System

                            </span>

                            <h1 className="mt-4 text-[3.4rem] font-black leading-[0.95] tracking-[-0.05em] text-white">

                                Ride.
                                <br />
                                Rent.
                                <br />
                                Explore.

                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">

                                Discover premium bike rentals with instant booking, verified owners, and seamless on-demand service.

                            </p>

                            <div className="mt-5 space-y-3 text-sm text-white/80">

                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                                        ✓
                                    </span>
                                    <span>Instant bike booking</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                                        ✓
                                    </span>
                                    <span>Verified bike owners</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                                        ✓
                                    </span>
                                    <span>Secure online payments</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                                        ✓
                                    </span>
                                    <span>Live location tracking</span>
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="relative flex items-center justify-center px-4 py-5 md:px-6 md:py-5">

                        <div className="relative z-20 w-full max-w-[460px] rounded-[28px] border border-white/18 bg-white/12 backdrop-blur-[18px] px-5 py-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">

                            <div className="mx-auto w-full max-w-[440px] text-white">

                                <div className="mb-2 text-center">

                                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-200/85">

                                        Premium Bike Rental

                                    </p>

                                    <h2 className="mt-1 text-[2rem] font-bold tracking-[-0.04em] text-white">

                                        {title}

                                    </h2>

                                    <p className="mt-1.5 text-sm leading-5 text-white/70">

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
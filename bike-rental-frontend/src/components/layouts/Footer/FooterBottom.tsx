import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function FooterBottom() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Newsletter signup demo action
    toast.success("Thank you for subscribing to our newsletter!");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        {/* Newsletter widget */}
        <div className="flex flex-col space-y-3 max-w-md text-left">
          <h4 className="text-sm font-bold text-foreground">
            Subscribe to our newsletter
          </h4>
          <p className="text-xs text-muted-foreground leading-normal">
            Get the latest updates on station locations, new e-bike arrivals, and discount promo codes directly in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="h-10 flex-1 rounded-xl border border-border bg-card/65 px-4.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Copyright and Back to Top Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:justify-end">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Smart Bike Rental. All rights reserved.
          </p>

          {showScroll && (
            <button
              onClick={scrollToTop}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-105 outline-none focus:ring-2 focus:ring-ring"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

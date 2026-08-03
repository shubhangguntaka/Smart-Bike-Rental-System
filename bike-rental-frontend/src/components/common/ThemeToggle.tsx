import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options: {
        value: Theme;
        label: string;
        icon: React.ReactNode;
    }[] = [
            {
                value: "light",
                label: "Light",
                icon: <Sun size={18} />,
            },
            {
                value: "dark",
                label: "Dark",
                icon: <Moon size={18} />,
            },
            {
                value: "system",
                label: "System",
                icon: <Monitor size={18} />,
            },
        ];

    const handleThemeChange = async (
        event: React.MouseEvent<HTMLButtonElement>,
        newTheme: Theme
    ) => {
        const x = event.clientX;
        const y = event.clientY;

        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            setTheme(newTheme);
        });

        await transition.ready;

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 700,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        );
    };

    return (
        <div className="inline-flex rounded-2xl border border-border bg-card/80 p-1 shadow-lg backdrop-blur-md">
            {options.map((option) => {
                const active = theme === option.value;

                return (
                    <motion.button
                        key={option.value}
                        layout
                        whileHover={{
                            scale: 1.03,
                        }}
                        whileTap={{
                            scale: 0.96,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 30,
                        }}
                        onClick={(e) => handleThemeChange(e, option.value)}
                        className="relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-medium"
                    >
                        {active && (
                            <motion.div
                                layoutId="theme-active"
                                className="absolute inset-0 rounded-xl bg-primary"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}

                        <span
                            className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${active
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                                }`}
                        >
                            {option.icon}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
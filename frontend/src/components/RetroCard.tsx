import React from "react";

interface RetroCardProps {
	children: React.ReactNode;
	className?: string;
	glow?: boolean;
	onClick?: () => void | Promise<void>;
}

export const RetroCard: React.FC<RetroCardProps> = ({
	children,
	className = "",
	glow = false,
	onClick,
}) => {
	return (
		<div
			className={`border-2 border-green-500 bg-black p-6 ${
				glow ? "shadow-[0_0_20px_rgba(34,197,94,0.5)]" : ""
			} ${className}`}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

import clsx from "clsx";
import React from "react";
import { FC } from "react";

type TStackProps = { children: React.ReactNode; className?: string };

export const HStack: FC<TStackProps> = ({ children, className }) => {
  return <div className={clsx("flex flex-row", className)}>{children}</div>;
};
export const VStack: FC<TStackProps> = ({ children, className }) => {
  return <div className={clsx("flex flex-col", className)}>{children}</div>;
};

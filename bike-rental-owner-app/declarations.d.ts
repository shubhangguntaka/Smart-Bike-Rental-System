/// <reference types="nativewind/types" />

declare module "*.css" {
  const content: any;
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

declare module "expo-splash-screen";
declare module "expo-secure-store";
declare module "expo-location";

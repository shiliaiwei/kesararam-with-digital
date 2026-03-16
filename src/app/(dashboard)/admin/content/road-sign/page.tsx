import { Metadata } from "next";
import { TrafficSignsContent } from "./traffic-signs-content";

export const metadata: Metadata = {
  title: "Traffic Signs Content | Admin",
  description: "Manage traffic signs content, images, descriptions, and audio",
};

export default function TrafficSignsContentPage() {
  return <TrafficSignsContent />;
}
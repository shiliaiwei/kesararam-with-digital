import { Metadata } from "next";
import { ContentManagement } from "./content-management";

export const metadata: Metadata = {
  title: "Content Management | Admin",
  description: "Manage all content categories for the driving theory platform",
};

export default function ContentPage() {
  return <ContentManagement />;
}